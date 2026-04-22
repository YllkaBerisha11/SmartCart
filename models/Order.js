const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const Order = sequelize.define("Order", {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  user_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  total_price: { 
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM("pending", "processing", "shipped", "delivered", "cancelled"),
    allowNull: false,
    defaultValue: "pending"
  },
}, { 
  timestamps: true, 
  createdAt: "created_at", 
  updatedAt: false 
});

// ✅ POLYMORPHISM - override toString()
Order.prototype.toString = function() {
  return `Order[${this.id}]: €${this.total_price} - Status: ${this.status}`;
};

// ✅ POLYMORPHISM - override validate()
Order.prototype.validate = function() {
  if (!this.total_price || this.total_price <= 0) {
    throw new Error("Çmimi total duhet të jetë pozitiv!");
  }
  const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(this.status)) {
    throw new Error("Statusi i order-it nuk është i vlefshëm!");
  }
  return true;
};

// ✅ POLYMORPHISM - override toSafeJSON()
Order.prototype.toSafeJSON = function() {
  return {
    id: this.id,
    user_id: this.user_id,
    total_price: this.total_price,
    status: this.status,
  };
};

Order.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
User.hasMany(Order, { foreignKey: "user_id" });

module.exports = Order;