export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);
  const statusCode = error.statusCode ?? 500;
  if (statusCode >= 500) console.error(error);
  return res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? 'Đã xảy ra lỗi máy chủ.' : error.message,
  });
};