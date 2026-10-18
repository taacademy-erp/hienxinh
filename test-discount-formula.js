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
  throw new Error('No Chrome or Edge browser found');
}

async function runTest() {
  console.log('🚀 Testing Discount Formula: Thành tiền = Giá niêm yết - Giá khuyến mãi...');
  const browser = await puppeteer.launch({
    executablePath: getBrowserPath(),
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    // Login as chu
    const userInputs = await page.$$('input');
    await userInputs[0].type('chu');
    await userInputs[1].type('123456');
    await page.evaluate(() => {
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    // Navigate to Tab Nhập hóa đơn
    await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('aside nav button'));
      const createBtn = allButtons.find(b => b.textContent.includes('Nhập hóa đơn'));
      if (createBtn) createBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Helper to set React input value
    await page.evaluate(() => {
      window.setReactValue = (input, val) => {
        if (!input) return;
        const lastValue = input.value;
        input.value = val;
        const tracker = input._valueTracker;
        if (tracker) {
          tracker.setValue(lastValue);
        }
        input.dispatchEvent(new Event('input', { bubbles: true }));
      };
    });

    // Fill customer info
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const nameInput = inputs.find(i => i.placeholder && i.placeholder.includes('Nguyễn Thị Mai'));
      const phoneInput = inputs.find(i => i.placeholder && i.placeholder.includes('0933003995'));
      window.setReactValue(nameInput, 'Chị Thu Hằng');
      window.setReactValue(phoneInput, '0977889900');
    });
    await new Promise(r => setTimeout(r, 400));

    // Initial state: listedPrice is 2.000.000, discount is 0, total should be 2.000.000đ
    await page.screenshot({ path: path.join(OUTPUT_DIR, '01_initial_no_discount.png'), fullPage: false });

    // Now set discountPrice to 300000
    console.log('⚡ Nhập Giá khuyến mãi = 300.000đ...');
    const resultAfterDiscount = await page.evaluate(() => {
      // Find the discount input in table row
      const inputs = Array.from(document.querySelectorAll('tbody input'));
      // In table row: index 0 is listedPrice, index 1 is discountPrice
      const discountInput = inputs[1];
      window.setReactValue(discountInput, '300000');

      // Read resulting Thành tiền text
      const totalCell = document.querySelector('tbody td:nth-child(5)');
      return {
        discountInputValue: discountInput ? discountInput.value : null,
        totalCellText: totalCell ? totalCell.innerText.trim() : null
      };
    });
    await new Promise(r => setTimeout(r, 600));

    console.log('   Discount Input Value:', resultAfterDiscount.discountInputValue);
    console.log('   Thành tiền Cell Text:', resultAfterDiscount.totalCellText);

    await page.screenshot({ path: path.join(OUTPUT_DIR, '02_after_discount_300k.png'), fullPage: false });

    // Save invoice
    console.log('⚡ Lưu hóa đơn...');
    await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      const saveBtn = allButtons.find(b => b.textContent.includes('Lưu hóa đơn'));
      if (saveBtn) saveBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Navigate to Tab Danh sách hóa đơn
    await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('aside nav button'));
      const listBtn = allButtons.find(b => b.textContent.includes('Danh sách hóa đơn'));
      if (listBtn) listBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '03_invoices_list_view.png'), fullPage: false });

    // Open detail modal
    console.log('🔍 Mở modal chi tiết hóa đơn để kiểm tra hiển thị Giá niêm yết, Giá khuyến mãi và Thành tiền...');
    await page.evaluate(() => {
      const codeBtn = document.querySelector('tbody button');
      if (codeBtn) codeBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '04_invoice_detail_modal_with_discount.png'), fullPage: false });

    console.log('🎉 KIỂM THỬ HOÀN TẤT THÀNH CÔNG!');
  } catch (err) {
    console.error('❌ Error during test:', err);
  } finally {
    await browser.close();
  }
}

runTest();
