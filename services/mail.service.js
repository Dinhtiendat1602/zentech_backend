import nodemailer from 'nodemailer';

const formatPrice = (val) => new Intl.NumberFormat('vi-VN').format(Number(val) || 0) + 'đ';

const getTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    return null;
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
};

export const sendPasswordPinEmail = async (email, pin) => {
  const transporter = getTransporter();
  if (!transporter) {
    throw Object.assign(new Error('Máy chủ chưa cấu hình SMTP.'), { statusCode: 503 });
  }

  const { SMTP_USER, SMTP_FROM } = process.env;
  await transporter.sendMail({
    from: SMTP_FROM || `Zen Store <${SMTP_USER}>`,
    to: email,
    subject: 'Mã PIN đặt lại mật khẩu Zen Store',
    text: `Mã PIN của bạn là ${pin}. Mã có hiệu lực trong 1 phút.`,
    html: `<p>Mã PIN đặt lại mật khẩu của bạn là <strong>${pin}</strong>.</p><p>Mã có hiệu lực trong 1 phút.</p>`,
  });
};

/**
 * Gửi email xác nhận đơn hàng tới KHÁCH HÀNG và thông báo tới ADMIN
 * @param {Object} order - Đơn hàng hoàn chỉnh kèm danh sách items
 */
