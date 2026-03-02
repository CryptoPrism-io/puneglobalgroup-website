import { products } from "@/lib/pgg-data";
import ProductPageClient from "../../ProductPageClient";

export async function generateStaticParams() {
  return products
    .filter((p) => p.category === "PP Packaging")
    .map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export default async function PPCorrugatedProductPage({ params }: Props) {
  const { slug } = await params;
  return <ProductPageClient slug={slug} />;
}
