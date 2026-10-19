const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'test-results-discount');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function getBrowserPath() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  if (fs.existsSync(chromePath)) return chromePath;
  if (fs.existsSync(edgePath)) return edgePath;
  throw new Error('No browser found');
}

async function run() {
  console.log('🚀 TESTING DISCOUNT INPUT AND FORMULA FLOW...');
  const browser = await puppeteer.launch({
    executablePath: getBrowserPath(),
    headless: true,
    args: ['--no-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    // Login
    const inputs = await page.$$('input');
    await inputs[0].type('chu');
    await inputs[1].type('123456');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 1000));

    // Go to Tab Nhập hóa đơn
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('aside button'));
      const btn = btns.find(b => b.textContent.includes('Nhập hóa đơn'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Helper to simulate React input entry
    await page.evaluate(() => {
      window.typeInCurrency = (input, val) => {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(input, val);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      };
    });

    // Fill customer info
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const nameInput = inputs.find(i => i.placeholder && i.placeholder.includes('Nguyễn Thị Mai'));
      const phoneInput = inputs.find(i => i.placeholder && i.placeholder.includes('0933003995'));
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(nameInput, 'Chị Khánh Ly');
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      nativeSetter.call(phoneInput, '0912345678');
      phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 300));

    // Step 1: Initial state before discount
    const initialInfo = await page.evaluate(() => {
      const rowInputs = document.querySelectorAll('tbody input');
      const listed = rowInputs[0] ? rowInputs[0].value : null;
      const discount = rowInputs[1] ? rowInputs[1].value : null;
      const totalCell = document.querySelector('tbody td:nth-child(5)').innerText.trim();
      return { listed, discount, totalCell };
    });
    console.log('📌 Trạng thái ban đầu:', initialInfo);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '01_initial_state.png'), fullPage: false });

    // Step 2: User types '100000' (hoặc '100.000') into Giá khuyến mãi
    console.log('⚡ Nhập thủ công Giá khuyến mãi: 100000 (tự động thêm dấu chấm -> 100.000)...');
    const afterDiscount = await page.evaluate(() => {
      const rowInputs = document.querySelectorAll('tbody input');
      const discountInput = rowInputs[1];
      window.typeInCurrency(discountInput, '100000');

      const totalCell = document.querySelector('tbody td:nth-child(5)').innerText.trim();
      const sumService = document.querySelector('tfoot td:nth-child(2)').innerText.trim();
      const sec3Total = document.querySelectorAll('input[readonly]')[0]?.value;
      const paidInput = document.querySelectorAll('input')[10]?.value;

      return {
        discountInputValue: discountInput.value,
        rowTotalCell: totalCell,
        sumServiceFooter: sumService,
        sec3TotalValue: sec3Total,
        paidInputValue: paidInput
      };
    });
    console.log('📌 Kết quả sau khi nhập 100.000:', afterDiscount);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '02_typed_100k_discount.png'), fullPage: false });

    // Step 3: Lưu hóa đơn
    console.log('⚡ Nhấn Lưu hóa đơn...');
    await page.evaluate(() => {
      const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Lưu hóa đơn'));
      if (saveBtn) saveBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Step 4: Chuyển qua Danh sách hóa đơn
    console.log('⚡ Chuyển sang Danh sách hóa đơn...');
    await page.evaluate(() => {
      const listBtn = Array.from(document.querySelectorAll('aside button')).find(b => b.textContent.includes('Danh sách hóa đơn'));
      if (listBtn) listBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '03_invoices_list.png'), fullPage: false });

    // Step 5: Mở modal chi tiết hóa đơn
    console.log('⚡ Mở modal chi tiết hóa đơn...');
    await page.evaluate(() => {
      const codeBtn = document.querySelector('tbody button');
      if (codeBtn) codeBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '04_invoice_detail_modal.png'), fullPage: false });

    const modalDetails = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0');
      return modal ? modal.innerText : '';
    });

    console.log('🎉 KIỂM THỬ HOÀN TẤT!');
    const passValue = afterDiscount.discountInputValue === '100.000';
    const passTotal = afterDiscount.rowTotalCell === '1.900.000đ';
    console.log('1. Giá khuyến mãi hiển thị định dạng 100.000:', passValue ? 'PASS ✅' : 'FAIL ❌');
    console.log('2. Thành tiền = 2.000.000 - 100.000 = 1.900.000đ:', passTotal ? 'PASS ✅' : 'FAIL ❌');
  } catch (err) {
    console.error('❌ Lỗi:', err);
  } finally {
    await browser.close();
  }
}

run();
