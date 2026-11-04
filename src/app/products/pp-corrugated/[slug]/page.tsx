import type { Metadata } from "next";
import { products } from "@/lib/pgg-data";
import ProductPageClient from "../../ProductPageClient";

export async function generateStaticParams() {
  return products
    .filter((p) => p.category === "PP Packaging")
    .map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = products.find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: p.name,
    description: `${p.tagline.replace(/\.$/, "")}. Request a quote from Pune Global Group, Pune.`,
    alternates: { canonical: `/products/pp-corrugated/${p.slug}/` },
  };
}

export default async function PPCorrugatedProductPage({ params }: Props) {
  const { slug } = await params;
  return <ProductPageClient slug={slug} />;
}
