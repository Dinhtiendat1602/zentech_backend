import sequelize from '../config/db.js';
import { User, Product, Review, Order, OrderItem } from '../models/index.js';

// Danh sách khách hàng mẫu để tạo đánh giá
const sampleUsers = [
  {
    fullName: 'Hoàng Minh Tuấn',
    email: 'tuan.hoang@cameratest.vn',
    phone: '0912345671',
    address: 'Số 45 Tràng Tiền, Hoàn Kiếm, Hà Nội',
    role: 'customer',
  },
  {
    fullName: 'Phạm Hải Đăng',
    email: 'haidang.pham@cameratest.vn',
    phone: '0912345672',
    address: '128 Nguyễn Thị Minh Khai, Q.3, TP. Hồ Chí Minh',
    role: 'customer',
  },
  {
    fullName: 'Vũ Thùy Linh',
    email: 'thuylinh.vu@cameratest.vn',
    phone: '0912345673',
    address: '25 Lê Duẩn, Hải Châu, Đà Nẵng',
    role: 'customer',
  },
  {
    fullName: 'Đặng Quốc Bảo',
    email: 'quocbao.dang@cameratest.vn',
    phone: '0912345674',
    address: '88 Hoàng Diệu, TP. Nha Trang',
    role: 'customer',
  },
  {
    fullName: 'Nguyễn Đức Huy',
    email: 'duchuy.nguyen@cameratest.vn',
    phone: '0912345675',
    address: '56 Trần Phú, TP. Cần Thơ',
    role: 'customer',
  },
  {
    fullName: 'Bùi Lan Anh',
    email: 'lananh.bui@cameratest.vn',
    phone: '0912345676',
    address: '15 Phan Chu Trinh, Vũng Tàu',
    role: 'customer',
  },
  {
    fullName: 'Trịnh Quang Vinh',
    email: 'quangvinh.trinh@cameratest.vn',
    phone: '0912345677',
    address: '320 Cầu Giấy, Hà Nội',
    role: 'customer',
  },
  {
    fullName: 'Võ Mỹ Duyên',
    email: 'myduyen.vo@cameratest.vn',
    phone: '0912345678',
    address: '77 Hai Bà Trưng, Q.1, TP. Hồ Chí Minh',
    role: 'customer',
  },
  {
    fullName: 'Phan Gia Khiêm',
    email: 'giakhiem.phan@cameratest.vn',
    phone: '0912345679',
    address: '42 Hùng Vương, TP. Huế',
    role: 'customer',
  },
  {
    fullName: 'Ngô Minh Trí',
    email: 'minhtri.ngo@cameratest.vn',
    phone: '0912345680',
    address: '109 Quang Trung, TP. Buôn Ma Thuột',
    role: 'customer',
  },
];

