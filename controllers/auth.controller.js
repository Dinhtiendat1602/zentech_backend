import * as authService from '../services/auth.service.js';

export const register = async (req, res, next) => {
	try {
		const data = await authService.registerService(req.body);
		return res.status(201).json({ success: true, data });
	} catch (error) {
		return next(error);
	}
};

export const login = async (req, res, next) => {
	try {
		const data = await authService.loginService(req.body);
		return res.status(200).json({ success: true, data });
	} catch (error) {
		return next(error);
	}
};

export const getProfile = async (req, res, next) => {
	try {
		const data = await authService.getProfileService(req.user.id);
		return res.status(200).json({ success: true, data });
	} catch (error) {
		return next(error);
	}
};

export const forgotPassword = async (req, res, next) => {
	try {
		const data = await authService.forgotPasswordService(req.body);
		return res.status(200).json({ success: true, data });
	} catch (error) {
		return next(error);
	}
};

export const resetPassword = async (req, res, next) => {
	try {
		const data = await authService.resetPasswordService(req.body);
		return res.status(200).json({ success: true, data });
	} catch (error) {
		return next(error);
	}
};
