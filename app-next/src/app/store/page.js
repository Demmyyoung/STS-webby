import Link from "next/link";
import Image from "next/image";

const API_URL = "https://dynamic-addition-ee01c0a27a.strapiapp.com";

async function getProducts() {
  try {
    const res = await fetch(`${API_URL}/api/products?populate=*`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Failed to fetch data");
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function Store() {
  const products = await getProducts();

  return (
    <main className="store-main" style={{ paddingTop: "180px" }}>
      <section className="store-hero">
        <h1 className="store-title">The Collection</h1>
        <p className="store-subtitle">Sinner to Saints &mdash; Season 01</p>
      </section>

      <div className="product-grid">
        {!products ? (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "60px 20px",
            }}
          >
            <h2
              style={{
                fontFamily: '"Anton", sans-serif',
                fontSize: "2rem",
                marginBottom: "15px",
                textTransform: "uppercase",
              }}
            >
              Coming Soon...
            </h2>
            <p style={{ color: "#888", fontSize: "1.1rem" }}>
              Our store is currently being updated. Stay tuned.
            </p>
          </div>
        ) : products.length > 0 ? (
          products.map((product) => {
            const attrs = product.attributes ? product.attributes : product;

            const name =
              attrs.Name ||
              attrs.name ||
              attrs.Title ||
              attrs.title ||
              "Unnamed Product";

            let rawPrice =
              attrs.Price !== undefined ? attrs.Price : attrs.price;
            let price =
              rawPrice !== undefined && rawPrice !== null
                ? parseFloat(rawPrice).toFixed(2)
                : "0.00";

            let imageUrl = "/img/Recycle-black.jpg";
            let hoverImageUrl = null;

            const imgData =
              attrs.ProductImage ||
              attrs.productimage ||
              attrs.productImage ||
              attrs.Productimage ||
              attrs.Image ||
              attrs.image;
            if (imgData) {
              let imgObj = null;
              if (Array.isArray(imgData)) imgObj = imgData[0];
              else if (imgData.data)
                imgObj = Array.isArray(imgData.data)
                  ? imgData.data[0]
                  : imgData.data;
              else imgObj = imgData;

              if (imgObj) {
                const imgAttrs = imgObj.attributes ? imgObj.attributes : imgObj;
                if (imgAttrs.url)
                  imageUrl = imgAttrs.url.startsWith("http")
                    ? imgAttrs.url
                    : `${API_URL}${imgAttrs.url}`;
              }

              // Hover image logic
              let allImages = [];
              if (Array.isArray(imgData)) allImages = imgData;
              else if (imgData.data && Array.isArray(imgData.data))
                allImages = imgData.data;

              if (allImages.length > 1) {
                const secondImg = allImages[1];
                const sImgAttrs = secondImg.attributes || secondImg;
                if (sImgAttrs.url)
                  hoverImageUrl = sImgAttrs.url.startsWith("http")
                    ? sImgAttrs.url
                    : `${API_URL}${sImgAttrs.url}`;
              }
            }

            const hoverImgData =
              attrs.HoverImage || attrs.hoverImage || attrs.hoverimage;
            if (hoverImgData) {
              let hImgObj = null;
              if (Array.isArray(hoverImgData)) hImgObj = hoverImgData[0];
              else if (hoverImgData.data)
                hImgObj = Array.isArray(hoverImgData.data)
                  ? hoverImgData.data[0]
                  : hoverImgData.data;
              else hImgObj = hoverImgData;

              if (hImgObj) {
                const hImgAttrs = hImgObj.attributes || hImgObj;
                if (hImgAttrs.url)
                  hoverImageUrl = hImgAttrs.url.startsWith("http")
                    ? hImgAttrs.url
                    : `${API_URL}${hImgAttrs.url}`;
              }
            }

            let description = attrs.Description || attrs.description || "";
            if (typeof description === "object" && description !== null) {
              if (Array.isArray(description)) {
                description = description
                  .map((block) =>
                    block.children
                      ? block.children.map((child) => child.text).join("")
                      : "",
                  )
                  .join(" ");
              } else {
                description = "";
              }
            }

            const productId = product.documentId || product.id;

            return (
              <div
                key={productId}
                className="product-card brutal-card"
                style={{
                  padding: "15px",
                  display: "flex",
                  flexDirection: "column",
                  boxSizing: "border-box",
                }}
              >
                <div
                  className="product-image-wrapper"
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "1",
                  }}
                >
                  <Image
                    src={imageUrl}
                    alt={name}
                    className="product-img"
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {hoverImageUrl && (
                    <Image
                      src={hoverImageUrl}
                      alt={`${name} Hover`}
                      className="hover-img"
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  )}
                </div>
                <div className="product-details">
                  <h3 className="product-name">{name}</h3>
                  <span className="product-price">
                    ₦
                    {Number(price).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                {description && (
                  <p
                    className="product-description"
                    style={{
                      margin: "0.5rem 0",
                      fontSize: "0.9rem",
                      color: "#666",
                    }}
                  >
                    {description}
                  </p>
                )}

                <Link
                  href={`/product/${productId}`}
                  className="brutal-btn"
                  style={{
                    display: "block",
                    textAlign: "center",
                    marginTop: "15px",
                    width: "100%",
                    boxSizing: "border-box",
                    fontSize: "0.9rem",
                  }}
                >
                  View Product
                </Link>
              </div>
            );
          })
        ) : (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "60px 20px",
            }}
          >
            <h2
              style={{
                fontFamily: '"Anton", sans-serif',
                fontSize: "2rem",
                marginBottom: "15px",
                textTransform: "uppercase",
              }}
            >
              Coming Soon...
            </h2>
            <p style={{ color: "#888", fontSize: "1.1rem" }}>
              Our store is currently being updated. Stay tuned.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