// Danh sách đánh giá chi tiết theo từng sản phẩm (ID 1 -> 27)
const reviewsData = [
  // 1: Sony Alpha A7 Mark IV (Body)
  {
    productId: 1,
    reviews: [
      {
        userIndex: 0,
        rating: 5,
        comment: 'Máy nâng cấp từ A7 III lên cảm nhận rõ rệt nhất là màn hình xoay lật và menu mới cực kỳ trực quan. Khử nhiễu ISO 6400 vẫn rất sạch sẽ, lấy nét theo mắt người và động vật dính như keo. Cực kỳ ưng ý!',
        daysAgo: 18,
      },
      {
        userIndex: 1,
        rating: 5,
        comment: 'Body cầm chắc tay, báng cầm sâu hơn đời cũ nhiều. Màu da chụp chân dung trên A7 IV nịnh mắt hơn hẳn. Shop đóng gói bọc xốp 3 lớp rất an tâm.',
        daysAgo: 12,
      },
      {
        userIndex: 2,
        rating: 4,
        comment: 'Máy quay 4K60p bị crop 1.5x hơi tiếc một chút, nhưng chất lượng hình ảnh và dải dynamic range rất tốt. Làm việc cả ngày cưới máy không bị quá nhiệt.',
        daysAgo: 25,
      },
    ],
  },
  // 2: Fujifilm X-T5 (Body Black)
  {
    productId: 2,
    reviews: [
      {
        userIndex: 2,
        rating: 5,
        comment: 'Màu film Classic Chrome và Nostalgic Neg xuất sắc, chụp JPEG ăn ngay không cần hậu kỳ nhiều. Vỏ đen sang trọng cổ điển!',
        daysAgo: 22,
      },
      {
        userIndex: 3,
        rating: 5,
        comment: 'Cảm biến 40MP độ chi tiết kinh khủng, crop ảnh thoải mái. Dàn bánh xe chỉnh ISO, tốc cơ học mang lại cảm xúc nhiếp ảnh thực thụ.',
        daysAgo: 15,
      },
      {
        userIndex: 4,
        rating: 5,
        comment: 'Chống rung IBIS 7 stop đỉnh thật sự, mình chụp phơi sáng đêm 0.5s cầm tay ảnh vẫn nét căng. Giao hàng hỏa tốc trong ngày rất chuyên nghiệp.',
        daysAgo: 8,
      },
    ],
  },
  // 3: Canon EOS R6 Mark II (Body)
  {
    productId: 3,
    reviews: [
      {
        userIndex: 5,
        rating: 5,
        comment: 'Bắt nét 40 fps màn trập điện tử bắt dính mọi chuyển động nhanh. Chụp thể thao với chim chóc quá đã. Hệ thống menu của Canon luôn là số 1 về độ thân thiện.',
        daysAgo: 20,
      },
      {
        userIndex: 6,
        rating: 5,
        comment: 'Màu da đặc trưng của Canon lên da mẫu hồng hào tự nhiên, khách hàng nhận ảnh ai cũng khen. Máy đầm tay, pin LP-E6NH chụp cả ngày cưới mới hết 1 viên.',
        daysAgo: 14,
      },
      {
        userIndex: 7,
        rating: 4,
        comment: 'Chất lượng hoàn thiện tuyệt vời, chỉ tiếc là độ phân giải 24MP hơi vừa đủ nếu cần in ấn khổ siêu lớn, nhưng bù lại bù đắp bằng tốc độ và khả năng chụp thiếu sáng đỉnh cao.',
        daysAgo: 9,
      },
    ],
  },
  // 4: Ống kính Sony FE 24-70mm f/2.8 GM II
  {
    productId: 4,
    reviews: [
      {
        userIndex: 1,
        rating: 5,
        comment: 'Ống GM thế hệ 2 nhẹ hơn bản 1 rất nhiều, cầm cả ngày đi chụp sự kiện không bị mỏi cổ tay. Độ nét tại f/2.8 từ tâm ra rìa đều rất xuất sắc.',
        daysAgo: 30,
      },
      {
        userIndex: 8,
        rating: 5,
        comment: 'Vòng khẩu độ vật lý có nấc click/de-click quay video siêu mượt. Bokeh mịn màng, viền tím hầu như không thấy. Đáng đồng tiền bát gạo!',
        daysAgo: 19,
      },
      {
        userIndex: 9,
        rating: 5,
        comment: 'Hàng chính hãng fullbox nguyên seal tem Sony VN, kích hoạt bảo hành điện tử 12 tháng chuẩn chỉ. 10/10 cho shop.',
        daysAgo: 6,
      },
    ],
  },
  // 5: Chân máy ảnh carbon Peak Design Travel
  {
    productId: 5,
    reviews: [
      {
        userIndex: 0,
        rating: 5,
        comment: 'Sản phẩm quá đỉnh! Gấp siêu gọn vừa vặn hộc balo du lịch. Carbon nhẹ tênh mang đi leo núi không tốn sức.',
        daysAgo: 28,
      },
      {
        userIndex: 4,
        rating: 5,
        comment: 'Đầu bi ballhead thiết kế thông minh, chịu tải body kèm ống tele vẫn vững như bàn thạch. Thao tác mở khoá chân cực nhanh chỉ mất 5 giây.',
        daysAgo: 16,
      },
    ],
  },
  // 6: Sony Alpha A6700
  {
    productId: 6,
    reviews: [
      {
        userIndex: 1,
        rating: 5,
        comment: 'Chip AI nhận diện chủ thể cực kỳ thông minh, bám theo người dù quay lưng lại. Chống rung IBIS trong thân máy nhỏ gọn này là điểm cộng quá lớn.',
        daysAgo: 21,
      },
      {
        userIndex: 3,
        rating: 5,
        comment: 'Quay 4K 120p slow-motion mượt mà, cấu hình màu S-Log3 10-bit kéo màu hậu kỳ không thua kém gì dòng FX3. Rất ưng ý với phân khúc APS-C flagship.',
        daysAgo: 11,
      },
      {
        userIndex: 7,
        rating: 5,
        comment: 'Pin FZ100 dùng chung với Full-frame chụp cả ngày không lo hết pin. Báng cầm dày dặn gắn ống kính to cầm rất cân tay.',
        daysAgo: 5,
      },
    ],
  },
  // 7: Sony Alpha A6400
  {
    productId: 7,
    reviews: [
      {
        userIndex: 2,
        rating: 5,
        comment: 'Chiếc máy ảnh quốc dân cho người mới bắt đầu! Lấy nét nhanh nhất phân khúc, pin trâu và không bị giới hạn 30 phút quay video.',
        daysAgo: 26,
      },
      {
        userIndex: 5,
        rating: 4,
        comment: 'Máy nhỏ gọn, chụp đường phố rất kín đáo. Nếu có thêm chống rung thân máy thì tuyệt hảo, nhưng với tầm giá này thì quá hời rồi.',
        daysAgo: 17,
      },
    ],
  },
  // 8: Sony ZV-E10
  {
    productId: 8,
    reviews: [
      {
        userIndex: 2,
        rating: 5,
        comment: 'Màn hình xoay lật góc rộng, nút làm mờ phông nền 1 chạm và chế độ giới thiệu sản phẩm Product Showcase cực tiện cho vlogger review.',
        daysAgo: 24,
      },
      {
        userIndex: 8,
        rating: 5,
        comment: 'Mic thu âm 3 capsule tích hợp kèm bông lọc gió nghe rất trong trẻo, không cần cắm mic ngoài vẫn đủ tốt cho video TikTok/Reels.',
        daysAgo: 13,
      },
      {
        userIndex: 9,
        rating: 4,
        comment: 'Nhỏ gọn xinh xắn, gắn thêm ống kit đi du lịch quay vlog tiện lợi. Màu da quay tự nhiên sáng đẹp.',
        daysAgo: 7,
      },
    ],
  },
  // 9: Sony Alpha A7 IV
  {
    productId: 9,
    reviews: [
      {
        userIndex: 6,
        rating: 5,
        comment: 'Cỗ máy kiếm tiền đích thực cho thợ dịch vụ. Hai khe thẻ nhớ tiện sao lưu dữ liệu ngay lập tức, chuyển đổi nhanh giữa chế độ Photo/Video/S&Q.',
        daysAgo: 23,
      },
      {
        userIndex: 0,
        rating: 5,
        comment: 'Dynamic range rộng chụp ngược sáng kéo vùng tối lên không bị bết hay noise. Shop tư vấn nhiệt tình, tặng kèm dán cường lực màn hình.',
        daysAgo: 10,
      },
    ],
  },
  // 10: Sony Alpha A7R V
  {
    productId: 10,
    reviews: [
      {
        userIndex: 4,
        rating: 5,
        comment: 'Độ phân giải 61MP chi tiết đến từng sợi vải và lỗ chân lông. Màn hình lật 4 trục thiết kế đỉnh cao nhất hiện nay, xoay kiểu gì cũng tiện.',
        daysAgo: 27,
      },
      {
        userIndex: 6,
        rating: 5,
        comment: 'Tính năng Pixel Shift chụp ghép ảnh phong cảnh lên đến 240MP cực kỳ ấn tượng. Máy chuyên nghiệp cho studio thương mại đỉnh chóp.',
        daysAgo: 15,
      },
      {
        userIndex: 9,
        rating: 5,
        comment: 'Hệ thống chống rung 8 stop cứu nguy rất nhiều trong các tình huống chụp thiếu sáng cầm tay không tripod. Đỉnh của chóp Sony!',
        daysAgo: 4,
      },
    ],
  },
  // 11: Canon EOS R50
  {
    productId: 11,
    reviews: [
      {
        userIndex: 5,
        rating: 5,
        comment: 'Máy siêu nhẹ, nhỏ xinh bỏ vừa túi xách du lịch. Chụp tự động màu da rất xinh xắn, bạn gái mình thích mê.',
        daysAgo: 22,
      },
      {
        userIndex: 7,
        rating: 5,
        comment: 'Kết nối điện thoại qua app Canon Camera Connect chuyển ảnh siêu nhanh, chụp xong gửi qua điện thoại đăng story liền.',
        daysAgo: 12,
      },
    ],
  },
  // 12: Canon EOS R10
  {
    productId: 12,
    reviews: [
      {
        userIndex: 1,
        rating: 5,
        comment: 'Tốc độ chụp 23 fps bắt nét chim chóc thể thao rất nhạy. Thân máy nhẹ hơn nhiều so với dòng DSLR cũ mà tính năng vượt trội.',
        daysAgo: 29,
      },
      {
        userIndex: 3,
        rating: 5,
        comment: 'Hệ thống lấy nét Dual Pixel CMOS AF II mượn từ đàn anh R3 xịn xò. Đóng gói cẩn thận, phiếu bảo hành chính hãng LBM đầy đủ.',
        daysAgo: 14,
      },
    ],
  },
  // 13: Canon EOS R8
  {
    productId: 13,
    reviews: [
      {
        userIndex: 0,
        rating: 5,
        comment: 'Thân máy Full-frame nhẹ nhất mình từng dùng! Dùng chung cảm biến với R6 Mark II nên chất lượng ảnh và dải tương phản không có gì để chê.',
        daysAgo: 25,
      },
      {
        userIndex: 8,
        rating: 4,
        comment: 'Máy dùng pin LP-E17 hơi nhỏ nên khuyên anh em nên mua thêm 1-2 viên pin phụ. Còn về chất ảnh và lấy nét thì vô đối tầm giá 30 triệu.',
        daysAgo: 9,
      },
    ],
  },
  // 14: Canon EOS R6 Mark II
  {
    productId: 14,
    reviews: [
      {
        userIndex: 6,
        rating: 5,
        comment: 'Quay 4K60p oversampled từ 6K không bị nóng máy, chống rung phối hợp với lens RF lên tới 8 stop quay cầm tay như có gimbal.',
        daysAgo: 31,
      },
      {
        userIndex: 4,
        rating: 5,
        comment: 'Hỗ trợ quay Pre-recording bắt trước khoảnh khắc 0.5s trước khi bấm nút, không bao giờ bỏ lỡ khoảnh khắc đẹp khi chụp sự kiện.',
        daysAgo: 16,
      },
    ],
  },
  // 15: Canon EOS R5
  {
    productId: 15,
    reviews: [
      {
        userIndex: 4,
        rating: 5,
        comment: 'Quay 8K RAW phục vụ dựng phim điện ảnh quá khủng khiếp. Kính ngắm điện tử OLED 5.76 triệu điểm nét mịn như nhìn qua kính quang học.',
        daysAgo: 35,
      },
      {
        userIndex: 1,
        rating: 5,
        comment: 'Cảm biến 45MP cân bằng hoàn hảo giữa độ phân giải cao và tốc độ. Thân máy magie cứng cáp, chịu mưa gió tốt.',
        daysAgo: 18,
      },
    ],
  },
  // 16: Fujifilm X-T30 II
  {
    productId: 16,
    reviews: [
      {
        userIndex: 2,
        rating: 5,
        comment: 'Thiết kế vintage hoài cổ siêu đẹp, mang đi cafe hay dạo phố ai cũng hỏi. Bộ màu film Classic Neg chụp góc phố Hà Nội có chất thơ riêng.',
        daysAgo: 28,
      },
      {
        userIndex: 7,
        rating: 5,
        comment: 'Nhỏ gọn, điều khiển joystick nhạy, màn hình cảm ứng mượt mà. Giá tốt nhất cho một chiếc máy crop có màu film độc quyền.',
        daysAgo: 11,
      },
    ],
  },
  // 17: Fujifilm X-S20
  {
    productId: 17,
    reviews: [
      {
        userIndex: 3,
        rating: 5,
        comment: 'Báng cầm sâu cầm rất chắc tay kể cả khi gắn lens to. Pin NP-W235 dung lượng gấp đôi dòng cũ, quay vlog cả ngày không lo hết pin.',
        daysAgo: 26,
      },
      {
        userIndex: 5,
        rating: 5,
        comment: 'Chế độ Vlog Mode riêng biệt trên vòng xoay chế độ cực kỳ tiện lợi. Chống rung IBIS 7 stops hỗ trợ đắc lực khi đi bộ vừa đi vừa nói.',
        daysAgo: 13,
      },
    ],
  },
  // 18: Fujifilm X-T5
  {
    productId: 18,
    reviews: [
      {
        userIndex: 0,
        rating: 5,
        comment: 'Máy ảnh chụp tĩnh tuyệt vời nhất của Fuji. Ba vòng xoay cơ học kim loại cảm giác bấm nảy tanh tách rất đã tay.',
        daysAgo: 32,
      },
      {
        userIndex: 8,
        rating: 5,
        comment: 'Độ nét của cảm biến X-Trans 5 kết hợp với lens 33mm F1.4 hoặc 23mm F1.4 nét gai người. Hàng nguyên seal rất hài lòng.',
        daysAgo: 15,
      },
    ],
  },
  // 19: Fujifilm X100VI
  {
    productId: 19,
    reviews: [
      {
        userIndex: 0,
        rating: 5,
        comment: 'Chiếc máy ảnh đáng săn đón nhất năm! Thêm chống rung IBIS vào thân máy X100 mà kích thước gần như không đổi là một kỳ tích.',
        daysAgo: 33,
      },
      {
        userIndex: 2,
        rating: 5,
        comment: 'Ống kính 23mm F2 sắc nét, màu Reala Ace mới trong trẻo. Mang đi du lịch Nhật Bản chụp phóng sự đời thường hết nước chấm.',
        daysAgo: 20,
      },
      {
        userIndex: 6,
        rating: 5,
        comment: 'Thiết kế kim loại nguyên khối sang trọng, viewfinder lai OVF/EVF cực kỳ độc đáo. Rất vui vì đã mua được hàng sớm tại shop!',
        daysAgo: 6,
      },
    ],
  },
  // 20: Nikon Z30
  {
    productId: 20,
    reviews: [
      {
        userIndex: 3,
        rating: 5,
        comment: 'Máy Nikon quay vlog chuyên dụng không có kính ngắm nên cực kỳ nhỏ gọn. Micro stereo tích hợp thu âm to rõ, có đèn tally báo quay phía trước.',
        daysAgo: 24,
      },
      {
        userIndex: 7,
        rating: 4,
        comment: 'Màn hình xoay lật cảm ứng nhạy, giá rất dễ tiếp cận cho các bạn làm YouTube hoặc livestream bán hàng.',
        daysAgo: 10,
      },
    ],
  },
  // 21: Nikon Z fc
  {
    productId: 21,
    reviews: [
      {
        userIndex: 5,
        rating: 5,
        comment: 'Thiết kế gợi nhớ huyền thoại Nikon FM2 ngày xưa, đẹp mê hồn! Dàn núm xoay kim loại khắc chữ sắc sảo, bày trên bàn làm việc như một tác phẩm nghệ thuật.',
        daysAgo: 27,
      },
      {
        userIndex: 9,
        rating: 5,
        comment: 'Bắt nét nhận diện mắt người và động vật rất chuẩn. Màu sắc Nikon chụp phong cảnh và kiến trúc màu xanh trời, mây rất mọng.',
        daysAgo: 12,
      },
    ],
  },
  // 22: Nikon Z5
  {
    productId: 22,
    reviews: [
      {
        userIndex: 1,
        rating: 5,
        comment: 'Chiếc máy Full-frame 2 khe thẻ nhớ có giá tốt nhất thị trường! Chống rung 5 trục trong thân máy, báng cầm cực kỳ êm ái.',
        daysAgo: 29,
      },
      {
        userIndex: 8,
        rating: 5,
        comment: 'Chất lượng build nồi đồng cối đá chuẩn Nikon, đi mưa gió bụi bặm không sợ hỏng. Lựa chọn tuyệt vời cho các bạn mới lên Full-frame.',
        daysAgo: 14,
      },
    ],
  },
  // 23: Nikon Z6 II
  {
    productId: 23,
    reviews: [
      {
        userIndex: 4,
        rating: 5,
        comment: 'Trang bị 2 bộ xử lý Dual EXPEED 6 tốc độ chụp 14 fps, bộ nhớ đệm sâu chụp liên tục không bị nghẽn.',
        daysAgo: 30,
      },
      {
        userIndex: 6,
        rating: 5,
        comment: 'Khả năng chụp đêm ở ISO 12800 vẫn giữ chi tiết và màu sắc cực tốt. Cổng sạc Type-C vừa sạc vừa dùng được pin sạc dự phòng.',
        daysAgo: 17,
      },
    ],
  },
  // 24: Sigma 18-50mm F2.8 DC DN
  {
    productId: 24,
    reviews: [
      {
        userIndex: 3,
        rating: 5,
        comment: 'Ống kính zoom f/2.8 cho máy crop nhỏ nhẹ nhất thế giới! Chỉ nặng chưa tới 300g mà khẩu độ cố định 2.8 toàn dải.',
        daysAgo: 21,
      },
      {
        userIndex: 7,
        rating: 5,
        comment: 'Độ sắc nét kinh ngạc ngay tại f/2.8, khoảng cách lấy nét gần nhất chỉ 12cm chụp cận cảnh hoa lá macro nhẹ nhàng rất tiện.',
        daysAgo: 8,
      },
    ],
  },
  // 25: Sigma 30mm F1.4
  {
    productId: 25,
    reviews: [
      {
        userIndex: 0,
        rating: 5,
        comment: 'Khẩu f/1.4 xóa phông mịt mù, chụp chân dung buổi tối lung linh bokeh tròn xoe. Tiêu cự quy đổi ~45mm đa dụng chụp mọi thể loại.',
        daysAgo: 25,
      },
      {
        userIndex: 5,
        rating: 5,
        comment: 'Độ nét ở tâm cực kỳ sắc xảo, motor lấy nét bước STM êm ru không nghe tiếng động khi quay video. Quá xứng đáng trong tầm giá.',
        daysAgo: 11,
      },
    ],
  },
  // 26: Sigma 16mm F1.4 DC DN
  {
    productId: 26,
    reviews: [
      {
        userIndex: 2,
        rating: 5,
        comment: 'Góc rộng 24mm f/1.4 hoàn hảo cho quay vlog trong nhà, chụp phong cảnh thiên văn dải ngân hà Milky Way.',
        daysAgo: 23,
      },
      {
        userIndex: 8,
        rating: 5,
        comment: 'Khẩu lớn thu sáng siêu tốt khi chụp đêm, viền tím được kiểm soát rất tốt nhờ các thấu kính phi cầu và FLD cao cấp.',
        daysAgo: 9,
      },
    ],
  },
  // 27: Nikon Z8
  {
    productId: 27,
    reviews: [
      {
        userIndex: 4,
        rating: 5,
        comment: 'Một chiếc Z9 thu nhỏ hoàn hảo! Bỏ hoàn toàn màn trập cơ học mà không lo bị méo hình rolling shutter nhờ cảm biến xếp chồng siêu tốc.',
        daysAgo: 34,
      },
      {
        userIndex: 6,
        rating: 5,
        comment: 'Quay 8.3K 60p N-RAW nội bộ đỉnh cao, lấy nét bám dính chủ thể với 9 loại nhận diện khác nhau. Đây là con máy hoàn hảo nhất mình từng sở hữu!',
        daysAgo: 18,
      },
      {
        userIndex: 1,
        rating: 5,
        comment: 'Cầm trên tay đầm chắc, các nút bấm có đèn nền phát sáng trong đêm cực tiện khi tác nghiệp sự kiện trời tối. Dịch vụ shop chu đáo 10/10.',
        daysAgo: 5,
      },
    ],
  },
];

