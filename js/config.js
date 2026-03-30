/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║       KAS HOUZING — CẤU HÌNH WEBSITE                    ║
 * ║  Admin có thể thay đổi thông tin tại đây                ║
 * ╚══════════════════════════════════════════════════════════╝
 * 
 * HƯỚNG DẪN: Chỉ cần thay đổi giá trị bên trong dấu '' hoặc ""
 * Sau khi thay đổi, lưu file và refresh lại trang web.
 */

const CONFIG = {

  // ─────────────────────────────────────────────
  //  1. THÔNG TIN THƯƠNG HIỆU
  // ─────────────────────────────────────────────
  BRAND: {
    name: 'Kas Houzing',                          // Tên thương hiệu chính
    tagline: 'Architecture & Interior Design',     // Dòng mô tả bên cạnh tên
    slogan: 'MỘT ĐIỂM CHẠM, VẠN TINH HOA!',     // Slogan hiển thị ở Hero (đã bỏ dấu cách thừa)
    description: 'Thiết kế & Thi công Nội thất Cao cấp — Chìa khóa trao tay',
    
    // Logo: để trống '' nếu chưa có, điền link ảnh logo khi có
    // Ví dụ: 'images/logo.png' hoặc 'https://link-anh-logo.com/logo.png'
    logoUrl: '',
    
    // Link website chính (để sau khi có domain)
    websiteUrl: '',
  },

  // ─────────────────────────────────────────────
  //  2. THÔNG TIN LIÊN HỆ
  // ─────────────────────────────────────────────
  CONTACT: {
    email: 'Noithatkas@gmail.com',
    phone: '',                                     // Số điện thoại — điền sau
    address: '01 Louis 1, Louis City Đại Mỗ, Hà Nội',
  },

  // ─────────────────────────────────────────────
  //  3. MẠNG XÃ HỘI
  // ─────────────────────────────────────────────
  // Để trống '' nếu không có tài khoản ở mạng đó
  SOCIAL: {
    facebook: 'https://www.facebook.com/KAS.houzing/',
    instagram: '',
    youtube: '',
    tiktok: '',
    zalo: '',
  },

  // ─────────────────────────────────────────────
  //  4. CẤU HÌNH PORTFOLIO (HIỂN THỊ DỰ ÁN)
  // ─────────────────────────────────────────────
  PORTFOLIO: {
    // Danh mục lọc dự án — thêm/bớt danh mục tại đây
    categories: [
      { key: 'all', label: 'Tất cả' },
      { key: 'villa', label: 'Biệt thự' },
      { key: 'apartment', label: 'Căn hộ' },
      { key: 'penthouse', label: 'Penthouse' },
      { key: 'office', label: 'Văn phòng' },
    ],
    sectionTitle: 'Dự Án',
    sectionHighlight: 'Nổi Bật',
    sectionDesc: 'Những công trình thể hiện đẳng cấp và phong cách thiết kế độc đáo của Kas Houzing',
  },

  // ─────────────────────────────────────────────
  //  5. CẤU HÌNH GOOGLE DRIVE (LẤY DỮ LIỆU DỰ ÁN)
  // ─────────────────────────────────────────────
  GOOGLE_DRIVE: {
    apiKey: 'AIzaSyBZuUYnI3QCYT1HgbffZSX39Pgop4HdFiU',                                    // API Key từ Google Cloud Console
    rootFolderId: '1Aj1nGzsz8dmDbUXjHD8Fqw0fwdhw7Jar',                              // ID folder gốc trên Drive
  },

  // Bật = true: dùng dữ liệu mẫu (demo)
  // Tắt = false: lấy dữ liệu từ Google Drive
  DEMO_MODE: false,

  // ─────────────────────────────────────────────
  //  6. CẤU HÌNH KỸ THUẬT (không cần thay đổi)
  // ─────────────────────────────────────────────
  FLIPBOOK: {
    maxWidth: 500,
    maxHeight: 700,
    minWidth: 300,
    minHeight: 400,
  },

  // Dịch vụ gửi form liên hệ (FormSubmit.co - miễn phí)
  FORM_ENDPOINT: 'https://formsubmit.co/ajax/Noithatkas@gmail.com',
};
