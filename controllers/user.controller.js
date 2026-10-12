import * as userService from '../services/user.service.js';

export const getMyDashboard = async (req, res, next) => {
  try {
    const data = await userService.getDashboardService(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const data = await userService.updateProfileService(req.user.id, req.body);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const addMyWishlistItem = async (req, res, next) => {
  try {
    const data = await userService.addWishlistService(req.user.id, req.body.slug);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const removeMyWishlistItem = async (req, res, next) => {
  try {
    const data = await userService.removeWishlistService(req.user.id, req.params.slug);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const data = await userService.getAllService(req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const data = await userService.getByIdService(req.params.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const data = await userService.createService(req.body);
    return res.status(201).json({ success: true, message: 'Tạo mới thành công', data });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = await userService.updateService(req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Cập nhật thành công', data });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await userService.removeService(req.params.id);
    return res.status(200).json({ success: true, message: 'Xóa thành công' });
  } catch (error) {
    next(error);
  }
};
