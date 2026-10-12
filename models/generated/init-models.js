import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _Cart from  "./cart.js";
import _Category from  "./category.js";
import _ChatMessage from  "./chatMessage.js";
import _ChatRoom from  "./chatRoom.js";
import _OrderItem from  "./orderItem.js";
import _Order from  "./order.js";
import _PasswordReset from  "./passwordReset.js";
import _ProductImage from  "./productImage.js";
import _ProductPolicy from  "./productPolicy.js";
import _ProductSpec from  "./productSpec.js";
import _Product from  "./product.js";
import _Promotion from  "./promotion.js";
import _Review from  "./review.js";
import _Slide from  "./slide.js";
import _User from  "./user.js";
import _Wishlist from  "./wishlist.js";

export default function initModels(sequelize) {
  const Cart = _Cart.init(sequelize, DataTypes);
  const Category = _Category.init(sequelize, DataTypes);
  const ChatMessage = _ChatMessage.init(sequelize, DataTypes);
  const ChatRoom = _ChatRoom.init(sequelize, DataTypes);
  const OrderItem = _OrderItem.init(sequelize, DataTypes);
  const Order = _Order.init(sequelize, DataTypes);
  const PasswordReset = _PasswordReset.init(sequelize, DataTypes);
  const ProductImage = _ProductImage.init(sequelize, DataTypes);
  const ProductPolicy = _ProductPolicy.init(sequelize, DataTypes);
  const ProductSpec = _ProductSpec.init(sequelize, DataTypes);
  const Product = _Product.init(sequelize, DataTypes);
  const Promotion = _Promotion.init(sequelize, DataTypes);
  const Review = _Review.init(sequelize, DataTypes);
  const Slide = _Slide.init(sequelize, DataTypes);
  const User = _User.init(sequelize, DataTypes);
  const Wishlist = _Wishlist.init(sequelize, DataTypes);

  Category.belongsTo(Category, { as: "parent", foreignKey: "parentId"});
  Category.hasMany(Category, { as: "categories", foreignKey: "parentId"});
  Product.belongsTo(Category, { as: "category", foreignKey: "categoryId"});
  Category.hasMany(Product, { as: "products", foreignKey: "categoryId"});
  ChatMessage.belongsTo(ChatRoom, { as: "room", foreignKey: "roomId"});
  ChatRoom.hasMany(ChatMessage, { as: "chatMessages", foreignKey: "roomId"});
  OrderItem.belongsTo(Order, { as: "order", foreignKey: "orderId"});
  Order.hasMany(OrderItem, { as: "orderItems", foreignKey: "orderId"});
  Cart.belongsTo(Product, { as: "product", foreignKey: "productId"});
  Product.hasMany(Cart, { as: "carts", foreignKey: "productId"});
  OrderItem.belongsTo(Product, { as: "product", foreignKey: "productId"});
  Product.hasMany(OrderItem, { as: "orderItems", foreignKey: "productId"});
  ProductImage.belongsTo(Product, { as: "product", foreignKey: "productId"});
  Product.hasMany(ProductImage, { as: "productImages", foreignKey: "productId"});
  ProductPolicy.belongsTo(Product, { as: "product", foreignKey: "productId"});
  Product.hasMany(ProductPolicy, { as: "productPolicies", foreignKey: "productId"});
  ProductSpec.belongsTo(Product, { as: "product", foreignKey: "productId"});
  Product.hasOne(ProductSpec, { as: "productSpec", foreignKey: "productId"});
  Product.hasOne(ProductSpec, { as: "productSpecs", foreignKey: "productId"});
  Review.belongsTo(Product, { as: "product", foreignKey: "productId"});
  Product.hasMany(Review, { as: "reviews", foreignKey: "productId"});
  Wishlist.belongsTo(Product, { as: "product", foreignKey: "productId"});
  Product.hasMany(Wishlist, { as: "wishlists", foreignKey: "productId"});
  Order.belongsTo(Promotion, { as: "promotion", foreignKey: "promotionId"});
  Promotion.hasMany(Order, { as: "orders", foreignKey: "promotionId"});
  Cart.belongsTo(User, { as: "user", foreignKey: "userId"});
  User.hasMany(Cart, { as: "carts", foreignKey: "userId"});
  ChatMessage.belongsTo(User, { as: "sender", foreignKey: "senderId"});
  User.hasMany(ChatMessage, { as: "chatMessages", foreignKey: "senderId"});
  ChatRoom.belongsTo(User, { as: "assignedAdmin", foreignKey: "assignedAdminId"});
  User.hasMany(ChatRoom, { as: "chatRooms", foreignKey: "assignedAdminId"});
  ChatRoom.belongsTo(User, { as: "customer", foreignKey: "customerId"});
  User.hasMany(ChatRoom, { as: "customerChatRooms", foreignKey: "customerId"});
  Order.belongsTo(User, { as: "user", foreignKey: "userId"});
  User.hasMany(Order, { as: "orders", foreignKey: "userId"});
  PasswordReset.belongsTo(User, { as: "user", foreignKey: "userId"});
  User.hasMany(PasswordReset, { as: "passwordResets", foreignKey: "userId"});
  Review.belongsTo(User, { as: "user", foreignKey: "userId"});
  User.hasMany(Review, { as: "reviews", foreignKey: "userId"});
  Wishlist.belongsTo(User, { as: "user", foreignKey: "userId"});
  User.hasMany(Wishlist, { as: "wishlists", foreignKey: "userId"});

  return {
    Cart,
    Category,
    ChatMessage,
    ChatRoom,
    OrderItem,
    Order,
    PasswordReset,
    ProductImage,
    ProductPolicy,
    ProductSpec,
    Product,
    Promotion,
    Review,
    Slide,
    User,
    Wishlist,
  };
}
