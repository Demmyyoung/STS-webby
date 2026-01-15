document.addEventListener("DOMContentLoaded", async () => {
  const featuredGrid = document.querySelector(".featured-grid");

  // API URL - change localhost to your production URL when deploying
  const API_URL = "https://dynamic-addition-ee01c0a27a.strapiapp.com";

  // Check if we are on the home page and if the grid exists
  if (!featuredGrid) return;

  try {
    // Fetch products from Strapi
    const response = await fetch(`${API_URL}/api/products?populate=*`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const payload = await response.json();
    const products = payload.data;

    // If we have products, pick 3 random ones and render
    if (products && products.length > 0) {
      // Shuffle array logic (Fisher-Yates)
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      const selectedProducts = shuffled.slice(0, 3);

      featuredGrid.innerHTML = ""; // Clear hardcoded items

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
              imageUrl = `${API_URL}${imgAttrs.url}`;
            } else if (
              imgAttrs.formats &&
              imgAttrs.formats.medium &&
              imgAttrs.formats.medium.url
            ) {
              imageUrl = `${API_URL}${imgAttrs.formats.medium.url}`;
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
                <span>$${price}</span>
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
