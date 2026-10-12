import * as adminService from '../services/admin.service.js';

export const getDashboard = async (req, res, next) => {
  try {
    const data = await adminService.getDashboardService();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};