"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const cart = JSON.parse(localStorage.getItem("sts_cart") || "[]");
    setCartItems(cart);
  }, []);

  const removeFromCart = (index) => {
    const newCart = [...cartItems];
    newCart.splice(index, 1);
    setCartItems(newCart);
    localStorage.setItem("sts_cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const total = cartItems.reduce(
    (acc, item) =>
      acc + Number(item.price || 0) * (item.cartQuantity || item.quantity || 1),
    0,
  );

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <main
      className="cart-main"
      style={{
        paddingTop: "180px",
        maxWidth: "800px",
        margin: "0 auto",
        minHeight: "60vh",
      }}
    >
      <h1
        className="cart-title"
        style={{
          fontFamily: '"Anton", sans-serif',
          fontSize: "3rem",
          marginBottom: "40px",
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: "2px",
        }}
      >
        Your Cart
      </h1>

      <div
        className="cart-items"
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        {cartItems.map((item, index) => {
          const itemTotal =
            Number(item.price || 0) * (item.cartQuantity || item.quantity || 1);
          return (
            <div
              key={item.uniqueId || index}
              className="cart-item"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                paddingBottom: "20px",
                borderBottom: "1px solid #eee",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "100px",
                  position: "relative",
                  background: "#f0f0f0",
                }}
              >
                <Image
                  src={item.image || "/img/Recycle black.jpg"}
                  alt={item.name || "Product"}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="80px"
                />
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontFamily: '"Anton", sans-serif',
                    fontSize: "1.2rem",
                    margin: "0 0 5px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {item.name}
                </h3>
                <div style={{ color: "#666", fontSize: "0.9rem" }}>
                  ₦
                  {Number(item.price || 0).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  x {item.cartQuantity || item.quantity || 1}
                </div>
                <button
                  onClick={() => removeFromCart(index)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#888",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    textDecoration: "underline",
                    padding: 0,
                    marginTop: "5px",
                  }}
                >
                  Remove
                </button>
              </div>
              <div style={{ fontWeight: 600 }}>
                ₦
                {itemTotal.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          );
        })}
      </div>

      {cartItems.length > 0 ? (
        <div
          className="cart-summary"
          style={{
            marginTop: "40px",
            textAlign: "right",
            paddingTop: "20px",
            borderTop: "2px solid black",
          }}
        >
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              marginBottom: "20px",
              fontFamily: '"Anton", sans-serif',
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Total: ₦
            <span>
              {total.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <Link
            href="/checkout"
            className="checkout-btn brutal-btn"
            style={{
              width: "100%",
              textAlign: "center",
              boxSizing: "border-box",
              background: "black",
              color: "white",
              padding: "15px 30px",
              textDecoration: "none",
              fontSize: "1rem",
              textTransform: "uppercase",
              letterSpacing: "1px",
              display: "inline-block",
            }}
          >
            Proceed to Checkout
          </Link>
        </div>
      ) : (
        <div style={{ textAlign: "center", color: "#888", marginTop: "40px" }}>
          <p>Your cart is empty.</p>
          <Link
            href="/store"
            style={{
              color: "black",
              textDecoration: "underline",
              marginTop: "10px",
              display: "inline-block",
            }}
          >
            Continue Shopping
          </Link>
        </div>
      )}
    </main>
  );
}
