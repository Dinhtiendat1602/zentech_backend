import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Slide extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: true,
      defaultValue: null
    },
    linkUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      field: 'link_url'
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'sort_order'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    sequelize,
    tableName: 'slides',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "slides_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
