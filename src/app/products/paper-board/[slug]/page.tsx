import type { Metadata } from "next";
import { products } from "@/lib/pgg-data";
import ProductPageClient from "../../ProductPageClient";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, faqJsonLd, productJsonLd, productFaqs, SITE } from "@/lib/seo";

export async function generateStaticParams() {
  return products
    .filter((p) => p.category === "Paper & Board")
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
    openGraph: { title: p.name, description: p.tagline, images: p.images?.[0] ? [`${SITE.url}${p.images[0]}`] : undefined },
    alternates: { canonical: `/products/paper-board/${p.slug}/` },
  };
}

export default async function PaperBoardProductPage({ params }: Props) {
  const { slug } = await params;
  const p = products.find((x) => x.slug === slug);
  return (
    <>
      {p && (
        <JsonLd data={[
          productJsonLd(p),
          faqJsonLd(productFaqs(p)),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Paper & Board", path: "/products/paper-board/" },
            { name: p.name, path: `/products/paper-board/${p.slug}/` },
          ]),
        ]} />
      )}
      <ProductPageClient slug={slug} />
    </>
  );
}
