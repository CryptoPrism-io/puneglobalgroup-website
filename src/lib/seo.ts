// Structured data (schema.org JSON-LD) and FAQ helpers shared by pages.
// Only facts already published on the site go in here.
import type { BlogPost, Product } from "@/lib/pgg-data";

export const SITE = {
  url: "https://puneglobalgroup.in",
  name: "Pune Global Group",
  phone: "+91-98233-83230",
  logo: "https://puneglobalgroup.in/favicon.svg",
  ogImage: "https://puneglobalgroup.in/og.png",
  description:
    "Manufacturer of custom PP corrugated boxes, trays, bins, layer pads and separators for automotive, pharma and electronics plants, and supplier of ITC PSPD and TNPL paper and board grades. Pune, India, since 1995.",
};

export type Faq = { q: string; a: string };

export function productPathFor(p: Pick<Product, "slug" | "category">): string {
  return p.category === "PP Packaging"
    ? `/products/pp-corrugated/${p.slug}/`
    : `/products/paper-board/${p.slug}/`;
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${SITE.url}/#org`,
    name: SITE.name,
    url: SITE.url,
    logo: SITE.logo,
    image: SITE.ogImage,
    description: SITE.description,
    telephone: SITE.phone,
    foundingDate: "1995",
    founder: { "@type": "Person", name: "Umesh Sahu" },
    areaServed: { "@type": "Country", name: "India" },
    address: {
      "@type": "PostalAddress",
      streetAddress: "206 Gulmohar Center Point",
      addressLocality: "Pune",
      postalCode: "411006",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:30",
      closes: "18:30",
    },
    department: {
      "@type": "LocalBusiness",
      name: "Pune Global Group, Sanaswadi plant",
      telephone: SITE.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: "108 BU Bhandari MIDC",
        addressLocality: "Sanaswadi, Pune",
        postalCode: "412208",
        addressRegion: "Maharashtra",
        addressCountry: "IN",
      },
    },
    knowsAbout: [
      "PP corrugated boxes", "Returnable packaging", "PP layer pads", "PP partitions and separators",
      "ESD anti-static packaging", "Folding box board", "Duplex board", "Kraft liner",
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.name,
    publisher: { "@id": `${SITE.url}/#org` },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE.url}${it.path}`,
    })),
  };
}

export function faqJsonLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

function spec(p: Product, label: string): string | undefined {
  return p.specsTable.find((s) => s.label.toLowerCase() === label.toLowerCase())?.value;
}

export function productJsonLd(p: Product) {
  const imgs = p.images ?? (p.image ? [p.image] : []);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.tagline,
    category: p.category === "PP Packaging" ? "PP corrugated packaging" : "Paper and board",
    url: `${SITE.url}${productPathFor(p)}`,
    image: imgs.map((i) => `${SITE.url}${i}`),
    brand: p.brands?.length ? { "@type": "Brand", name: p.brands[0] } : { "@id": `${SITE.url}/#org` },
    manufacturer: p.category === "PP Packaging" ? { "@id": `${SITE.url}/#org` } : undefined,
    additionalProperty: p.specsTable.map((s) => ({ "@type": "PropertyValue", name: s.label, value: s.value })),
  };
}

/** Q&A for a product page, built only from its published specs. */
export function productFaqs(p: Product): Faq[] {
  const faqs: Faq[] = [];
  const dims = spec(p, "Dimensions");
  const thick = spec(p, "Sheet Thickness") ?? p.thickness;
  const cycles = spec(p, "Reuse Cycles");
  const moq = spec(p, "MOQ");
  const temp = spec(p, "Operating Temp");
  const load = spec(p, "Static Load Capacity");
  const gsm = spec(p, "GSM Range") ?? p.gsmRange;

  if (p.category === "PP Packaging") {
    if (dims) faqs.push({
      q: `What sizes is the ${p.name} available in?`,
      a: `The standard size is ${dims.replace(/\s*\(custom available\)/i, "")}. We make it to your part's dimensions on request: send the length, width and height you need.`,
    });
    if (thick) faqs.push({ q: `What board thickness is used?`, a: `${thick}.` });
    if (cycles) faqs.push({
      q: `How many times can it be reused?`,
      a: `Typically ${cycles.replace(/ under normal conditions/i, "")} under normal handling. Actual life depends on load, stacking and how it is handled.`,
    });
    if (load) faqs.push({ q: `How much weight can it hold?`, a: `${load} static load at the standard size and thickness.` });
    if (temp) faqs.push({ q: `What temperature range can it be used in?`, a: `${temp}.` });
    if (p.surfaceResistivity) faqs.push({ q: `Is it ESD safe?`, a: `Yes. Surface resistivity is ${p.surfaceResistivity}.` });
    if (moq) faqs.push({ q: `What is the minimum order quantity?`, a: `${moq}.` });
    if (p.applications.length) faqs.push({
      q: `What is it used for?`,
      a: `${p.applications.slice(0, 4).join(", ")}.`,
    });
  } else {
    if (gsm) faqs.push({ q: `What GSM range is ${p.name} available in?`, a: `${gsm}.` });
    if (p.origin) faqs.push({ q: `Where is it made?`, a: `${p.origin}.` });
    if (p.applications.length) faqs.push({ q: `What is ${p.name} used for?`, a: `${p.applications.slice(0, 4).join(", ")}.` });
    faqs.push({
      q: `Can I buy it in sheets cut to size?`,
      a: `Yes. We supply by the reel or sheeted to your press size from our Pune warehouse.`,
    });
  }
  faqs.push({
    q: `How do I get a price?`,
    a: `Send the size and quantity through the quote form or on WhatsApp at +91 98233 83230. We reply within one working day.`,
  });
  return faqs;
}

function postDate(post: BlogPost): string {
  const d = new Date(`1 ${post.date}`);
  return isNaN(d.getTime()) ? post.date : d.toISOString().slice(0, 10);
}

export function blogPostingJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.answer ?? post.excerpt,
    datePublished: postDate(post),
    dateModified: post.updated ? postDate({ ...post, date: post.updated }) : postDate(post),
    url: `${SITE.url}/blog/${post.slug}/`,
    image: post.coverImage ? `${SITE.url}${post.coverImage}` : SITE.ogImage,
    author: { "@id": `${SITE.url}/#org` },
    publisher: { "@id": `${SITE.url}/#org` },
    mainEntityOfPage: `${SITE.url}/blog/${post.slug}/`,
  };
}
