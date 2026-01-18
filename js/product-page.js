console.log("Product Page Script Loaded!"); // Debug: Immediate check

console.log("Product Page Script Loaded!"); // Debug: Immediate check

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Get ID from URL
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  // const API_URL = "http://localhost:1337";
  const API_URL = "https://dynamic-addition-ee01c0a27a.strapiapp.com";
  const mainImg = document.getElementById("main-product-img");
  const titleEl = document.getElementById("product-title");
  const priceEl = document.getElementById("product-price");
  const descEl = document.getElementById("product-desc");
  const addBtn = document.getElementById("add-to-cart-page-btn");
  const stockDisplay = document.getElementById("stock-display");
  const sizeContainer = document.getElementById("size-container");
  const sizeWrapper = document.getElementById("size-options-wrapper");

  let currentProduct = null;
  let selectedVariant = null; // Store the entire variant object (id, size, quantity)

  // Handle Add to Cart
  addBtn.addEventListener("click", () => {
    if (!currentProduct) return;

    if (!selectedVariant) {
      alert("Please select a size.");
      return;
    }

    // Check stock one last time (though button should be disabled)
    if (selectedVariant.quantity <= 0) {
      alert("This size is out of stock.");
      return;
    }

    const cartItem = {
      id: currentProduct.id, // Keep original ID
      uniqueId: `${currentProduct.id}-${selectedVariant.size}`, // Unique ID for cart differentiation
      name: `${currentProduct.name} (${selectedVariant.size})`,
      price: currentProduct.price, // Assuming price is on the main product for now
      image: currentProduct.image,
      size: selectedVariant.size,
      variantId: selectedVariant.id, // Store variant ID if needed for backend updates later
    };

    if (window.addToCart) {
      window.addToCart(cartItem);
      const originalText = addBtn.textContent;
      addBtn.textContent = "Added!";
      addBtn.disabled = true;
      setTimeout(() => {
        addBtn.textContent = originalText;
        addBtn.disabled = false;
      }, 2000);
    } else {
      console.error("addToCart function not found!");
    }
  });

  // If no ID, show error or redirect
  if (!productId) {
    titleEl.textContent = "Product Not Found";
    addBtn.disabled = true;
    return;
  }

  try {
    // Fetch specific product by ID with populate=* to get relations
    const response = await fetch(
      `${API_URL}/api/products/${productId}?populate=*`,
    );

    if (!response.ok) throw new Error("Product not found");

    const payload = await response.json();
    const productData = payload.data;

    if (!productData) throw new Error("No data");

    // Helper to extract attributes (v4 vs v5)
    // Strapi 5 often returns top level, Strapi 4 returns .attributes
    const attrs = productData.attributes ? productData.attributes : productData;
    console.log("FULL PRODUCT ATTRIBUTES:", attrs);
    console.log("Available Keys:", Object.keys(attrs));

    // Check specifically for variants
    if (attrs.product_varients)
      console.log("Found product_varients:", attrs.product_varients);
    else if (attrs.productVarients)
      console.log("Found productVarients:", attrs.productVarients);
    else console.warn("NO VARIANTS FIELD FOUND IN DATA!");

    // Extract Basic Info
    const name = attrs.Name || attrs.name || attrs.Title || "Unknown Product";
    let price = "0.00";
    let rawPrice = attrs.Price !== undefined ? attrs.Price : attrs.price;
    if (rawPrice !== undefined) price = parseFloat(rawPrice).toFixed(2);

    // Image Handling
    let imageUrl = "./img/Recycle black.jpg";
    const imgField =
      attrs.ProductImage ||
      attrs.productImage ||
      attrs.productimage ||
      attrs.Image ||
      attrs.image;

    if (imgField) {
      let imgObj = null;
      if (Array.isArray(imgField)) imgObj = imgField[0];
      else if (imgField.data) {
        imgObj = Array.isArray(imgField.data)
          ? imgField.data[0]
          : imgField.data;
      } else imgObj = imgField;

      if (imgObj) {
        const imgAttrs = imgObj.attributes ? imgObj.attributes : imgObj;
        if (imgAttrs.url) {
          imageUrl = imgAttrs.url.startsWith("http")
            ? imgAttrs.url
            : `${API_URL}${imgAttrs.url}`;
        }
      }
    }

    // Render Basic Info
    titleEl.textContent = name;
    priceEl.textContent = `₦${price}`;

    // Description
    let description = attrs.Description || attrs.description || "";
    if (typeof description === "object" && description !== null) {
      if (Array.isArray(description)) {
        description = description
          .map((block) => {
            if (block.children)
              return block.children.map((c) => c.text).join("");
            return "";
          })
          .join(" ");
      } else {
        description = "";
      }
    }
    descEl.textContent = description;

    mainImg.src = imageUrl;
    mainImg.alt = name;
    document.title = `${name} | SINNER TO SAINTS`;

    currentProduct = {
      id: productData.id,
      name: name,
      price: parseFloat(price),
      image: imageUrl,
    };

    // --- VARIANT & SIZE LOGIC ---
    let variants = [];
    const rawVariants = attrs.product_varients || attrs.productVarients; // Check casing from schema

    if (rawVariants && rawVariants.data && rawVariants.data.length > 0) {
      variants = rawVariants.data.map((v) => ({
        id: v.id,
        ...v.attributes,
      }));
    }

    console.log("Parsed Variants:", variants);

    // Reset UI
    sizeWrapper.innerHTML = "";
    selectedVariant = null;
    addBtn.disabled = true; // Disable until size selected
    addBtn.textContent = "Select Size";
    stockDisplay.innerHTML = "";

    if (variants.length > 0) {
      sizeContainer.style.display = "block";

      // Sort variants order? (Optional: XS, S, M, L, XL, XXL)
      const sizeOrder = ["xs", "s", "m", "l", "xl", "xxl"];
      variants.sort((a, b) => {
        return (
          sizeOrder.indexOf(a.size.toLowerCase()) -
          sizeOrder.indexOf(b.size.toLowerCase())
        );
      });

      variants.forEach((variant) => {
        const sizeBox = document.createElement("div");
        sizeBox.classList.add("size-option");
        sizeBox.textContent = variant.size.toUpperCase();

        // Check if out of stock visually
        if (variant.quantity <= 0) {
          sizeBox.style.opacity = "0.5";
          sizeBox.style.textDecoration = "line-through";
          sizeBox.style.cursor = "not-allowed";
          sizeBox.title = "Out of Stock";
        } else {
          sizeBox.onclick = () => selectSize(variant, sizeBox);
        }

        sizeWrapper.appendChild(sizeBox);
      });
    } else {
      // Fallback for products with no variants (e.g. legacy or simple products)
      // Check if main product has quantity/size direct fields?
      // Based on previous code, there was fallback. Let's keep it minimal for now.
      // If no variants, we might default to "One Size" logic or just enable adding if quantity > 0 on main.

      // Assuming NEW schema usage: Main product might not have quantity anymore.
      // But for safety:
      const mainQty = attrs.Quantity || attrs.quantity;
      if (mainQty !== undefined) {
        sizeContainer.style.display = "none";
        selectedVariant = {
          size: "One Size",
          quantity: mainQty,
          id: "default",
        }; // Mock variant
        updateStockUI(mainQty);
        addBtn.disabled = mainQty <= 0;
        addBtn.textContent = mainQty <= 0 ? "Out of Stock" : "Add to Cart";
      } else {
        // Zero variants and No main quantity?
        sizeContainer.style.display = "none";
        stockDisplay.innerHTML = "Stock information unavailable";
        addBtn.disabled = true;
      }
    }

    function selectSize(variant, element) {
      // Remove active class from all
      document.querySelectorAll(".size-option").forEach((el) => {
        el.style.backgroundColor = "";
        el.style.color = "";
        el.style.borderColor = "#ddd";
      });

      // Set active style
      element.style.backgroundColor = "#000";
      element.style.color = "#fff";
      element.style.borderColor = "#000";

      selectedVariant = variant;
      updateStockUI(variant.quantity);

      if (variant.quantity > 0) {
        addBtn.disabled = false;
        addBtn.textContent = "Add to Cart";
        addBtn.style.backgroundColor = "black";
        addBtn.style.cursor = "pointer";
      } else {
        addBtn.disabled = true;
        addBtn.textContent = "Out of Stock";
        // This case usually prevented by UI blocking click, but good safety
      }
    }

    function updateStockUI(qty) {
      if (qty <= 0) {
        stockDisplay.innerHTML = `<span style="color: #c00; font-weight: 600;">Out of Stock</span>`;
      } else if (qty < 5) {
        stockDisplay.innerHTML = `<span style="color: #c80; font-weight: 600;">Only ${qty} left!</span>`;
      } else {
        stockDisplay.innerHTML = `<span style="color: #0a0; font-weight: 600;">In Stock (${qty})</span>`;
      }
    }
  } catch (error) {
    console.error("Error loading product:", error);
    titleEl.textContent = "Product Error";
    descEl.textContent = `Could not load product details. Error: ${error.message}`;
    addBtn.disabled = true;
  }
});
