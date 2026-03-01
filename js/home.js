// API URL - change localhost to your production URL when deploying
const API_URL = "https://dynamic-addition-ee01c0a27a.strapiapp.com";

// Start fetching immediately
const featuredPromise = fetch(`${API_URL}/api/products?populate=*`)
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  })
  .catch((error) => {
    console.error("Early fetch error:", error);
    return null;
  });

document.addEventListener("DOMContentLoaded", async () => {
  const verticalGrid = document.querySelector(".vertical-grid");

  // Check if we are on the home page and if the grid exists
  if (!verticalGrid) return;

  // Render Skeleton Loading State for Home Page
  verticalGrid.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const skelColumn = document.createElement("div");
    skelColumn.className = "vertical-column brutal-card";
    skelColumn.innerHTML = `
        <div class="column-header">
            <span class="skeleton skeleton-text" style="width: 40%;"></span>
        </div>
        <div class="column-body">
            <h3 class="column-title skeleton skeleton-text" style="width: 70%; margin-bottom: 25px;"></h3>
            <div class="skeleton skeleton-img brutal-card" style="width: 100%; aspect-ratio: 1; border-radius: 0;"></div>
            <ul class="checklist-ul" style="margin-top: 20px;">
                <li class="skeleton skeleton-text" style="width: 80%;"></li>
                <li class="skeleton skeleton-text" style="width: 60%;"></li>
                <li class="skeleton skeleton-text" style="width: 70%;"></li>
            </ul>
        </div>
    `;
    verticalGrid.appendChild(skelColumn);
  }

  try {
    const payload = await featuredPromise;

    if (!payload) {
      // Only if fetch totally failed and returned null
      renderComingSoon(verticalGrid);
      return;
    }

    const products = payload.data;

    // If we have products, pick 3 random ones and render
    if (products && products.length > 0) {
      // Shuffle array logic (Fisher-Yates)
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      const selectedProducts = shuffled.slice(0, 3);

      verticalGrid.innerHTML = ""; // Clear skeletons

      selectedProducts.forEach((product, index) => {
        // Handle Strapi v4 (attributes nested) vs v5 (often flat)
        const attrs = product.attributes ? product.attributes : product;

        // Robust property access
        const name =
          attrs.Name ||
          attrs.name ||
          attrs.Title ||
          attrs.title ||
          "Unnamed Product";

        let rawPrice = attrs.Price;
        if (rawPrice === undefined) rawPrice = attrs.price;

        let price = "0.00";
        if (rawPrice !== undefined && rawPrice !== null) {
          price = parseFloat(rawPrice).toFixed(2);
        }

        // Image handling
        let imageUrl = "./img/Recycle black.jpg"; // Fallback

        const imgData =
          attrs.ProductImage ||
          attrs.productimage ||
          attrs.productImage ||
          attrs.Productimage ||
          attrs.Image ||
          attrs.image;

        if (imgData) {
          let imgObj = null;
          if (Array.isArray(imgData)) {
            imgObj = imgData[0];
          } else if (imgData.data) {
            imgObj = Array.isArray(imgData.data)
              ? imgData.data[0]
              : imgData.data;
          } else {
            imgObj = imgData;
          }

          if (imgObj) {
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

        // Create Column HTML matches the new brutalist design pattern
        const col = document.createElement("div");
        col.className = "vertical-column brutal-card";

        let headerIcon = "★";
        if (index === 1) headerIcon = "♦";
        if (index === 2) headerIcon = "✦";

        col.innerHTML = `
            <div class="column-header">
                ${headerIcon} Drop 0${index + 1}
            </div>
            <div class="column-body">
                <h3 class="column-title">${name}</h3>
                <a href="product.html?id=${product.documentId || product.id}" style="display: block; text-decoration: none; color: inherit;">
                    <!-- Square Image Wrap imitating screenshot -->
                    <div style="width: 100%; aspect-ratio: 1; border: 2px solid #000; overflow: hidden; background: white;">
                        <img src="${imageUrl}" alt="${name}" style="width: 100%; height: 100%; object-fit: contain; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    </div>
                </a>
                <ul class="checklist-ul">
                    <li>Available Now</li>
                    <li>₦${price}</li>
                    <li><a href="product.html?id=${product.documentId || product.id}" style="color: black; font-weight: bold; text-decoration: underline;">View Details</a></li>
                </ul>
            </div>
        `;

        verticalGrid.appendChild(col);
      });
    } else {
      // Valid response but no products
      renderComingSoon(verticalGrid);
    }
  } catch (error) {
    console.error("Error fetching featured products:", error);
    renderComingSoon(verticalGrid);
  }
});

function renderComingSoon(container) {
  container.style.display = "flex"; // Ensure it takes space
  container.style.justifyContent = "center";
  container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; width: 100%;">
            <h3 style="font-family: 'Anton', sans-serif; font-size: 1.5rem; margin-bottom: 10px; text-transform: uppercase;">Coming Soon...</h3>
            <p style="color: #888; font-size: 1rem;">Fresh drops are on the way.</p>
        </div>
    `;
}
