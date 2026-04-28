const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const Order = sequelize.define("Order", {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:     { type: DataTypes.INTEGER, allowNull: false },
  total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: {
    type: DataTypes.ENUM("pending","processing","shipped","delivered","cancelled","exchange","return"),
    allowNull: false,
    defaultValue: "pending"
  },
  payment_method: {
    type: DataTypes.ENUM("cash","card","paypal"),
    allowNull: true,
    defaultValue: "cash"
  },
  admin_note: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
}, {
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

Order.prototype.toString    = function() { return `Order[${this.id}]: €${this.total_price} (${this.status})`; };
Order.prototype.toSafeJSON  = function() { return { id: this.id, user_id: this.user_id, total_price: this.total_price, status: this.status, payment_method: this.payment_method }; };

Order.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
User.hasMany(Order,   { foreignKey: "user_id" });

module.exports = Order;