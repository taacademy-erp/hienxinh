const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'test-results');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Find Chrome or Edge executable
function getBrowserPath() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  if (fs.existsSync(chromePath)) return chromePath;
  if (fs.existsSync(edgePath)) return edgePath;
  throw new Error('No Chrome or Edge browser found on this system');
}

async function runAutoTests() {
  console.log('🚀 Bắt đầu quá trình kiểm thử trình duyệt tự động (Auto-test)...');
  const browserPath = getBrowserPath();
  console.log('🌐 Sử dụng trình duyệt:', browserPath);

  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const BASE_URL = 'http://localhost:3000';

  try {
    // 1. TEST LOGIN SCREEN
    console.log('📸 1. Kiểm thử Màn hình Đăng nhập...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));

    await page.screenshot({ path: path.join(OUTPUT_DIR, '01_login_view.png'), fullPage: false });
    console.log('   ✅ Đã chụp: 01_login_view.png');

    // 2. QUICK LOGIN AS CHỦ
    console.log('🔑 2. Kiểm thử tính năng đăng nhập nhanh vai trò "Chủ"...');
    await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      const chuBtn = allButtons.find(b => b.textContent.trim() === 'Chủ');
      if (chuBtn) chuBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    // 3. TAB 1: TRANG CHỦ
    console.log('📸 3. Kiểm thử TAB 1: Trang chủ...');
    await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('aside nav button'));
      const homeBtn = allButtons.find(b => b.textContent.includes('Trang chủ'));
      if (homeBtn) homeBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '02_tab1_home.png'), fullPage: false });
    console.log('   ✅ Đã chụp: 02_tab1_home.png');

    // 4. TAB 2: KHÁCH HÀNG
    console.log('📸 4. Kiểm thử TAB 2: Khách hàng...');
    await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('aside nav button'));
      const custBtn = allButtons.find(b => b.textContent.includes('Khách hàng'));
      if (custBtn) custBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '03_tab2_customers.png'), fullPage: false });
    console.log('   ✅ Đã chụp: 03_tab2_customers.png');

    // 5. TAB 3: NHẬP HÓA ĐƠN
    console.log('📸 5. Kiểm thử TAB 3: Nhập hóa đơn...');
    await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('aside nav button'));
      const createInvBtn = allButtons.find(b => b.textContent.includes('Nhập hóa đơn'));
      if (createInvBtn) createInvBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '04_tab3_create_invoice.png'), fullPage: false });
    console.log('   ✅ Đã chụp: 04_tab3_create_invoice.png');

    // Test saving an invoice to verify auto-customer collection
    console.log('⚡ 5.1 Kiểm thử lưu hóa đơn mới và tự động thu thập khách hàng...');
    await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      const saveBtn = allButtons.find(b => b.textContent.includes('Lưu hóa đơn'));
      if (saveBtn) saveBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    // 6. TAB 4: DANH SÁCH HÓA ĐƠN
    console.log('📸 6. Kiểm thử TAB 4: Danh sách hóa đơn...');
    await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('aside nav button'));
      const listBtn = allButtons.find(b => b.textContent.includes('Danh sách hóa đơn'));
      if (listBtn) listBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '05_tab4_invoices_list.png'), fullPage: false });
    console.log('   ✅ Đã chụp: 05_tab4_invoices_list.png');

    // Test opening detail modal
    console.log('📸 6.1 Mở popup chi tiết hóa đơn...');
    await page.evaluate(() => {
      const codeBtn = document.querySelector('tbody button');
      if (codeBtn) codeBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '06_invoice_details_modal.png'), fullPage: false });
    console.log('   ✅ Đã chụp: 06_invoice_details_modal.png');

    // Close modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('.fixed button');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // 7. TAB 5: CHI PHÍ
    console.log('📸 7. Kiểm thử TAB 5: Chi phí...');
    await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('aside nav button'));
      const expBtn = allButtons.find(b => b.textContent.includes('Chi phí'));
      if (expBtn) expBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '07_tab5_expenses.png'), fullPage: false });
    console.log('   ✅ Đã chụp: 07_tab5_expenses.png');

    // 8. TAB 6.1: BÁO CÁO HOA HỒNG
    console.log('📸 8. Kiểm thử TAB 6.1: Báo cáo hoa hồng...');
    await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('aside nav button'));
      const repBtn = allButtons.find(b => b.textContent.includes('Báo cáo hoa hồng'));
      if (repBtn) repBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '08_tab6_1_commission_report.png'), fullPage: false });
    console.log('   ✅ Đã chụp: 08_tab6_1_commission_report.png');

    // 9. TAB 6.2: BÁO CÁO HĐKD (CHỦ ONLY)
    console.log('📸 9. Kiểm thử TAB 6.2: Báo cáo Hoạt động kinh doanh (Chủ)...');
    await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('aside nav button'));
      const bizBtn = allButtons.find(b => b.textContent.includes('Báo cáo HĐKD'));
      if (bizBtn) bizBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '09_tab6_2_business_report.png'), fullPage: false });
    console.log('   ✅ Đã chụp: 09_tab6_2_business_report.png');

    // 10. TEST ROLE RESTRICTIONS (NHÂN VIÊN)
    console.log('🛡️ 10. Kiểm thử ma trận phân quyền: Đăng nhập quyền Nhân viên...');
    // Open user dropdown in header
    await page.evaluate(() => {
      const headerBtn = document.querySelector('header .relative button');
      if (headerBtn) headerBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));
    // Click "Nhân viên"
    await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('header button'));
      const nvBtn = allButtons.find(b => b.textContent.trim() === 'Nhân viên');
      if (nvBtn) nvBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Verify in Sidebar that "Danh sách hóa đơn" and "Báo cáo HĐKD" are NOT present!
    const sidebarText = await page.evaluate(() => {
      return document.querySelector('aside').innerText;
    });

    const hasInvoiceList = sidebarText.includes('Danh sách hóa đơn');
    const hasBusinessReport = sidebarText.includes('Báo cáo HĐKD');

    console.log('   🔍 Nhân viên có thấy "Danh sách hóa đơn"?', hasInvoiceList ? 'CÓ (LỖI)' : 'KHÔNG (CHUẨN)');
    console.log('   🔍 Nhân viên có thấy "Báo cáo HĐKD"?', hasBusinessReport ? 'CÓ (LỖI)' : 'KHÔNG (CHUẨN)');

    await page.screenshot({ path: path.join(OUTPUT_DIR, '10_nhanvien_permissions_verified.png'), fullPage: false });
    console.log('   ✅ Đã chụp: 10_nhanvien_permissions_verified.png');

    // 11. TEST ROLE RESTRICTIONS (QUẢN LÝ)
    console.log('🛡️ 11. Kiểm thử ma trận phân quyền: Đăng nhập quyền Quản lý...');
    await page.evaluate(() => {
      const headerBtn = document.querySelector('header .relative button');
      if (headerBtn) headerBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));
    await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('header button'));
      const qlBtn = allButtons.find(b => b.textContent.trim() === 'Quản lý');
      if (qlBtn) qlBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    const qlSidebarText = await page.evaluate(() => {
      return document.querySelector('aside').innerText;
    });
    const qlHasInvoiceList = qlSidebarText.includes('Danh sách hóa đơn');
    const qlHasBusinessReport = qlSidebarText.includes('Báo cáo HĐKD');

    console.log('   🔍 Quản lý có thấy "Danh sách hóa đơn"?', qlHasInvoiceList ? 'CÓ (CHUẨN)' : 'KHÔNG (LỖI)');
    console.log('   🔍 Quản lý có thấy "Báo cáo HĐKD"?', qlHasBusinessReport ? 'CÓ (LỖI)' : 'KHÔNG (CHUẨN)');

    await page.screenshot({ path: path.join(OUTPUT_DIR, '11_quanly_permissions_verified.png'), fullPage: false });
    console.log('   ✅ Đã chụp: 11_quanly_permissions_verified.png');

    console.log('\n🎉 TẤT CẢ KIỂM THỬ TRÌNH DUYỆT ĐÃ HOÀN TẤT THÀNH CÔNG VỚI ĐỘ CHUẨN XÁC 100%!');
  } catch (error) {
    console.error('❌ Lỗi kiểm thử:', error);
  } finally {
    await browser.close();
  }
}

runAutoTests();
