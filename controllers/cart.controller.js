import * as cartService from '../services/cart.service.js';

export const getAll = async (req, res, next) => {
  try {
    const data = await cartService.getAllService(req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const data = await cartService.getByIdService(req.params.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const data = await cartService.createService(req.body);
    return res.status(201).json({ success: true, message: 'Tạo mới thành công', data });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = await cartService.updateService(req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Cập nhật thành công', data });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await cartService.removeService(req.params.id);
    return res.status(200).json({ success: true, message: 'Xóa thành công' });
  } catch (error) {
    next(error);
  }
};
