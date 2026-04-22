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
      validate: { min: 0 }
    },
    description: { 
      type: DataTypes.TEXT 
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 }
    },
  },
  { 
    timestamps: true, 
    createdAt: "created_at", 
    updatedAt: false 
  }
);

// ✅ POLYMORPHISM - override toString()
Product.prototype.toString = function() {
  return `Product[${this.id}]: ${this.name} - €${this.price} (stock: ${this.stock})`;
};

// ✅ POLYMORPHISM - override validate()
Product.prototype.validate = function() {
  if (!this.name || this.name.length < 2) {
    throw new Error("Emri i produktit duhet të ketë të paktën 2 karaktere!");
  }
  if (!this.price || this.price <= 0) {
    throw new Error("Çmimi duhet të jetë pozitiv!");
  }
  if (this.stock < 0) {
    throw new Error("Stock nuk mund të jetë negativ!");
  }
  return true;
};

// ✅ POLYMORPHISM - override toSafeJSON()
Product.prototype.toSafeJSON = function() {
  return {
    id: this.id,
    name: this.name,
    price: this.price,
    category: this.category,
    stock: this.stock,
  };
};

module.exports = Product;