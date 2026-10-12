import { Category } from '../models/index.js';

export const getAllService = async () => Category.findAll({ order: [['type', 'ASC'], ['name', 'ASC']] });
export const getByIdService = async (id) => Category.findByPk(id);
export const createService = async (data) => Category.create(data);
export const updateService = async (id, data) => {
  const category = await Category.findByPk(id);
  if (!category) throw Object.assign(new Error('Không tìm thấy danh mục.'), { statusCode: 404 });
  await category.update(data);
  return category;
};
export const removeService = async (id) => Category.destroy({ where: { id } });
