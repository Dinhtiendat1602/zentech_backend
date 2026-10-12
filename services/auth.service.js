import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { QueryTypes } from 'sequelize';
import sequelize from '../config/db.js';
import { sendPasswordPinEmail } from './mail.service.js';

const fail = (message, statusCode) => Object.assign(new Error(message), { statusCode });
const normalizeEmail = (email) => email.trim().toLowerCase();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email, message = 'Vui lòng nhập email hợp lệ.') {
  if (typeof email !== 'string' || !emailPattern.test(email.trim())) throw fail(message, 400);
}

function validatePassword(password, message = 'Mật khẩu phải có ít nhất 8 ký tự.') {
  if (typeof password !== 'string' || password.length < 8) throw fail(message, 400);
}

function ensureJwtSecret() {
  if (!process.env.JWT_SECRET) throw fail('Máy chủ chưa cấu hình JWT_SECRET.', 500);
}

function createToken(user) {
  ensureJwtSecret();
  return jwt.sign({ sub: String(user.id), role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

function publicUser(user) {
  return { id: user.id, full_name: user.full_name, email: user.email, role: user.role, avatar: user.avatar ?? null };
}

export const registerService = async (data = {}) => {
  const full_name = data.full_name ?? data.name;
  const { email, password } = data;
  if (typeof full_name !== 'string' || !full_name.trim()) {
    throw fail('Vui lòng nhập họ tên.', 400);
  }
  validateEmail(email, 'Vui lòng nhập họ tên, email hợp lệ và mật khẩu có ít nhất 8 ký tự.');
  validatePassword(password, 'Vui lòng nhập họ tên, email hợp lệ và mật khẩu có ít nhất 8 ký tự.');
  ensureJwtSecret();
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const [user] = await sequelize.query(
      `INSERT INTO users (full_name, email, password)
       VALUES (:full_name, :email, :password)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, full_name, email, role, avatar`,
      { replacements: { full_name: full_name.trim(), email: normalizeEmail(email), password: passwordHash }, type: QueryTypes.SELECT },
    );
    if (!user) throw fail('Email này đã được đăng ký.', 409);
    return { token: createToken(user), user: publicUser(user) };
  } catch (error) {
    throw error;
  }
};

export const loginService = async (data = {}) => {
  const { email, password } = data;
  if (typeof email !== 'string' || !emailPattern.test(email.trim()) || !password) {
    throw fail('Email hoặc mật khẩu không hợp lệ.', 400);
  }
  ensureJwtSecret();
  const [user] = await sequelize.query(
    `SELECT id, full_name, email, password, role, avatar, is_active
     FROM users WHERE email = :email LIMIT 1`,
    { replacements: { email: normalizeEmail(email) }, type: QueryTypes.SELECT },
  );

  if (!user || !user.is_active || !user.password || !(await bcrypt.compare(password, user.password))) {
    throw fail('Email hoặc mật khẩu không chính xác.', 401);
  }
  return { token: createToken(user), user: publicUser(user) };
};

export const getProfileService = async (userId) => {
  const [user] = await sequelize.query(
    `SELECT id, full_name, email, role, avatar, phone, created_at
     FROM users WHERE id = :userId AND is_active = TRUE LIMIT 1`,
    { replacements: { userId }, type: QueryTypes.SELECT },
  );
  if (!user) throw fail('Không tìm thấy tài khoản.', 404);
  return user;
};

export const forgotPasswordService = async (data = {}) => {
  const { email } = data;
  validateEmail(email);
  const normalizedEmail = normalizeEmail(email);
  const [user] = await sequelize.query(
    'SELECT id FROM users WHERE email = :email AND is_active = TRUE LIMIT 1',
    { replacements: { email: normalizedEmail }, type: QueryTypes.SELECT },
  );

  if (user) {
    const pin = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const tokenHash = createHash('sha256').update(pin).digest('hex');
    await sequelize.transaction(async (transaction) => {
      await sequelize.query(
        'UPDATE password_resets SET is_used = TRUE WHERE user_id = :userId AND is_used = FALSE',
        { replacements: { userId: user.id }, transaction },
      );
      await sequelize.query(
        `INSERT INTO password_resets (user_id, email, token, expires_at)
         VALUES (:userId, :email, :token, NOW() + INTERVAL '1 minute')`,
        { replacements: { userId: user.id, email: normalizedEmail, token: tokenHash }, transaction },
      );
    });

    try {
      await sendPasswordPinEmail(normalizedEmail, pin);
    } catch (error) {
      await sequelize.query(
        'UPDATE password_resets SET is_used = TRUE WHERE user_id = :userId AND token = :token',
        { replacements: { userId: user.id, token: tokenHash } },
      );
      throw error;
    }
  }
  return { message: 'Nếu email đã đăng ký, mã PIN sẽ được gửi đến hộp thư của bạn.' };
};

export const resetPasswordService = async (data = {}) => {
  const { email, pin, password } = data;
  validateEmail(email, 'Vui lòng nhập email hợp lệ, PIN 6 số và mật khẩu mới tối thiểu 8 ký tự.');
  if (typeof pin !== 'string' || !/^\d{6}$/.test(pin)) {
    throw fail('Vui lòng nhập email hợp lệ, PIN 6 số và mật khẩu mới tối thiểu 8 ký tự.', 400);
  }
  validatePassword(password, 'Vui lòng nhập email hợp lệ, PIN 6 số và mật khẩu mới tối thiểu 8 ký tự.');
  const normalizedEmail = normalizeEmail(email);
  const pinHash = createHash('sha256').update(pin).digest('hex');
  const passwordHash = await bcrypt.hash(password, 12);

  await sequelize.transaction(async (transaction) => {
    const [reset] = await sequelize.query(
      `SELECT id, user_id, token FROM password_resets
       WHERE email = :email AND is_used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1 FOR UPDATE`,
      { replacements: { email: normalizedEmail }, type: QueryTypes.SELECT, transaction },
    );
    const expectedHash = Buffer.from(reset?.token ?? '', 'hex');
    const actualHash = Buffer.from(pinHash, 'hex');
    if (!reset || expectedHash.length !== actualHash.length || !timingSafeEqual(expectedHash, actualHash)) {
      throw fail('Mã PIN không hợp lệ hoặc đã hết hạn.', 400);
    }

    await sequelize.query(
      'UPDATE users SET password = :password WHERE id = :userId',
      { replacements: { password: passwordHash, userId: reset.user_id }, transaction },
    );
    await sequelize.query(
      'UPDATE password_resets SET is_used = TRUE WHERE id = :resetId',
      { replacements: { resetId: reset.id }, transaction },
    );
  });
  return { message: 'Mật khẩu đã được cập nhật.' };
};
