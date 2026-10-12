import * as promotionService from '../services/promotion.service.js';

export const getAll = async (req, res, next) => {
  try {
    const data = await promotionService.getAllService(req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const data = await promotionService.getByIdService(req.params.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const data = await promotionService.createService(req.body);
    return res.status(201).json({ success: true, message: 'Tạo mới thành công', data });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = await promotionService.updateService(req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Cập nhật thành công', data });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await promotionService.removeService(req.params.id);
    return res.status(200).json({ success: true, message: 'Xóa thành công' });
  } catch (error) {
    next(error);
  }
};

export const checkCode = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;
    const data = await promotionService.checkPromotionService(code, orderAmount);
    return res.status(200).json({
      success: true,
      message: 'Áp dụng mã giảm giá thành công!',
      data,
    });
  } catch (error) {
    next(error);
  }
};

