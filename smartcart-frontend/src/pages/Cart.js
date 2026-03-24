import React, { useState } from "react";

function Cart() {
  const [cart, setCart] = useState([]);

  return (
    <div style={{ padding: "50px" }}>
      <h2>Shopping Cart 🛒</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty!</p>
      ) : (
        <div>
          {cart.map((item, index) => (
            <div key={index} style={{ border: "1px solid #ccc", padding: "20px", marginBottom: "10px", borderRadius: "8px" }}>
              <h3>{item.name}</h3>
              <p>Price: ${item.price}</p>
              <p>Quantity: {item.quantity}</p>
            </div>
          ))}
          <h3>Total: ${cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}</h3>
          <button style={{ padding: "10px 30px", background: "#333", color: "white", border: "none", cursor: "pointer" }}>
            Checkout
          </button>
        </div>
      )}
    </div>
  );
}

export default Cart;