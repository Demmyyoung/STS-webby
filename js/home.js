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
  const featuredGrid = document.querySelector(".featured-grid");

  // Check if we are on the home page and if the grid exists
  if (!featuredGrid) return;

  // Render Skeleton Loading State for Home Page
  featuredGrid.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const skel = document.createElement("div");
    skel.className = "featured-item";
    skel.style.pointerEvents = "none";
    skel.innerHTML = `
        <div class="featured-img-wrap skeleton skeleton-img"></div>
        <div class="featured-info">
            <h3 class="skeleton skeleton-text" style="width: 80%;"></h3>
            <span class="skeleton skeleton-text" style="width: 40%; display: block;"></span>
        </div>
    `;
    featuredGrid.appendChild(skel);
  }

  try {
    const payload = await featuredPromise;

    if (!payload) {
      // Only if fetch totally failed and returned null
      renderComingSoon(featuredGrid);
      return;
    }

    const products = payload.data;

    // If we have products, pick 3 random ones and render
    if (products && products.length > 0) {
      // Shuffle array logic (Fisher-Yates)
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      const selectedProducts = shuffled.slice(0, 3);

      featuredGrid.innerHTML = ""; // Clear skeletons

      selectedProducts.forEach((product) => {
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

        // Create Featured Item HTML (Matching existing structure)
        const link = document.createElement("a");
        link.href = `product.html?id=${product.documentId || product.id}`;
        link.classList.add("featured-item");

        link.innerHTML = `
            <div class="featured-img-wrap">
                <img src="${imageUrl}" alt="${name}">
            </div>
            <div class="featured-info">
                <h3>${name}</h3>
                <span>₦${price}</span>
            </div>
        `;

        featuredGrid.appendChild(link);
      });
    } else {
      // Valid response but no products
      renderComingSoon(featuredGrid);
    }
  } catch (error) {
    console.error("Error fetching featured products:", error);
    renderComingSoon(featuredGrid);
  }
});

function renderComingSoon(container) {
  container.style.display = "flex"; // Ensure it takes space
  container.style.justifyContent = "center";
  container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; width: 100%;">
            <h3 style="font-family: 'Playfair Display', serif; font-size: 1.5rem; margin-bottom: 10px;">Coming Soon...</h3>
            <p style="color: #888; font-size: 1rem;">Fresh drops are on the way.</p>
        </div>
    `;
}
