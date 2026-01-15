console.log("Product Page Script Loaded!"); // Debug: Immediate check

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Get ID from URL
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  const API_URL = "https://dynamic-addition-ee01c0a27a.strapiapp.com";
  const mainImg = document.getElementById("main-product-img");
  const titleEl = document.getElementById("product-title");
  const priceEl = document.getElementById("product-price");
  const descEl = document.getElementById("product-desc");
  const addBtn = document.getElementById("add-to-cart-page-btn");
  const sizeInputs = document.querySelectorAll(".size-option-input");

  let currentProduct = null;
  let selectedSize = null;

  // Handle Size Selection
  sizeInputs.forEach((input) => {
    input.addEventListener("change", (e) => {
      selectedSize = e.target.value;
      // Enable button if product is loaded
      if (currentProduct) {
        addBtn.disabled = false;
        addBtn.textContent = "Add to Cart";
      }
    });
  });

  // Handle Add to Cart
  addBtn.addEventListener("click", () => {
    if (!currentProduct) return;

    if (!selectedSize) {
      alert("Please select a size.");
      return;
    }

    // Add to cart with size
    // We reuse the addToCart global function from cart.js if available
    // Or we assume cart.js logic: create object and call addToCart(item)

    const cartItem = {
      id: currentProduct.id, // Keep original ID
      uniqueId: `${currentProduct.id}-${selectedSize}`, // Unique ID for cart differentiation
      name: `${currentProduct.name} (${selectedSize})`,
      price: currentProduct.price,
      image: currentProduct.image,
      size: selectedSize,
    };

    if (window.addToCart) {
      window.addToCart(cartItem);
      addBtn.textContent = "Added!";
      setTimeout(() => {
        addBtn.textContent = "Add to Cart";
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
    // Fetch specific product by ID
    // Note: Strapi findOne usually requires /api/products/ID
    const response = await fetch(
      `${API_URL}/api/products/${productId}?populate=*`
    );

    if (!response.ok) throw new Error("Product not found");

    const payload = await response.json();
    const productData = payload.data;

    if (!productData) throw new Error("No data");

    // Helper to extract attributes (v4 vs v5)
    const attrs = productData.attributes ? productData.attributes : productData;
    console.log("Product Attributes Keys:", Object.keys(attrs)); // See exact field names
    console.log("Product Attributes:", attrs);

    // Extract Data
    const name = attrs.Name || attrs.name || attrs.Title || "Unknown Product";

    let price = "0.00";
    let rawPrice = attrs.Price !== undefined ? attrs.Price : attrs.price;
    if (rawPrice !== undefined) price = parseFloat(rawPrice).toFixed(2);

    let description = attrs.Description || attrs.description || "";
    // Handle Rich Text (Blocks)
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

    // Image Handling
    let imageUrl = "./img/Recycle black.jpg";
    const imgField =
      attrs.ProductImage ||
      attrs.productImage ||
      attrs.productimage ||
      attrs.Image ||
      attrs.image;

    // alert("Image Field Found: " + !!imgField); // Debug Alert

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
        console.log("Image Attributes:", imgAttrs); // Debug

        // Check if we have a direct url
        if (imgAttrs.url) {
          if (imgAttrs.url.startsWith("http")) {
            imageUrl = imgAttrs.url;
          } else {
            imageUrl = `${API_URL}${imgAttrs.url}`;
          }
        }
        // fallback to formats
        else if (
          imgAttrs.formats &&
          imgAttrs.formats.medium &&
          imgAttrs.formats.medium.url
        ) {
          imageUrl = `${API_URL}${imgAttrs.formats.medium.url}`;
        } else if (
          imgAttrs.formats &&
          imgAttrs.formats.small &&
          imgAttrs.formats.small.url
        ) {
          imageUrl = `${API_URL}${imgAttrs.formats.small.url}`;
        } else if (
          imgAttrs.formats &&
          imgAttrs.formats.thumbnail &&
          imgAttrs.formats.thumbnail.url
        ) {
          imageUrl = `${API_URL}${imgAttrs.formats.thumbnail.url}`;
        }
      }
    }

    // Render Data
    titleEl.textContent = name;
    priceEl.textContent = `₦${price}`;
    descEl.textContent = description;
    mainImg.src = imageUrl;
    mainImg.alt = name;
    document.title = `${name} | SINNER TO SAINTS`;

    // Store for Cart Logic
    currentProduct = {
      id: productData.id,
      name: name,
      price: parseFloat(price),
      image: imageUrl,
    };
  } catch (error) {
    console.error("Error loading product:", error);
    titleEl.textContent = "Product Not Found";
    descEl.textContent =
      "We couldn't load this product. Please try again later.";
    addBtn.disabled = true;
  }
});
