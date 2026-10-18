const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'test-results');
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
  console.log('🚀 Running visual verification of all 5 requested fixes...');
  const browser = await puppeteer.launch({
    executablePath: getBrowserPath(),
    headless: true,
    args: ['--no-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const BASE_URL = 'http://localhost:3000';

  // 1. Login as Owner
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Chủ');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Screenshot 1: Check Home with compact banner & Header with Owner
  console.log('📸 1. Trang chủ with compact banner and Header with Owner...');
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'fix_01_home_and_owner_header.png') });

  // Screenshot 2: Check Tab Nhập hóa đơn (+ Thêm nhân viên single plus)
  console.log('📸 2. Tab Nhập hóa đơn: Thêm nhân viên single plus...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('aside nav button')).find(b => b.textContent.includes('Nhập hóa đơn'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'fix_02_create_invoice_single_plus.png') });

  // Screenshot 3: Check Tab Danh sách hóa đơn with CalendarDatePicker opened
  console.log('📸 3. Tab Danh sách hóa đơn: Calendar DatePicker popover...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('aside nav button')).find(b => b.textContent.includes('Danh sách hóa đơn'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  // Switch to "Lọc theo ngày"
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Lọc theo ngày');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  // Click on the CalendarDatePicker input button
  await page.evaluate(() => {
    const calInput = document.querySelector('div[class*="min-w-[140px]"]');
    if (calInput) calInput.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'fix_03_invoices_calendar_popover.png') });

  // Screenshot 4: Check Tab Chi phí with 2 summary cards, 4 categories & CalendarDatePicker
  console.log('📸 4. Tab Chi phí: 2 cards only and 4 categories (marketing, mặt bằng, mỹ phẩm, nhân sự)...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('aside nav button')).find(b => b.textContent.includes('Chi phí'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  // Open calendar popover in Chi phí
  await page.evaluate(() => {
    const calInput = document.querySelector('div[class*="min-w-[140px]"]');
    if (calInput) calInput.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'fix_04_expenses_2_cards_and_calendar.png') });

  await browser.close();
  console.log('✅ Visual verification complete!');
}

run().catch(console.error);
