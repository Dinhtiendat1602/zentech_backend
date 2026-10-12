import * as reviewService from '../services/review.service.js';

export const getAll = async (req, res, next) => {
  try {
    const data = await reviewService.getAllService(req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const data = await reviewService.getByIdService(req.params.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const data = await reviewService.createService(req.body, req.user?.id);
    return res.status(201).json({ success: true, message: 'Đánh giá sản phẩm thành công', data });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = await reviewService.updateService(req.params.id, req.body, req.user?.id);
    return res.status(200).json({ success: true, message: 'Cập nhật đánh giá thành công', data });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await reviewService.removeService(req.params.id, req.user?.id, req.user?.role);
    return res.status(200).json({ success: true, message: 'Xóa đánh giá thành công' });
  } catch (error) {
    next(error);
  }
};
