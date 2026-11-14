window.GRAD_UTILS = {
  escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
};

window.GRAD_THEMES = {
  "ivory": {
    "particleRgb": "184, 134, 59",
    "confetti": [
      "#b8863b",
      "#e3be76",
      "#ffffff",
      "#d97706",
      "#8c6239"
    ]
  },
  "sage": {
    "particleRgb": "47, 107, 79",
    "confetti": [
      "#2f6b4f",
      "#68a888",
      "#ffffff",
      "#d4af37",
      "#a3c9b5"
    ]
  },
  "blush": {
    "particleRgb": "181, 77, 103",
    "confetti": [
      "#b54d67",
      "#e694a8",
      "#ffffff",
      "#f5c2cc",
      "#d4af37"
    ]
  },
  "royal": {
    "particleRgb": "30, 78, 184",
    "confetti": [
      "#1e4eb8",
      "#6093f5",
      "#ffffff",
      "#f59e0b",
      "#93c5fd"
    ]
  },
  "midnight": {
    "particleRgb": "243, 224, 159",
    "confetti": [
      "#f3e09f",
      "#d4af37",
      "#ffffff",
      "#4f8cff",
      "#ffcf5c"
    ]
  }
};

window.GRAD_CONFIG = {
  "theme": "ivory",
  "customAccent": "",
  "customBg": "",
  "headlineFormat": "classic",
  "chibiEnabled": true,
  "chibiMode": "guide-info",
  "chibiTimeMsg": "Lưu lịch này nha! ⏰",
  "chibiPlaceMsg": "Địa điểm ở đây! 📍",
  "photoLayout": "polaroid",
  "photos": [],
  "envLabel": "Thiệp Mời Tốt Nghiệp",
  "envHeadlineTpl": "Kính mời: {ten}",
  "envHint": "",
  "envBtnText": "✨ Mở Thiệp Ngay",
  "badgeText": "Lễ Tốt Nghiệp 2026",
  "headlineTpl": "Kính mời bạn Mai Duyên tham dự lễ tốt nghiệp của",
  "hostName": "Nguyễn Minh Hưng",
  "degree": "Tân Cử Nhân • ĐH Bách Khoa TP.HCM",
  "message": "Mời bạn tham dự lễ tốt nghiệp của tôi",
  "timeLabel": "Thời gian",
  "timeValue": "9 – 11:30 | Thứ Bảy, 28/11/2026",
  "placeLabel": "Địa điểm",
  "placeValue": "Đại học Bách Khoa TP.HCM - Cơ sở 1",
  "parkingTitle": "📍 Địa Chỉ & Hướng Dẫn Gửi Xe",
  "addressLabel": "Địa chỉ:",
  "addressValue": "268 Lý Thường Kiệt, P.14, Q.10, TP. Hồ Chí Minh",
  "gate1Title": "🛵 Cổng 1 – Đường Lý Thường Kiệt",
  "gate1Desc": "Đi vào cổng chính đường Lý Thường Kiệt, gửi xe tại bãi xe khu A ngay bên trái.",
  "gate1BtnText": "🗺️ Google Maps Cổng 1",
  "gate1Url": "https://www.google.com/maps/place/%C4%90%E1%BA%A1i+H%E1%BB%8Dc+B%C3%A1ch+Khoa+-+268+L%C3%BD+Th%C6%B0%E1%BB%9Dng+Ki%E1%BB%87t/@10.7729016,106.6589643,18z/data=!4m10!1m2!2m1!1s268+Ly+Thuong+Kiet+Quan+10+TP+HCM!3m6!1s0x31752ec17709146b:0x54a1658a0639d341!8m2!3d10.772603!4d106.657698!15sCiEyNjggTHkgVGh1b25nIEtpZXQgUXVhbiAxMCBUUCBIQ02SAQhidXNfc3RvcOABAA!16s%2Fg%2F11_r5pscj?entry=ttu&g_ep=EgoyMDI2MTExMC4wIKXMDSoASAFQAw%3D%3D",
  "gate2Title": "🛵 Cổng 2 – Đường Tô Hiến Thành",
  "gate2Desc": "Đi từ hướng Tô Hiến Thành vào cổng sau, gửi xe tại khu vực bãi xe B.",
  "gate2BtnText": "🗺️ Google Maps Cổng 3",
  "gate2Url": "https://www.google.com/maps/place/C%E1%BB%95ng+sau+(c%E1%BB%95ng+3)+%C4%90%E1%BA%A1i+h%E1%BB%8Dc+B%C3%A1ch+Khoa+TP.HCM/@10.7728271,106.660046,18z/data=!4m9!1m2!2m1!1s268+Ly+Thuong+Kiet+Quan+10+TP+HCM!3m5!1s0x31752f851e9af66d:0x2bad2b0deedec374!8m2!3d10.7736185!4d106.6612596!16s%2Fg%2F11l6v50yjd?entry=ttu&g_ep=EgoyMDI2MTExMC4wIKXMDSoASAFQAw%3D%3D",
  "showCallBtn": true,
  "callBtnText": "Call me",
  "phone": "",
  "showCelebrateBtn": true,
  "celebrateBtnText": "0931448504",
  "footerTpl": "Hẹn gặp {ten} tại buổi lễ nhé!"
};

window.GRAD_PRESETS = {
  "friendly": {
    "headlineTpl": "Kính mời bạn {ten} tham dự lễ tốt nghiệp của tôi",
    "message": "Sau bao ngày nỗ lực học tập, cuối cùng chặng đường đại học của tôi cũng sắp khép lại. Sự có mặt và lời chúc mừng của bạn là món quà tuyệt vời nhất giúp ngày đặc biệt này trở nên trọn vẹn!"
  },
  "formal": {
    "headlineTpl": "Trân trọng kính mời {ten} tham dự Lễ Tốt Nghiệp",
    "message": "Tôi xin trân trọng kính mời sự hiện diện quý báu của bạn đến chung vui và chứng kiến cột mốc đánh dấu sự trưởng thành của tôi tại trường."
  },
  "warm": {
    "headlineTpl": "Thương mời {ten} đến chung vui ngày tốt nghiệp cùng tôi",
    "message": "Cảm ơn vì đã luôn đồng hành, động viên và tiếp thêm sức mạnh cho tôi trong suốt những năm tháng qua. Rất mong được chụp cùng bạn những bức ảnh kỷ niệm thật đẹp!"
  },
  "genz": {
    "headlineTpl": "Triệu hồi {ten} tới lễ tốt nghiệp của tôi!",
    "message": "Tin nóng: Tôi sắp chính thức tốt nghiệp ra trường rồi đây! Rất mong bạn ghé qua check-in, nhận nụ cười rạng rỡ và lưu lại vài tấm ảnh 'ngàn like' cùng mình nha!"
  }
};
