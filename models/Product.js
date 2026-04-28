const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Product = sequelize.define("Products", {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:        { type: DataTypes.STRING(255), allowNull: false, field: "NAME" },
  price:       { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
  description: { type: DataTypes.TEXT },
  category:    { type: DataTypes.STRING(100), allowNull: true },
  stock:       { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
  image_url:   { type: DataTypes.STRING(500), allowNull: true, defaultValue: null },
}, {
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

Product.prototype.toString   = function() { return `Product[${this.id}]: ${this.name} €${this.price}`; };
Product.prototype.toSafeJSON = function() { return { id: this.id, name: this.name, price: this.price, category: this.category, stock: this.stock, image_url: this.image_url }; };

module.exports = Product;