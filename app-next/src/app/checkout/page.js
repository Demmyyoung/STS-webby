"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import Link from "next/link";

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reference, setReference] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("sts_cart") || "[]");
    setCartItems(cart);
    setMounted(true);
    if (cart.length === 0) {
      window.location.href = "/cart";
    }

    // Safely load Paystack
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const total = cartItems.reduce(
    (acc, item) =>
      acc + Number(item.price || 0) * (item.cartQuantity || item.quantity || 1),
    0,
  );

  const handlePayment = (e) => {
    e.preventDefault();

    const orderItems = cartItems
      .map(
        (item) =>
          `${item.name} (${item.size || "N/A"}) x ${item.cartQuantity || item.quantity || 1}`,
      )
      .join(", ");

    if (!window.PaystackPop) {
      alert(
        "Payment gateway is still loading. Please try again in a few seconds.",
      );
      return;
    }

    // Using window.PaystackPop because of the external Script tag
    const handler = window.PaystackPop.setup({
      key: "pk_live_035e2c19ee478c181c97da5382db9d25e44bdd61",
      email: formData.email,
      amount: total * 100,
      currency: "NGN",
      metadata: {
        custom_fields: [
          {
            display_name: "Order Items",
            variable_name: "order_items",
            value: orderItems,
          },
          {
            display_name: "Full Name",
            variable_name: "full_name",
            value: formData.fullName,
          },
          {
            display_name: "Address",
            variable_name: "address",
            value: formData.address,
          },
          { display_name: "City", variable_name: "city", value: formData.city },
          {
            display_name: "State",
            variable_name: "state",
            value: formData.state,
          },
          {
            display_name: "Zip Code",
            variable_name: "zip_code",
            value: formData.zip,
          },
        ],
      },
      onClose: function () {
        alert("Payment window closed.");
      },
      callback: function (response) {
        // Decrease stock in Strapi
        const decreaseStock = async () => {
          const API_URL = "https://dynamic-addition-ee01c0a27a.strapiapp.com";
          for (const item of cartItems) {
            try {
              if (item.variantId && item.variantId !== "default") {
                await fetch(`${API_URL}/api/product-varients/decrement`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: item.variantId }),
                });
              }
            } catch (err) {
              console.error(err);
            }
          }
        };

        decreaseStock();

        localStorage.removeItem("sts_cart");
        window.dispatchEvent(new Event("cartUpdated"));
        setSuccess(true);
        setReference(response.reference);
      },
    });
    handler.openIframe();
  };

  if (!mounted) return null;

  if (success) {
    return (
      <main
        style={{ paddingTop: "180px", textAlign: "center", minHeight: "60vh" }}
      >
        <h1 style={{ fontFamily: '"Anton", sans-serif', fontSize: "2.5rem" }}>
          Thank You!
        </h1>
        <p>Your order has been placed successfully.</p>
        <p>Reference: {reference}</p>
        <Link
          href="/"
          style={{
            textDecoration: "underline",
            color: "black",
            marginTop: "20px",
            display: "inline-block",
          }}
        >
          Back to Home
        </Link>
      </main>
    );
  }

  return (
    <>
      <main
        className="checkout-main"
        style={{
          paddingTop: "180px",
          maxWidth: "600px",
          margin: "0 auto",
          minHeight: "60vh",
        }}
      >
        <h1
          className="checkout-title"
          style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: "2.5rem",
            marginBottom: "30px",
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          Checkout
        </h1>

        <form
          onSubmit={handlePayment}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>
              Email Address
            </label>
            <input
              type="email"
              required
              style={{ padding: "10px", border: "2px solid black" }}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>
              Full Name
            </label>
            <input
              type="text"
              required
              style={{ padding: "10px", border: "2px solid black" }}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>
              Shipping Address
            </label>
            <textarea
              rows="3"
              required
              style={{ padding: "10px", border: "2px solid black" }}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            ></textarea>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="City"
              required
              style={{ flex: 1, padding: "10px", border: "2px solid black" }}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="State/Province"
              required
              style={{ flex: 1, padding: "10px", border: "2px solid black" }}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Zip"
              required
              style={{
                width: "80px",
                padding: "10px",
                border: "2px solid black",
              }}
              onChange={(e) =>
                setFormData({ ...formData, zip: e.target.value })
              }
            />
          </div>

          <div
            className="checkout-summary brutal-card"
            style={{
              background: "#f9f9f9",
              padding: "20px",
              marginTop: "20px",
              border: "2px solid black",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Order Summary</h3>
            <div
              style={{
                fontSize: "0.9rem",
                color: "#666",
                marginBottom: "10px",
              }}
            >
              {cartItems.map((item, i) => (
                <p key={i}>
                  {item.name} x {item.cartQuantity || item.quantity || 1} - ₦
                  {(
                    Number(item.price || 0) *
                    (item.cartQuantity || item.quantity || 1)
                  ).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
                fontSize: "1.1rem",
                borderTop: "1px solid #ddd",
                paddingTop: "10px",
              }}
            >
              <span>Total</span>
              <span>
                ₦
                {total.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="pay-btn brutal-btn"
            style={{
              background: "black",
              color: "white",
              padding: "15px",
              border: "none",
              fontSize: "1rem",
              textTransform: "uppercase",
              letterSpacing: "1px",
              cursor: "pointer",
              width: "100%",
              marginTop: "20px",
            }}
          >
            Pay Now
          </button>
        </form>
      </main>
    </>
  );
}
