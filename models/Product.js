const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Product = sequelize.define(
  "Products",
  {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    name: { 
      type: DataTypes.STRING(255), 
      allowNull: false, 
      field: "NAME" 
    },
    price: { 
      type: DataTypes.DECIMAL(10, 2), 
      allowNull: false,
      validate: {
        min: 0,
      }
    },
    description: { 
      type: DataTypes.TEXT 
    },
    // ✅ SHTOHET category dhe stock
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      }
    },
  },
  { 
    timestamps: true, 
    createdAt: "created_at", 
    updatedAt: false 
  }
);

module.exports = Product;