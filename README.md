# 🌸 Hiền Xinh Beauty Center - Web App Quản Lý Spa & Thẩm Mỹ Viện

> Hệ thống quản lý thẩm mỹ viện tinh gọn, chuẩn phong cách sang trọng hiện đại với tone màu đỏ ruby gradient và trắng ngọc trai.

---

## 🚀 Tính Năng Chính

1. **Phân quyền người dùng 3 cấp độ (Role-Based Access Control)**:
   - **Chủ**: Toàn quyền truy cập tất cả 7 phân hệ bao gồm Báo cáo hoạt động kinh doanh (HĐKD) và doanh thu tài chính.
   - **Quản lý (QL)**: Quản lý khách hàng, nhập và duyệt hóa đơn, chi phí, báo cáo hoa hồng nhân sự (bị ẩn Báo cáo HĐKD).
   - **Nhân viên**: Nhập hóa đơn dịch vụ, quản lý khách hàng, theo dõi chi phí và xem báo cáo hoa hồng cá nhân (bị ẩn Danh sách hóa đơn & Báo cáo HĐKD).
2. **Tab 1: Trang chủ (Home)**:
   - Banner 3D nhận diện thương hiệu độc quyền với bục trụ xếp ly pastel, hoa sen 3D và typography cao cấp.
   - 4 thẻ thao tác nhanh: Khách hàng, Nhập hóa đơn, Danh sách hóa đơn, Chi phí.
3. **Tab 2: Quản lý Khách hàng**:
   - Tự động thu thập và cập nhật thông tin khách hàng khi xuất hóa đơn tại Tab 3 mà không cần nhập liệu thủ công.
   - Tìm kiếm, lọc theo nguồn khách hàng, nhóm khách hàng, phân trang và xuất dữ liệu CSV.
4. **Tab 3: Nhập Hóa Đơn & Tự Động Phân Bổ Hoa Hồng**:
   - Chọn gói dịch vụ với giá niêm yết và chiết khấu linh hoạt.
   - Tự động tính toán hoa hồng nhân sự tư vấn Online, tư vấn trực tiếp và kỹ thuật viên thực hiện trên doanh thu thực thu.
5. **Tab 4: Danh Sách Hóa Đơn**:
   - Tra cứu, xem chi tiết hóa đơn, in phiếu thu chuẩn nhận diện thương hiệu.
6. **Tab 5: Quản Lý Chi Phí**:
   - Thống kê chi phí theo ngày/tháng, dải băng phân loại danh mục, phân trang chuẩn xác.
7. **Tab 6: Báo Cáo Chuyên Sâu**:
   - **Báo cáo Hoa hồng (Tab 6.1)**: Tổng hợp hoa hồng nhân viên theo ngày, tỷ lệ % và chi tiết hóa đơn đóng góp.
   - **Báo cáo HĐKD (Tab 6.2)**: Doanh thu thực tế, chi phí, lợi nhuận thuần, dòng tiền tài khoản ngân hàng và cơ cấu dịch vụ.
8. **Tab 7: Cài Đặt Hệ Thống**:
   - Quản lý bảng giá dịch vụ, thông tin thương hiệu và xem ma trận phân quyền.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: React 18, Vite 8, Tailwind CSS 3, Lucide React Icons.
- **Backend**: Node.js, Express 5 REST API.
- **Data Persistence**: JSON Database (`data/db.json`).
- **Testing**: Puppeteer Core tự động kiểm thử trình duyệt thực tế (Headless Chrome).

---

## 💻 Hướng Dẫn Cài Đặt & Khởi Chạy

```bash
# 1. Clone repository
git clone https://github.com/taacademy-erp/hienxinh.git
cd hienxinh

# 2. Cài đặt thư viện dependencies
npm install

# 3. Build mã nguồn frontend
npm run build

# 4. Khởi chạy máy chủ ảo (Local Server)
npm start
# Ứng dụng sẽ hoạt động tại: http://localhost:3000

# 5. Chạy kiểm thử tự động trên trình duyệt Chrome (Auto-test)
npm run test:browser
```

---

## 🔑 Tài Khoản Thử Nghiệm

| Vai trò | Tên đăng nhập | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Chủ** | `chu` | `123456` | Toàn quyền 7 tab (Xem Báo cáo HĐKD & Doanh thu) |
| **Quản lý** | `quanly` | `123456` | Quản lý hóa đơn, khách hàng, chi phí (Ẩn Báo cáo HĐKD) |
| **Nhân viên** | `nhanvien` | `123456` | Nhập hóa đơn, hoa hồng, chi phí (Ẩn Danh sách hóa đơn & HĐKD) |

---
© 2026 Hiền Xinh Beauty Center. All rights reserved.
