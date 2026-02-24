// Server component wrapper — required for generateStaticParams with output: 'export'
import { products } from "@/lib/pgg-data";
import ProductPageClient from "./ProductPageClient";

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  return <ProductPageClient slug={slug} />;
}
