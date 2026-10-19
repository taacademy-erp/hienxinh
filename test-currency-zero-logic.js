const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

function getBrowserPath() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  if (fs.existsSync(chromePath)) return chromePath;
  if (fs.existsSync(edgePath)) return edgePath;
  throw new Error('No browser found');
}

async function run() {
  console.log('🚀 TESTING CURRENCYINPUT ZERO AND INTL.NUMBERFORMAT LOGIC...');
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

    // Navigate to Nhập hóa đơn
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('aside button'));
      const btn = btns.find(b => b.textContent.includes('Nhập hóa đơn'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Function to simulate typing into the discount input
    const testInput = async (valueToType, label) => {
      return await page.evaluate((val) => {
        const discountInput = document.querySelectorAll('tbody input')[1];
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(discountInput, val);
        discountInput.dispatchEvent(new Event('input', { bubbles: true }));
        discountInput.dispatchEvent(new Event('change', { bubbles: true }));

        const totalCell = document.querySelector('tbody td:nth-child(5)').innerText.trim();
        return {
          inputValue: discountInput.value,
          totalCellText: totalCell
        };
      }, valueToType);
    };

    // Test 1: Type '0'
    console.log('\n[Test 1] Nhập số "0" vào ô Giá khuyến mãi:');
    const res1 = await testInput('0', 'Nhập 0');
    console.log('   Giá trị hiển thị:', res1.inputValue, '(Kỳ vọng: "0")');
    console.log('   Thành tiền:', res1.totalCellText, '(Kỳ vọng: "2.000.000đ")');
    const pass1 = res1.inputValue === '0' && res1.totalCellText === '2.000.000đ';
    console.log('   -> Kết quả:', pass1 ? 'PASS ✅' : 'FAIL ❌');

    // Test 2: Type '100000' (gõ số thuần túy với các số 0)
    console.log('\n[Test 2] Nhập số thuần túy "100000" (nhiều số 0):');
    const res2 = await testInput('100000', 'Nhập 100000');
    console.log('   Giá trị hiển thị:', res2.inputValue, '(Kỳ vọng: "100.000")');
    console.log('   Thành tiền:', res2.totalCellText, '(Kỳ vọng: "1.900.000đ")');
    const pass2 = res2.inputValue === '100.000' && res2.totalCellText === '1.900.000đ';
    console.log('   -> Kết quả:', pass2 ? 'PASS ✅' : 'FAIL ❌');

    // Test 3: Type '100.000' (gõ kèm dấu chấm)
    console.log('\n[Test 3] Nhập "100.000" (kèm dấu chấm):');
    const res3 = await testInput('100.000', 'Nhập 100.000');
    console.log('   Giá trị hiển thị:', res3.inputValue, '(Kỳ vọng: "100.000")');
    console.log('   Thành tiền:', res3.totalCellText, '(Kỳ vọng: "1.900.000đ")');
    const pass3 = res3.inputValue === '100.000' && res3.totalCellText === '1.900.000đ';
    console.log('   -> Kết quả:', pass3 ? 'PASS ✅' : 'FAIL ❌');

    // Test 4: Gõ lại số '0'
    console.log('\n[Test 4] Gõ lại số "0" sau khi đã có giá trị:');
    const res4 = await testInput('0', 'Gõ lại 0');
    console.log('   Giá trị hiển thị:', res4.inputValue, '(Kỳ vọng: "0")');
    console.log('   Thành tiền:', res4.totalCellText, '(Kỳ vọng: "2.000.000đ")');
    const pass4 = res4.inputValue === '0' && res4.totalCellText === '2.000.000đ';
    console.log('   -> Kết quả:', pass4 ? 'PASS ✅' : 'FAIL ❌');

    // Test 5: Xóa trống ô (empty string)
    console.log('\n[Test 5] Xóa trống ô nhập (""):');
    const res5 = await testInput('', 'Xóa trống');
    console.log('   Giá trị hiển thị:', res5.inputValue, '(Kỳ vọng: "")');
    console.log('   Thành tiền:', res5.totalCellText, '(Kỳ vọng: "2.000.000đ")');
    const pass5 = res5.inputValue === '' && res5.totalCellText === '2.000.000đ';
    console.log('   -> Kết quả:', pass5 ? 'PASS ✅' : 'FAIL ❌');

    // Capture screenshot
    await testInput('100000', '100k');
    const screenPath = path.join(__dirname, 'test-results-discount', 'verified_intl_format_100k.png');
    await page.screenshot({ path: screenPath });
    console.log('\n📸 Đã chụp ảnh màn hình:', screenPath);

    const allPassed = pass1 && pass2 && pass3 && pass4 && pass5;
    console.log('\n====================================');
    console.log(allPassed ? '🎉 TẤT CẢ 5 BÀI TEST ĐỀU THÀNH CÔNG (PASS 100%)' : '❌ CÓ BÀI TEST THẤT BẠI');
    console.log('====================================');
  } catch (err) {
    console.error('❌ Error during test:', err);
  } finally {
    await browser.close();
  }
}

run();
