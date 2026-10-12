import sequelize from '../config/db.js';
import initGeneratedModels from './generated/init-models.js';

const models = initGeneratedModels(sequelize);

export default models;
export const { User, Product, Category, Order, OrderItem, ProductImage, ProductSpec, ProductPolicy, Review, Wishlist, Promotion } = models;
