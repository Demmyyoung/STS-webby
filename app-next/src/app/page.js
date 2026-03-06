import Link from "next/link";
import Image from "next/image";

const API_URL = "https://dynamic-addition-ee01c0a27a.strapiapp.com";

async function getFeaturedProducts() {
  try {
    const res = await fetch(`${API_URL}/api/products?populate=*`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Failed to fetch data");
    const data = await res.json();

    // Fallback if structured oddly
    const productsArray = data.data || [];

    // Shuffle and pick 3
    const shuffled = [...productsArray].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function Home() {
  const products = await getFeaturedProducts();

  return (
    <main className="main-content" style={{ paddingTop: "180px" }}>
      <section className="split-hero">
        <div className="split-hero-content">
          <h1 className="split-hero-title">
            Season 01
            <br />
            Collection
          </h1>
          <p className="split-hero-subtitle">
            Redefining Streetwear. Slow Motion Is Better Than No Motion. Shop
            the exclusive Sinner to Saints drop.
          </p>
          <div className="split-hero-buttons">
            <Link href="/store" className="brutal-btn">
              Shop Collection &rarr;
            </Link>
            <Link href="/about" className="brutal-btn-outline">
              About The Brand
            </Link>
          </div>
        </div>
        <div
          className="split-hero-image-wrapper brutal-card"
          style={{ position: "relative" }}
        >
          <Image
            src="/img/Floating-white.jpg"
            alt="Platform Screenshot"
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
      </section>

      <section className="vertical-grid-section">
        <div className="vertical-grid">
          {products && products.length > 0 ? (
            products.map((product, index) => {
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
                  const imgAttrs = imgObj.attributes
                    ? imgObj.attributes
                    : imgObj;
                  if (imgAttrs.url)
                    imageUrl = imgAttrs.url.startsWith("http")
                      ? imgAttrs.url
                      : `${API_URL}${imgAttrs.url}`;
                }
              }

              let headerIcon = "★";
              if (index === 1) headerIcon = "♦";
              if (index === 2) headerIcon = "✦";

              const productId = product.documentId || product.id;

              return (
                <div key={productId} className="vertical-column brutal-card">
                  <div className="column-header">
                    {headerIcon} Drop 0{index + 1}
                  </div>
                  <div className="column-body">
                    <h3 className="column-title">{name}</h3>
                    <Link
                      href={`/product/${productId}`}
                      style={{
                        display: "block",
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          aspectRatio: "1",
                          border: "2px solid #000",
                          overflow: "hidden",
                          background: "white",
                        }}
                      >
                        <img
                          src={imageUrl}
                          alt={name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            transition: "transform 0.3s ease",
                          }}
                          className="hover-scale"
                        />
                      </div>
                    </Link>
                    <ul className="checklist-ul" style={{ marginTop: "20px" }}>
                      <li>Available Now</li>
                      <li>
                        ₦
                        {Number(price).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </li>
                      <li>
                        <Link
                          href={`/product/${productId}`}
                          style={{
                            color: "black",
                            fontWeight: "bold",
                            textDecoration: "underline",
                          }}
                        >
                          View Details
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              );
            })
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                gridColumn: "1 / -1",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  width: "100%",
                }}
              >
                <h3
                  style={{
                    fontFamily: '"Anton", sans-serif',
                    fontSize: "1.5rem",
                    marginBottom: "10px",
                    textTransform: "uppercase",
                  }}
                >
                  Coming Soon...
                </h3>
                <p style={{ color: "#888", fontSize: "1rem" }}>
                  Fresh drops are on the way.
                </p>
              </div>
            </div>
          )}
        </div>
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <Link
            href="/store"
            className="brutal-btn"
            style={{ background: "white", color: "black" }}
          >
            Learn More &rarr;
          </Link>
        </div>
      </section>

      <section
        className="signature-block brutal-card"
        style={{
          margin: "20px auto",
          maxWidth: "1400px",
          height: "60vh",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          className="signature-image-placeholder"
          aria-hidden="true"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            zIndex: 0,
          }}
        >
          <Image
            src="/img/Floating-black.jpg"
            alt="Signature Image"
            fill
            style={{ objectFit: "cover" }}
            className="signature-image"
          />
        </div>
        <div
          className="signature-text-container"
          style={{ position: "relative", zIndex: 1 }}
        >
          <p className="signature-text-content">
            "Slow Motion Is Better Than No Motion.
            <br />
            Keep Moving Forward."
          </p>
          <p className="signature-ceo">&mdash; Shevon Salmon</p>
        </div>
      </section>
    </main>
  );
}