export const sendOrderNotificationEmails = async (order) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('⚠️ SMTP chưa được cấu hình, bỏ qua gửi email đơn hàng.');
    return;
  }

  const { SMTP_USER, SMTP_FROM, ADMIN_EMAIL, FRONTEND_URL } = process.env;
  const from = SMTP_FROM || `Zen Store <${SMTP_USER}>`;
  const adminTargetEmail = ADMIN_EMAIL || SMTP_USER || 'admin@camerashop.vn';
  const adminUrl = `${FRONTEND_URL || 'http://localhost:5173'}/admin/orders`;

  const orderCode = order.orderCode || `ORD-${order.id}`;
  const customerName = order.customerName || 'Quý khách';
  const customerEmail = order.customerEmail;
  const customerPhone = order.customerPhone || '—';
  const customerAddress = order.customerAddress || '—';
  const note = order.note ? String(order.note).trim() : '';

  const totalAmount = Number(order.totalAmount || 0);
  const shippingFee = Number(order.shippingFee || 0);
  const discountAmount = Number(order.discountAmount || 0);
  const finalAmount = Number(order.finalAmount || 0);
  const paymentMethod = order.paymentMethod || 'cod';

  const paymentMethodName = paymentMethod === 'bank'
    ? 'Chuyển khoản VietQR (Ngân hàng VPBank)'
    : paymentMethod === 'cod'
    ? 'Thanh toán tiền mặt khi nhận hàng (COD)'
    : String(paymentMethod).toUpperCase();

  const orderDate = new Date(order.createdAt || Date.now());
  const orderTimeStr = new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(orderDate);

  const items = Array.isArray(order.orderItems) ? order.orderItems : [];

  // Tạo hàng bảng sản phẩm cho email khách hàng
  const itemsRowsHtml = items.map((it) => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 500; color: #1e293b;">
        ${it.productName || 'Sản phẩm'}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #475569;">
        x${it.quantity}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #475569;">
        ${formatPrice(it.price)}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600; color: #0f172a;">
        ${formatPrice(it.total || it.price * it.quantity)}
      </td>
    </tr>
  `).join('');

  // Tạo hàng bảng sản phẩm cho email admin
  const adminItemsRowsHtml = items.map((it) => `
    <tr>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 500;">
        ${it.productName || 'Sản phẩm'}
      </td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #475569;">
        x${it.quantity}
      </td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600; color: #0f172a;">
        ${formatPrice(it.total || it.price * it.quantity)}
      </td>
    </tr>
  `).join('');

  const qrImageUrl = `https://api.vietqr.io/image/970432-0942981363-compact2.png?amount=${finalAmount}&addInfo=${encodeURIComponent(orderCode)}&accountName=ZEN%20STORE%20VIETNAM`;

  // 1. Email gửi cho KHÁCH HÀNG
  const customerEmailHtml = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>Xác nhận đơn hàng Zen Store</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <div style="max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
    <!-- Header -->
    <div style="background-color: #0f172a; padding: 24px; text-align: center;">
      <h1 style="margin: 0; color: #a8f000; font-size: 24px; font-weight: 700; letter-spacing: 1px;">ZEN STORE</h1>
      <p style="margin: 6px 0 0; color: #94a3b8; font-size: 13px;">Thiết bị & Phụ kiện Nhiếp ảnh Chính hãng</p>
    </div>

    <!-- Main Content -->
    <div style="padding: 28px 24px;">
      <div style="padding-bottom: 20px; border-bottom: 1px solid #e2e8f0; margin-bottom: 20px;">
        <h2 style="margin: 0 0 8px; color: #0f172a; font-size: 20px;">Xác nhận đơn hàng thành công 🎉</h2>
        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #475569;">
          Xin chào <strong>${customerName}</strong>,<br>
          Cảm ơn bạn đã mua sắm tại <strong>Zen Store</strong>. Đơn hàng của bạn đã được ghi nhận vào hệ thống và nhân viên cửa hàng sẽ liên hệ xác nhận để gửi hàng sớm nhất!
        </p>
      </div>

      <!-- Order Info Box -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 16px; margin-bottom: 24px;">
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; color: #64748b; width: 140px;">Mã đơn hàng:</td>
            <td style="padding: 4px 0; font-weight: 700; color: #0f172a; font-family: monospace;">#${orderCode}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Thời gian đặt:</td>
            <td style="padding: 4px 0; color: #0f172a;">${orderTimeStr}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Phương thức thanh toán:</td>
            <td style="padding: 4px 0; font-weight: 600; color: #0f172a;">${paymentMethodName}</td>
          </tr>
        </table>
      </div>

      <!-- Items Table -->
      <h3 style="margin: 0 0 12px; font-size: 15px; color: #0f172a;">Chi tiết sản phẩm</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
        <thead>
          <tr style="background-color: #f1f5f9; text-align: left;">
            <th style="padding: 8px 10px; border-bottom: 2px solid #cbd5e1; color: #475569;">Sản phẩm</th>
            <th style="padding: 8px 10px; border-bottom: 2px solid #cbd5e1; text-align: center; color: #475569; width: 60px;">SL</th>
            <th style="padding: 8px 10px; border-bottom: 2px solid #cbd5e1; text-align: right; color: #475569; width: 110px;">Đơn giá</th>
            <th style="padding: 8px 10px; border-bottom: 2px solid #cbd5e1; text-align: right; color: #475569; width: 120px;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRowsHtml}
        </tbody>
      </table>

      <!-- Summary -->
      <div style="margin-left: auto; width: 280px; margin-bottom: 24px; font-size: 13px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Tạm tính:</td>
            <td style="padding: 4px 0; text-align: right; color: #1e293b;">${formatPrice(totalAmount)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Phí vận chuyển:</td>
            <td style="padding: 4px 0; text-align: right; color: #1e293b;">${shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</td>
          </tr>
          ${discountAmount > 0 ? `
          <tr>
            <td style="padding: 4px 0; color: #16a34a;">Giảm giá voucher:</td>
            <td style="padding: 4px 0; text-align: right; color: #16a34a; font-weight: 600;">-${formatPrice(discountAmount)}</td>
          </tr>` : ''}
          <tr style="border-top: 1.5px solid #0f172a;">
            <td style="padding: 8px 0; font-weight: 700; font-size: 15px; color: #0f172a;">Tổng thanh toán:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; font-size: 17px; color: #16a34a;">${formatPrice(finalAmount)}</td>
          </tr>
        </table>
      </div>

      <!-- Shipping Address Box -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 16px; margin-bottom: 24px;">
        <h4 style="margin: 0 0 8px; font-size: 14px; color: #0f172a;">Địa chỉ giao hàng</h4>
        <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #334155;">
          <strong>Người nhận:</strong> ${customerName} &bull; ${customerPhone}<br>
          <strong>Địa chỉ:</strong> ${customerAddress}<br>
          ${note ? `<strong>Ghi chú:</strong> <em>${note}</em>` : ''}
        </p>
      </div>

      <!-- Bank Transfer Box (if paymentMethod === 'bank') -->
      ${paymentMethod === 'bank' ? `
      <div style="background-color: #f0fdf4; border: 1.5px solid #86efac; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
        <h4 style="margin: 0 0 10px; color: #166534; font-size: 14px;">Thông tin chuyển khoản qua mã VietQR</h4>
        <p style="margin: 0 0 12px; font-size: 13px; color: #15803d; line-height: 1.5;">
          Quý khách vui lòng quét mã VietQR bên dưới hoặc chuyển tiền theo số tài khoản VPBank:
        </p>
        <div style="text-align: center; margin-bottom: 12px;">
          <img src="${qrImageUrl}" alt="VietQR" style="width: 140px; height: 140px; background: #fff; padding: 6px; border: 1px solid #dcfce7; border-radius: 6px;">
        </div>
        <div style="font-size: 13px; line-height: 1.8; color: #166534; background: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #bbf7d0;">
          <div>&bull; Ngân hàng: <strong>VPBank (Việt Nam Thịnh Vượng)</strong></div>
          <div>&bull; Số tài khoản: <strong style="font-size: 15px; color: #0f172a; font-family: monospace;">0942981363</strong></div>
          <div>&bull; Chủ tài khoản: <strong>ZEN STORE VIETNAM</strong></div>
          <div>&bull; Số tiền: <strong style="color: #16a34a;">${formatPrice(finalAmount)}</strong></div>
          <div>&bull; Nội dung chuyển khoản: <strong style="background: #dcfce7; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${orderCode}</strong></div>
        </div>
      </div>
      ` : ''}

      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #64748b; line-height: 1.6; text-align: center;">
        Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng liên hệ hotline <strong>0942 981 363</strong> hoặc phản hồi trực tiếp email này.<br>
        <strong>Zen Store</strong> trân trọng cảm ơn sự ủng hộ của bạn!
      </div>
    </div>
  </div>
</body>
</html>
  `;

  // 2. Email gửi cho ADMIN
  const adminEmailHtml = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>Thông báo đơn hàng mới - Zen Store</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <div style="max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
    <!-- Header -->
    <div style="background-color: #0f172a; padding: 20px 24px; border-bottom: 4px solid #a8f000;">
      <h2 style="margin: 0; color: #ffffff; font-size: 18px;">🔔 THÔNG BÁO ĐƠN HÀNG MỚI TỪ KHÁCH HÀNG</h2>
      <p style="margin: 4px 0 0; color: #a8f000; font-size: 13px; font-family: monospace;">MÃ ĐƠN: #${orderCode}</p>
    </div>

    <div style="padding: 24px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 16px; margin-bottom: 18px;">
        <h3 style="margin: 0 0 10px; font-size: 14px; color: #0f172a;">Thông tin khách hàng:</h3>
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <tr><td style="padding: 3px 0; color: #64748b; width: 120px;">Họ tên:</td><td style="padding: 3px 0; font-weight: 600; color: #0f172a;">${customerName}</td></tr>
          <tr><td style="padding: 3px 0; color: #64748b;">Số điện thoại:</td><td style="padding: 3px 0; font-weight: 600; color: #0284c7;">${customerPhone}</td></tr>
          <tr><td style="padding: 3px 0; color: #64748b;">Email:</td><td style="padding: 3px 0; color: #0f172a;">${customerEmail || '—'}</td></tr>
          <tr><td style="padding: 3px 0; color: #64748b;">Địa chỉ giao:</td><td style="padding: 3px 0; color: #0f172a;">${customerAddress}</td></tr>
          ${note ? `<tr><td style="padding: 3px 0; color: #64748b;">Ghi chú:</td><td style="padding: 3px 0; color: #b45309; font-style: italic;">${note}</td></tr>` : ''}
          <tr><td style="padding: 3px 0; color: #64748b;">Thanh toán:</td><td style="padding: 3px 0; font-weight: 600; color: #0f172a;">${paymentMethodName}</td></tr>
        </table>
      </div>

      <h3 style="margin: 0 0 10px; font-size: 14px; color: #0f172a;">Các sản phẩm đã đặt:</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="padding: 8px 10px; border-bottom: 2px solid #cbd5e1; text-align: left; color: #475569;">Sản phẩm</th>
            <th style="padding: 8px 10px; border-bottom: 2px solid #cbd5e1; text-align: center; color: #475569; width: 50px;">SL</th>
            <th style="padding: 8px 10px; border-bottom: 2px solid #cbd5e1; text-align: right; color: #475569; width: 110px;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${adminItemsRowsHtml}
        </tbody>
      </table>

      <div style="text-align: right; margin-bottom: 24px;">
        <span style="font-size: 14px; color: #64748b;">Tổng giá trị đơn hàng: </span>
        <strong style="font-size: 20px; color: #16a34a; margin-left: 8px;">${formatPrice(finalAmount)}</strong>
      </div>

      <div style="text-align: center; margin-bottom: 16px;">
        <a href="${adminUrl}" style="display: inline-block; background-color: #0f172a; color: #a8f000; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 700; font-size: 13px; letter-spacing: 0.5px;">
          MỞ TRANG QUẢN TRỊ ĐƠN HÀNG &rarr;
        </a>
      </div>

      <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
        Email thông báo tự động từ hệ thống Zen Store.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const customerEmailText = `
Xin chào ${customerName},

Cảm ơn bạn đã mua sắm tại Zen Store. Đơn hàng #${orderCode} của bạn đã được ghi nhận vào hệ thống.

THÔNG TIN ĐƠN HÀNG:
- Mã đơn hàng: #${orderCode}
- Thời gian đặt: ${orderTimeStr}
- Phương thức thanh toán: ${paymentMethodName}

DANH SÁCH SẢN PHẨM:
${items.map((it) => `- ${it.productName || 'Sản phẩm'} (x${it.quantity}): ${formatPrice(it.total || it.price * it.quantity)}`).join('\n')}

TỔNG CỘNG:
- Tiền hàng: ${formatPrice(totalAmount)}
- Phí vận chuyển: ${shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
${discountAmount > 0 ? `- Giảm giá: -${formatPrice(discountAmount)}\n` : ''}- Tổng thanh toán: ${formatPrice(finalAmount)}

ĐỊA CHỈ GIAO HÀNG:
- Người nhận: ${customerName} - ${customerPhone}
- Địa chỉ: ${customerAddress}
${note ? `- Ghi chú: ${note}\n` : ''}
${paymentMethod === 'bank' ? `
THÔNG TIN CHUYỂN KHOẢN (VPBank):
- Ngân hàng: VPBank (Việt Nam Thịnh Vượng)
- Số tài khoản: 0942981363
- Chủ tài khoản: ZEN STORE VIETNAM
- Số tiền: ${formatPrice(finalAmount)}
- Nội dung: ${orderCode}
` : ''}
Zen Store trân trọng cảm ơn sự ủng hộ của quý khách! Hotline: 0942 981 363
`.trim();

  const adminEmailText = `
THÔNG BÁO ĐƠN HÀNG MỚI: #${orderCode}
Khách hàng: ${customerName} - ${customerPhone}
Email: ${customerEmail || '—'}
Địa chỉ: ${customerAddress}
${note ? `Ghi chú: ${note}\n` : ''}
Sản phẩm:
${items.map((it) => `- ${it.productName || 'Sản phẩm'} (x${it.quantity}): ${formatPrice(it.total || it.price * it.quantity)}`).join('\n')}

Tổng giá trị: ${formatPrice(finalAmount)}
Hình thức thanh toán: ${paymentMethodName}
Trang quản trị: ${adminUrl}
`.trim();

  const tasks = [];

  // Gửi cho khách hàng nếu có email
  if (customerEmail && customerEmail.includes('@')) {
    tasks.push(
      transporter.sendMail({
        from,
        to: customerEmail,
        replyTo: adminTargetEmail,
        subject: `[Zen Store] Xác nhận đơn hàng thành công #${orderCode}`,
        text: customerEmailText,
        html: customerEmailHtml,
      }).then(() => {
        console.log(`✉️ Đã gửi email xác nhận đơn hàng #${orderCode} tới khách hàng: ${customerEmail}`);
      }).catch((err) => {
        console.error(`❌ Lỗi gửi email tới khách hàng (${customerEmail}):`, err?.message || err);
      })
    );
  }

  // Gửi cho admin
  if (adminTargetEmail) {
    tasks.push(
      transporter.sendMail({
        from,
        to: adminTargetEmail,
        replyTo: customerEmail || undefined,
        subject: `🔔 [Zen Store - ĐƠN HÀNG MỚI] #${orderCode} - ${formatPrice(finalAmount)} từ ${customerName}`,
        text: adminEmailText,
        html: adminEmailHtml,
      }).then(() => {
        console.log(`✉️ Đã gửi thông báo đơn hàng #${orderCode} tới Admin: ${adminTargetEmail}`);
      }).catch((err) => {
        console.error(`❌ Lỗi gửi email tới Admin (${adminTargetEmail}):`, err?.message || err);
      })
    );
  }

  await Promise.allSettled(tasks);
};