import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
	const [scheme, token] = (req.headers.authorization ?? '').split(' ');
	if (scheme !== 'Bearer' || !token || !process.env.JWT_SECRET) {
		return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập.' });
	}

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		req.user = { id: Number(payload.sub), role: payload.role };
		return next();
	} catch {
		return res.status(401).json({ success: false, message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
	}
};

export const requireRole = (...roles) => (req, res, next) => {
	if (!req.user || !roles.includes(req.user.role)) {
		return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện thao tác này.' });
	}
	return next();
};

export const optionalAuth = (req, res, next) => {
	const [scheme, token] = (req.headers.authorization ?? '').split(' ');
	if (scheme === 'Bearer' && token && process.env.JWT_SECRET) {
		try {
			const payload = jwt.verify(token, process.env.JWT_SECRET);
			req.user = { id: Number(payload.sub), role: payload.role };
		} catch {
			// ignore token error for optional auth
		}
	}
	return next();
};

