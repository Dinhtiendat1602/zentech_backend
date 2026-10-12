import * as productService from '../services/product.service.js';

export const getAll = async (req, res, next) => {
  try {
    const data = await productService.getAllService(req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const data = await productService.getByIdService(req.params.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getSpecs = async (req, res, next) => {
  try {
    const data = await productService.getSpecsByProductIdService(req.params.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAdminProducts = async (req, res, next) => {
  try {
    const data = await productService.getAdminProductsService(req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const data = await productService.getCategoriesService();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const data = await productService.createService(req.body);
    return res.status(201).json({ success: true, message: 'Tạo mới thành công', data });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = await productService.updateService(req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Cập nhật thành công', data });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await productService.removeService(req.params.id);
    return res.status(200).json({ success: true, message: 'Xóa thành công' });
  } catch (error) {
    next(error);
  }
};
