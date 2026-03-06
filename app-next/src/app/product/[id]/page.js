import { notFound } from "next/navigation";
import ProductClient from "@/components/ProductClient";

const API_URL = "https://dynamic-addition-ee01c0a27a.strapiapp.com";

async function getProduct(id) {
  try {
    const res = await fetch(`${API_URL}/api/products/${id}?populate=*`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) return { title: "Product Not Found" };

  const attrs = product.attributes ? product.attributes : product;
  const name =
    attrs.Name || attrs.name || attrs.Title || attrs.title || "Unnamed Product";

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
    } else description = "";
  }

  let imageUrl = `${API_URL}/img/Recycle-black.jpg`;
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
      imgObj = Array.isArray(imgData.data) ? imgData.data[0] : imgData.data;
    else imgObj = imgData;

    if (imgObj) {
      const imgAttrs = imgObj.attributes ? imgObj.attributes : imgObj;
      if (imgAttrs.url)
        imageUrl = imgAttrs.url.startsWith("http")
          ? imgAttrs.url
          : `${API_URL}${imgAttrs.url}`;
    }
  }

  return {
    title: `${name} | SINNER TO SAINTS`,
    description: description || "Premium Streetwear Fashion",
    openGraph: {
      title: `${name} | SINNER TO SAINTS`,
      description: description || "Premium Streetwear Fashion",
      images: [imageUrl],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) return notFound();

  return (
    <main>
      <ProductClient product={product} API_URL={API_URL} />
    </main>
  );
}
