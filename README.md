# FFG Result Analysis GUI

Ứng dụng quản lý bệnh nhân và kết quả xét nghiệm, hỗ trợ **preview báo cáo** và **xuất PDF** theo mẫu.

- Backend lưu dữ liệu bằng SQLite.
- Frontend React + Vite + Ant Design, có trang **Cài đặt** để tuỳ biến giao diện PDF (màu, ảnh, icons...).

## ✨ Tính năng chính

- **Đăng nhập / phân quyền** (JWT).
- **Quản lý bệnh nhân**: thêm/sửa/xoá, tìm kiếm, xem lịch sử.
- **Quản lý kết quả xét nghiệm**: tạo mới, chỉnh sửa, nhân bản, xem chi tiết.
- **Form nhập liệu**: nhóm chỉ số, thang màu/đánh giá, phần nhận xét.
- **Preview báo cáo**: hiển thị theo đúng bố cục trang A4.
- **Xuất PDF chất lượng cao**: render theo từng trang `.pdf-page` để pagination ổn định.
- **Excel template / import**: tải file mẫu và nhập dữ liệu từ Excel (SheetJS/xlsx).

## 🧰 Chức năng hỗ trợ (Trang Cài đặt)

Trang **Settings** cho phép tuỳ biến các “PDF assets” và một số hiển thị trong báo cáo. Các thay đổi được **lưu trên trình duyệt (localStorage)**.

- **Logo** trong PDF.
- **Banner gradient** (màu nền tiêu đề).
- **Ảnh Thalassaemia** (dùng trong mục Thalassaemia).
- **Organ icons**: icon cho Tim mạch / Huyết học / Gan / Thận.
- **Deep Dive icons (tuỳ chọn)**: icon cho Cardiovascular / Liver / Inflammation.
- **Evaluation icons (tuỳ chọn)**: icon cho Chưa tốt / Ưu điểm / Đánh giá chung.
- **Thanh 5 mức (FiveLevelBar)**: màu 5 ô + marker (màu/viền/kích thước/ảnh marker).
- **Health Score gauge**: chỉnh màu các nấc (đang hỗ trợ 8 nấc), độ dày cung, màu kim.

## 🧱 Tech stack

### Server
- Node.js + Express
- SQLite (better-sqlite3)
- JWT, bcryptjs

### Client
- React 18 + Vite
- TailwindCSS
- Ant Design
- Zustand (persist)
- React Router
- Recharts
- Xuất PDF: html2canvas + jsPDF (capture theo từng trang)
- Excel: SheetJS (xlsx)

## 📦 Cài đặt & chạy dự án

### 1) Cài dependencies

```bash
npm run install:all
```

### 2) Khởi tạo database (seed)

```bash
npm run init-db
```

Tạo database SQLite với các bảng:
- `users`
- `patients`
- `test_results`

Tài khoản mặc định:
- Admin: `admin` / `admin123`
- Doctor: `doctor1` / `doctor123`
- Nurse: `nurse1` / `nurse123`

### 3) Chạy development

Mở 2 terminal:

```bash
npm run dev
# API: http://localhost:3000
```

```bash
npm run client:dev
# Client: http://localhost:5174
# Proxy /api -> http://localhost:3000
```

## 🏭 Build production

```bash
npm run build
# Build client và copy vào server/public (Windows: xcopy)

npm start
# Chạy server phục vụ API + static build
```

## 📁 Cấu trúc thư mục

```
ffg-result-analysis-gui/
├── server/                 # Backend
│   ├── index.js           # Entry point
│   ├── database.js        # SQLite setup
│   ├── init-db.js         # Database seeder
│   ├── data/              # SQLite database file
│   └── routes/
│       ├── auth.js        # Authentication routes
│       ├── patients.js    # Patient management
│       └── results.js     # Test results management
│
├── client/                 # Frontend (React + Vite)
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx       # Entry point
│       ├── App.jsx        # Router setup
│       ├── index.css      # Global styles + Tailwind
│       ├── services/
│       │   └── api.js     # Axios API calls
│       ├── stores/
│       │   ├── authStore.js    # Auth state (Zustand)
│       │   └── resultStore.js  # Form state (Zustand)
│       ├── layouts/
│       │   └── MainLayout.jsx  # App layout with sidebar
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── PatientsPage.jsx
│       │   ├── ResultsPage.jsx
│       │   ├── ResultFormPage.jsx   # Form nhập liệu
│       │   └── ResultViewPage.jsx   # Xem + Export PDF
│       └── components/
│           ├── GaugeInput.jsx       # Input cho gauge
│           ├── GaugeChart.jsx       # Hiển thị gauge
│           ├── LabResultInput.jsx   # Input cho lab result
│           └── LabResultRow.jsx     # Hiển thị lab result
│
└── package.json
```

## 🔐 API endpoints (tóm tắt)

### Auth
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Patients
- `GET /api/patients` - Danh sách bệnh nhân
- `GET /api/patients/search?q=` - Tìm kiếm
- `GET /api/patients/:id` - Chi tiết bệnh nhân
- `POST /api/patients` - Thêm mới
- `PUT /api/patients/:id` - Cập nhật
- `DELETE /api/patients/:id` - Xóa

### Results
- `GET /api/results` - Danh sách kết quả
- `GET /api/results/search` - Tìm kiếm
- `GET /api/results/:id` - Chi tiết
- `POST /api/results` - Tạo mới
- `PUT /api/results/:id` - Cập nhật
- `DELETE /api/results/:id` - Xóa
- `POST /api/results/:id/duplicate` - Nhân bản

## 📱 Tài khoản mật khẩu mặc định:

admin
admin123

## 📝 License

ISC (xem `package.json`).
