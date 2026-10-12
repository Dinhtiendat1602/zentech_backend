import _sequelize from 'sequelize';
const { Model } = _sequelize;

export default class ProductSpec extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        productId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: 'products',
            key: 'id',
          },
          field: 'product_id',
        },
        sensor: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: 'sensor',
        },
        imageProcessor: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: 'image_processor',
        },
        videoCapability: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: 'video_capability',
        },
        ibis: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: 'ibis',
        },
        isoRange: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: 'iso_range',
        },
        lensMount: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: 'lens_mount',
        },
        screen: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: 'screen',
        },
        weight: {
          type: DataTypes.STRING(100),
          allowNull: true,
          field: 'weight',
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'created_at',
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'updated_at',
        },
      },
      {
        sequelize,
        tableName: 'product_specs',
        schema: 'public',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            name: 'product_specs_pkey',
            unique: true,
            fields: [{ name: 'id' }],
          },
          {
            name: 'product_specs_product_id_key',
            unique: true,
            fields: [{ name: 'product_id' }],
          },
        ],
      }
    );
  }
}

