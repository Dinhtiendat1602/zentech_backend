import * as orderService from '../services/order.service.js';

export const getAll = async (req, res, next) => {
  try {
    const data = await orderService.getAllService(req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const data = await orderService.getByIdService(req.params.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const data = await orderService.createService(req.body);
    return res.status(201).json({ success: true, message: 'Tạo mới thành công', data });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = await orderService.updateService(req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Cập nhật thành công', data });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await orderService.removeService(req.params.id);
    return res.status(200).json({ success: true, message: 'Xóa thành công' });
  } catch (error) {
    next(error);
  }
};

export const checkout = async (req, res, next) => {
  try {
    const data = await orderService.checkoutService(req.body, req.user?.id);
    return res.status(201).json({ success: true, message: 'Đặt hàng thành công!', data });
  } catch (error) {
    next(error);
  }
};

export const cancelMyOrder = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập.' });
    }
    const data = await orderService.cancelUserOrderService(req.params.id, userId, req.body?.reason);
    return res.status(200).json({ success: true, message: 'Hủy đơn hàng thành công.', data });
  } catch (error) {
    next(error);
  }
};

