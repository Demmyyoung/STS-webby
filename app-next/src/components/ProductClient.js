"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductClient({ product, API_URL }) {
  const attrs = product.attributes ? product.attributes : product;
  const name =
    attrs.Name || attrs.name || attrs.Title || attrs.title || "Unnamed Product";

  let rawPrice = attrs.Price !== undefined ? attrs.Price : attrs.price;
  let price =
    rawPrice !== undefined && rawPrice !== null
      ? parseFloat(rawPrice).toFixed(2)
      : "0.00";

  // Image Extraction
  let allImageUrls = [];
  const imgField =
    attrs.ProductImage ||
    attrs.productImage ||
    attrs.productimage ||
    attrs.Image ||
    attrs.image;
  if (imgField) {
    let imgArray = [];
    if (Array.isArray(imgField)) imgArray = imgField;
    else if (imgField.data)
      imgArray = Array.isArray(imgField.data) ? imgField.data : [imgField.data];
    else imgArray = [imgField];

    imgArray.forEach((imgObj) => {
      if (imgObj) {
        const imgAttrs = imgObj.attributes ? imgObj.attributes : imgObj;
        if (imgAttrs.url) {
          const url = imgAttrs.url.startsWith("http")
            ? imgAttrs.url
            : `${API_URL}${imgAttrs.url}`;
          allImageUrls.push(url);
        }
      }
    });
  }

  const hoverImgField =
    attrs.HoverImage || attrs.hoverImage || attrs.hoverimage;
  if (hoverImgField) {
    let hImgObj = null;
    if (Array.isArray(hoverImgField)) hImgObj = hoverImgField[0];
    else if (hoverImgField.data)
      hImgObj = Array.isArray(hoverImgField.data)
        ? hoverImgField.data[0]
        : hoverImgField.data;
    else hImgObj = hoverImgField;

    if (hImgObj) {
      const hImgAttrs = hImgObj.attributes || hImgObj;
      if (hImgAttrs.url) {
        const hoverUrl = hImgAttrs.url.startsWith("http")
          ? hImgAttrs.url
          : `${API_URL}${hImgAttrs.url}`;
        if (!allImageUrls.includes(hoverUrl)) allImageUrls.push(hoverUrl);
      }
    }
  }

  if (allImageUrls.length === 0) allImageUrls.push("/img/Recycle black.jpg");

  // Description Extraction
  let description = attrs.Description || attrs.description || "";
  if (typeof description === "object" && description !== null) {
    if (Array.isArray(description)) {
      description = description
        .map((block) =>
          block.children ? block.children.map((c) => c.text).join("") : "",
        )
        .join(" ");
    } else description = "";
  }

  // Variant Extraction
  let variants = [];
  const potentialKeys = [
    "product_variants",
    "product_varients",
    "productVariants",
    "productVarients",
    "variants",
  ];
  let rawVariants = null;
  for (const key of potentialKeys) {
    if (attrs[key]) {
      rawVariants = attrs[key];
      break;
    }
  }

  if (rawVariants) {
    if (rawVariants.data && Array.isArray(rawVariants.data)) {
      variants = rawVariants.data.map((v) => ({ id: v.id, ...v.attributes }));
    } else if (Array.isArray(rawVariants)) {
      variants = rawVariants.map((v) => ({ id: v.id, ...v }));
    }
  }

  const sizeOrder = ["xs", "s", "m", "l", "xl", "xxl"];
  if (variants.length > 0) {
    variants.sort(
      (a, b) =>
        sizeOrder.indexOf(a.size?.toLowerCase() || "") -
        sizeOrder.indexOf(b.size?.toLowerCase() || ""),
    );
  }

  // State
  const [mainImage, setMainImage] = useState(allImageUrls[0]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [cartFeedback, setCartFeedback] = useState("");

  const handleAddToCart = () => {
    if (variants.length > 0 && !selectedVariant) {
      alert("Please select a size.");
      return;
    }

    // In Phase 3, this will hook into Next.js Context or Redux.
    // Right now, mapping to localStorage for the old cart.js compatibility.
    const cartItem = {
      id: product.documentId || product.id,
      uniqueId: `${product.documentId || product.id}-${selectedVariant?.size || "OneSize"}`,
      name: `${name} ${selectedVariant ? `(${selectedVariant.size})` : ""}`,
      price: price,
      image: mainImage,
      size: selectedVariant?.size || "One Size",
      variantId: selectedVariant?.id || "default",
    };

    let cart = JSON.parse(localStorage.getItem("sts_cart") || "[]");
    const existing = cart.find((item) => item.uniqueId === cartItem.uniqueId);
    if (existing) {
      existing.cartQuantity = (existing.cartQuantity || 1) + 1;
    } else {
      cartItem.cartQuantity = 1;
      cart.push(cartItem);
    }
    localStorage.setItem("sts_cart", JSON.stringify(cart));

    setIsAdding(true);
    setCartFeedback("Added!");
    window.dispatchEvent(new Event("cartUpdated"));

    setTimeout(() => {
      setIsAdding(false);
      setCartFeedback("");
    }, 2000);
  };

  return (
    <div className="product-page-container">
      {/* Left: Image */}
      <div className="product-image-section">
        <div
          className="main-image-wrapper brutal-card"
          style={{
            borderBottom: "2px solid #000",
            position: "relative",
            width: "100%",
            height: "100%",
            aspectRatio: "3/4",
            overflow: "hidden",
          }}
        >
          <Image
            src={mainImage}
            alt={name}
            fill
            style={{ objectFit: "contain" }}
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div
          className="thumbnail-gallery"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))",
            gap: "10px",
            marginTop: "15px",
          }}
        >
          {allImageUrls.length > 1 &&
            allImageUrls.map((url, i) => (
              <div
                key={i}
                className={`thumbnail ${mainImage === url ? "active" : ""}`}
                onClick={() => setMainImage(url)}
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  aspectRatio: "3/4",
                  backgroundColor: "#f5f5f5",
                  overflow: "hidden",
                  cursor: "pointer",
                  border:
                    mainImage === url
                      ? "2px solid #000"
                      : "2px solid transparent",
                  opacity: mainImage === url ? 1 : 0.6,
                }}
              >
                <Image
                  src={url}
                  alt={`${name} view ${i}`}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="100px"
                />
              </div>
            ))}
        </div>
      </div>

      {/* Right: Details */}
      <div
        className="product-info-section"
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        <h1
          className="product-title"
          style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: "3rem",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          {name}
        </h1>
        <div
          className="product-price-lg"
          style={{ fontSize: "1.5rem", color: "#444", fontWeight: 500 }}
        >
          ₦
          {Number(price).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>

        {variants.length > 0 && (
          <div
            className="size-selector-container"
            style={{ marginTop: "30px" }}
          >
            <span
              className="size-label"
              style={{
                display: "block",
                marginBottom: "15px",
                fontSize: "0.9rem",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Size
            </span>
            <div
              className="size-options"
              style={{ display: "flex", gap: "15px" }}
            >
              {variants.map((v) => (
                <div
                  key={v.id}
                  onClick={() => v.quantity > 0 && setSelectedVariant(v)}
                  className="size-option"
                  title={
                    v.quantity <= 0 ? "Out of Stock" : `In Stock: ${v.quantity}`
                  }
                  style={{
                    width: "50px",
                    height: "50px",
                    border:
                      selectedVariant?.id === v.id
                        ? "1px solid #000"
                        : "1px solid #ddd",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: v.quantity > 0 ? "pointer" : "not-allowed",
                    fontFamily: '"Segoe UI", sans-serif',
                    fontSize: "0.9rem",
                    backgroundColor:
                      selectedVariant?.id === v.id ? "#000" : "#fff",
                    color: selectedVariant?.id === v.id ? "#fff" : "#000",
                    opacity: v.quantity <= 0 ? 0.5 : 1,
                    textDecoration: v.quantity <= 0 ? "line-through" : "none",
                  }}
                >
                  {v.size?.toUpperCase()}
                </div>
              ))}
            </div>

            {/* Stock Display */}
            {selectedVariant && (
              <div
                style={{
                  marginTop: "15px",
                  fontFamily: '"Segoe UI", sans-serif',
                  fontSize: "0.9rem",
                }}
              >
                {selectedVariant.quantity <= 0 ? (
                  <span style={{ color: "#c00", fontWeight: 600 }}>
                    Out of Stock
                  </span>
                ) : selectedVariant.quantity < 5 ? (
                  <span style={{ color: "#c80", fontWeight: 600 }}>
                    Only {selectedVariant.quantity} left!
                  </span>
                ) : (
                  <span style={{ color: "#0a0", fontWeight: 600 }}>
                    In Stock ({selectedVariant.quantity})
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {description && (
          <p
            className="product-desc"
            style={{
              fontFamily: '"Segoe UI", sans-serif',
              color: "#666",
              lineHeight: 1.6,
              marginTop: "20px",
              borderTop: "1px solid #eee",
              paddingTop: "20px",
            }}
          >
            {description}
          </p>
        )}

        <button
          onClick={handleAddToCart}
          disabled={
            isAdding ||
            (variants.length > 0 && !selectedVariant) ||
            selectedVariant?.quantity <= 0
          }
          className="add-btn brutal-btn"
          style={{
            marginTop: "40px",
            width: "100%",
            maxWidth: "400px",
            padding: "18px",
            background: "black",
            color: "white",
            border: "none",
            cursor: "pointer",
            textTransform: "uppercase",
            letterSpacing: "2px",
            fontSize: "1rem",
            boxSizing: "border-box",
          }}
        >
          {cartFeedback ||
            (selectedVariant?.quantity <= 0 ? "Out of Stock" : "Add to Cart")}
        </button>
      </div>
    </div>
  );
}