async function seedReviews() {
  console.log('🚀 Bắt đầu thêm dữ liệu mẫu cho bảng reviews...');

  try {
    // 1. Kiểm tra hoặc tạo các tài khoản khách hàng mẫu
    const createdUsers = [];
    for (const userData of sampleUsers) {
      let [user] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: {
          fullName: userData.fullName,
          phone: userData.phone,
          address: userData.address,
          role: userData.role,
          authProvider: 'local',
          isActive: true,
        },
      });
      createdUsers.push(user);
    }
    console.log(`✅ Đã chuẩn bị ${createdUsers.length} tài khoản khách hàng.`);

    // 2. Lấy danh sách sản phẩm thực tế trong DB
    const allProducts = await Product.findAll({ attributes: ['id', 'name', 'price', 'slug'] });
    const productMap = new Map(allProducts.map((p) => [p.id, p]));
    console.log(`✅ Tìm thấy ${allProducts.length} sản phẩm trong hệ thống.`);

    let addedReviewCount = 0;
    let addedOrderCount = 0;

    const now = Date.now();

    for (const productGroup of reviewsData) {
      const product = productMap.get(productGroup.productId);
      if (!product) {
        console.warn(`⚠️ Bỏ qua productId = ${productGroup.productId} vì không tồn tại trong DB.`);
        continue;
      }

      for (const rev of productGroup.reviews) {
        const user = createdUsers[rev.userIndex % createdUsers.length];
        const createdAt = new Date(now - rev.daysAgo * 86400000);

        // 2.1 Tạo bản ghi Order & OrderItem hoàn tất (completed) tương ứng để đảm bảo tính logic trọn vẹn
        const orderCode = `ORD-${product.id}-${user.id}-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 100)}`;
        const price = Number(product.price);

        const [order] = await Order.findOrCreate({
          where: { orderCode },
          defaults: {
            userId: user.id,
            customerName: user.fullName,
            customerEmail: user.email,
            customerPhone: user.phone || '0901234567',
            customerAddress: user.address || 'Hà Nội',
            totalAmount: price,
            shippingFee: 0,
            discountAmount: 0,
            finalAmount: price,
            paymentMethod: 'cod',
            paymentStatus: 'paid',
            status: 'completed',
            note: 'Đơn hàng đã giao thành công',
            createdAt,
            updatedAt: createdAt,
          },
        });

        await OrderItem.findOrCreate({
          where: { orderId: order.id, productId: product.id },
          defaults: {
            productName: product.name,
            quantity: 1,
            price: price,
            total: price,
            createdAt,
            updatedAt: createdAt,
          },
        });
        addedOrderCount++;

        // 2.2 Thêm hoặc cập nhật review
        const existingReview = await Review.findOne({
          where: { userId: user.id, productId: product.id },
        });

        if (!existingReview) {
          await Review.create({
            userId: user.id,
            productId: product.id,
            rating: rev.rating,
            comment: rev.comment,
            createdAt,
          });
          addedReviewCount++;
        } else {
          await existingReview.update({
            rating: rev.rating,
            comment: rev.comment,
            createdAt,
          });
        }
      }
    }

    const totalReviews = await Review.count();
    console.log(`🎉 HOÀN TẤT: Đã thêm/cập nhật thành công! Tổng số đánh giá hiện có trong bảng reviews: ${totalReviews} đánh giá.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi seed reviews:', error);
    process.exit(1);
  }
}

seedReviews();
