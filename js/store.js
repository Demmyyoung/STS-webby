// API URL - change localhost to your production URL when deploying
// const API_URL = "https://dynamic-addition-ee01c0a27a.strapiapp.com";
const API_URL = "http://localhost:1337";

// Start fetching immediately (Eager Fetch)
// This kicks off the network request before the DOM is even ready
const productsPromise = fetch(`${API_URL}/api/products?populate=*`)
  .then((response) => response.json())
  .catch((error) => {
    console.error("Early fetch error:", error);
    return null; // Handle error downstream
  });

document.addEventListener("DOMContentLoaded", async () => {
  const productGrid = document.querySelector(".product-grid");

  // Check if we are on the store page and if the grid exists
  if (!productGrid) return;

  try {
    // Await the promise we started earlier
    const payload = await productsPromise;

    if (!payload) {
      throw new Error("Payload is null (fetch failed)");
    }

    console.log("Strapi Payload:", payload); // DEBUG: Check console to see structure

    const products = payload.data;

    // If we have products, clear the hardcoded ones and render new ones
    if (products && products.length > 0) {
      productGrid.innerHTML = ""; // Clear items

      products.forEach((product) => {
        // Handle Strapi v4 (attributes nested) vs v5 (often flat)
        // If 'product.attributes' exists, use it. Otherwise assume 'product' is the object.
        const attrs = product.attributes ? product.attributes : product;

        console.log("Product Attributes:", attrs); // DEBUG: Check this in console

        // Robust property access (Case-insensitive check)
        const name =
          attrs.Name ||
          attrs.name ||
          attrs.Title ||
          attrs.title ||
          "Unnamed Product";

        let rawPrice = attrs.Price;
        if (rawPrice === undefined) rawPrice = attrs.price;

        // Ensure price is a number and formatted
        let price = "0.00";
        if (rawPrice !== undefined && rawPrice !== null) {
          price = parseFloat(rawPrice).toFixed(2);
        }

        // Image handling
        let imageUrl = "./img/Recycle black.jpg"; // Fallback local image

        // Check for Image object (try all case variations and field names)
        const imgData =
          attrs.ProductImage ||
          attrs.productimage ||
          attrs.productImage ||
          attrs.Productimage ||
          attrs.Image ||
          attrs.image;

        if (imgData) {
          // It could be an array (v4 media list) or object (v5 single media)
          // It could be inside 'data' (v4 relation wrapper) or direct

          // Normalize to a single object if possible
          let imgObj = null;

          if (Array.isArray(imgData)) {
            imgObj = imgData[0];
          } else if (imgData.data) {
            // v4 wrapper
            imgObj = Array.isArray(imgData.data)
              ? imgData.data[0]
              : imgData.data;
          } else {
            imgObj = imgData;
          }

          // Now extract URL from the normalized object
          if (imgObj) {
            // Again, check if attributes is nested in the media object (v4) or flat (v5)
            const imgAttrs = imgObj.attributes ? imgObj.attributes : imgObj;

            if (imgAttrs.url) {
              if (imgAttrs.url.startsWith("http")) {
                imageUrl = imgAttrs.url;
              } else {
                imageUrl = `${API_URL}${imgAttrs.url}`;
              }
            } else if (
              imgAttrs.formats &&
              imgAttrs.formats.medium &&
              imgAttrs.formats.medium.url
            ) {
              if (imgAttrs.formats.medium.url.startsWith("http")) {
                imageUrl = imgAttrs.formats.medium.url;
              } else {
                imageUrl = `${API_URL}${imgAttrs.formats.medium.url}`;
              }
            }
          }
        }

        // Create Product Card HTML
        const card = document.createElement("div");
        card.classList.add("product-card");

        // Description handling: Check if it's Rich Text (Blocks) or plain text
        let description = attrs.Description || attrs.description || "";

        // If it's the Strapi V5 Blocks format (array of objects), extract text
        if (typeof description === "object" && description !== null) {
          // Simple text extraction from Blocks
          if (Array.isArray(description)) {
            description = description
              .map((block) => {
                if (block.children) {
                  return block.children.map((child) => child.text).join("");
                }
                return "";
              })
              .join(" ");
          } else {
            // Should not happen for standard text fields, but failsafe
            console.warn("Unknown description format:", description);
            description = "";
          }
        }

        card.innerHTML = `
              <div class="product-image-wrapper">
                  <img src="${imageUrl}" alt="${name}" class="product-img">
              </div>
              <div class="product-details">
                  <h3 class="product-name">${name}</h3>
                  <span class="product-price">₦${price}</span>
              </div>
              ${
                description
                  ? `<p class="product-description" style="margin: 0.5rem 0; font-size: 0.9rem; color: #666;">${description}</p>`
                  : ""
              }
              <a href="product.html?id=${
                product.documentId || product.id
              }" class="add-to-cart-btn" style="
                  display: block;
                  text-decoration: none;
                  text-align: center;
                  margin-top: 10px;
                  width: 100%;
                  padding: 10px;
                  background: black;
                  color: white;
                  border: none;
                  font-family: inherit;
                  cursor: pointer;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  font-size: 0.9rem;
                  transition: opacity 0.3s;
              ">View Product</a>
          `;

        // No click listener needed for link, it just navigates
        // Add hover effect via JS since inline styles are used (or could use CSS class)
        const btn = card.querySelector(".add-to-cart-btn");
        btn.addEventListener("mouseenter", () => (btn.style.opacity = "0.8"));
        btn.addEventListener("mouseleave", () => (btn.style.opacity = "1"));

        productGrid.appendChild(card);
      });
    } else {
      // No products found or empty list
      productGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
              <h2 style="font-family: 'Playfair Display', serif; font-size: 2rem; margin-bottom: 15px;">Coming Soon...</h2>
              <p style="color: #888; font-size: 1.1rem;">Our store is currently being updated. Stay tuned.</p>
          </div>
      `;
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    // Display Coming Soon on error
    productGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
            <h2 style="font-family: 'Playfair Display', serif; font-size: 2rem; margin-bottom: 15px;">Coming Soon...</h2>
            <p style="color: #888; font-size: 1.1rem;">Our store is currently being updated. Stay tuned.</p>
        </div>
    `;
  }
});
