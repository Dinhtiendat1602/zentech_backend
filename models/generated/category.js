import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Category extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: "categories_slug_key"
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "brand"
    },
    thumbnail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      },
      field: 'parent_id'
    }
  }, {
    sequelize,
    tableName: 'categories',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "categories_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "categories_slug_key",
        unique: true,
        fields: [
          { name: "slug" },
        ]
      },
      {
        name: "idx_category_slug",
        fields: [
          { name: "slug" },
        ]
      },
      {
        name: "idx_category_type",
        fields: [
          { name: "type" },
        ]
      },
      {
        name: "idx_parent_id",
        fields: [
          { name: "parent_id" },
        ]
      },
    ]
  });
  }
}
