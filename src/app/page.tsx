"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import {
  IconPhone, IconMail, IconMapPin, IconBuildingFactory2, IconPackage, IconStack2,
  IconChevronRight, IconArrowRight, IconCircleCheck,
  IconLoader2, IconCar, IconPill, IconShoppingCart, IconTool,
} from "@tabler/icons-react";
import { productPath } from "@/lib/pgg-data";
import emailjs from "@emailjs/browser";


/* ─── Tokens ─────────────────────────────────────────────────────────────────── */
const C = {
  cream: "#FAF7F2",
  parchment: "#EDE5D8",
  charcoal: "#1C1A17",
  warm: "#7A736D",
  taupe: "#7A736D",
  saffron: "#1C1A17",
  saffrondark: "#0D0B09",
  dark: "#1C1A17",
  deepWarm: "#1C1A17",
  navy: "#1C1A17",
  granite: "#7A736D",
  goldStart: "#FAF7F2",
  goldEnd: "#C8B89A",
  border: "rgba(28,26,23,0.10)",
  borderMid: "rgba(28,26,23,0.18)",
};

const F = {
  display: "'Playfair Display', Georgia, serif",
  body:    "'DM Sans', system-ui, sans-serif",
  italic:  "'Cormorant Garamond', Georgia, serif",
};

/* ─── Global CSS ─────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; font-size: 16px; }
  body {
    background: ${C.cream};
    color: ${C.charcoal};
    font-family: ${F.body};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  ::selection { background: ${C.saffron}; color: #fff; }
  a { text-decoration: none; color: inherit; }

  /* ── Hero entrance animations ────────────────── */
  @keyframes heroFadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ruleGrow {
    from { transform: scaleX(0); transform-origin: left; }
    to   { transform: scaleX(1); transform-origin: left; }
  }
  @keyframes statReveal {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes eyebrowSlide {
    from { opacity: 0; letter-spacing: 0.18em; }
    to   { opacity: 1; letter-spacing: 0.03em; }
  }
  .hero-eyebrow-anim {
    animation: eyebrowSlide 0.9s cubic-bezier(0.22,1,0.36,1) 0.1s both;
  }

  /* ── Client logo marquee ─────────────────────────────────── */
  @keyframes marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  .logo-track {
    display: inline-flex; align-items: center;
    flex-wrap: nowrap; white-space: nowrap;
    animation: marquee 32s linear infinite;
  }
  .logo-track:hover { animation-play-state: paused; }
  .logo-item {
    flex: 0 0 auto;
    padding: 0 3rem;
    display: flex; align-items: center; justify-content: center;
  }
  .logo-img {
    height: 36px; width: auto; max-width: 120px;
    object-fit: contain;
    filter: grayscale(0.5);
    opacity: 0.5;
    transition: filter 0.35s, opacity 0.35s;
    display: block;
  }
  .logo-img:hover { filter: grayscale(0.19); opacity: 0.81; }

  /* ── Hero image carousel (Ken Burns crossfade) ──────────── */
  @keyframes heroSlide1 {
    0%        { opacity: 0; transform: scale(1.0)  translate(0%,    0%);    }
    4%        { opacity: 1; transform: scale(1.03) translate(-0.2%, -0.1%); }
    16%       { opacity: 1; transform: scale(1.11) translate(-1.8%, -1.3%); }
    20%, 100% { opacity: 0; transform: scale(1.13) translate(-2%,   -1.5%); }
  }
  @keyframes heroSlide2 {
    0%        { opacity: 0; transform: scale(1.0)  translate(-2%,   -1.5%); }
    4%        { opacity: 1; transform: scale(1.03) translate(-1.7%, -1.3%); }
    16%       { opacity: 1; transform: scale(1.11) translate(-0.2%, -0.1%); }
    20%, 100% { opacity: 0; transform: scale(1.13) translate(0%,    0%);    }
  }
  .hero-carousel-wrap { position: absolute; inset: 0; }
  .hero-carousel-img  {
    position: absolute; inset: 0;
    width: 100%; height: 100%; object-fit: cover;
    display: block;
  }
  /* 7-image carousel — 50s cycle, ~7s stagger each (50/7) */
  .hero-carousel-img:nth-child(1)  { animation: heroSlide1 50s linear infinite 0s;   }
  .hero-carousel-img:nth-child(2)  { animation: heroSlide2 50s linear infinite -43s;  }
  .hero-carousel-img:nth-child(3)  { animation: heroSlide1 50s linear infinite -36s;  }
  .hero-carousel-img:nth-child(4)  { animation: heroSlide2 50s linear infinite -29s;  }
  .hero-carousel-img:nth-child(5)  { animation: heroSlide1 50s linear infinite -22s;  }
  .hero-carousel-img:nth-child(6)  { animation: heroSlide2 50s linear infinite -15s;  }
  .hero-carousel-img:nth-child(7)  { animation: heroSlide1 50s linear infinite -8s;   }
  @media (max-width: 768px) {
    .products-grid {
      display: flex !important;
      flex-direction: column !important;
      background: transparent !important;
      gap: 12px !important;
    }
    .svc-card {
      position: sticky;
      border-radius: 10px !important;
      box-shadow: 0 -2px 20px rgba(0,0,0,0.07);
      padding: 1.5rem !important;
    }
    .svc-card:nth-child(1) { top: 58px; z-index: 1; }
    .svc-card:nth-child(2) { top: 66px; z-index: 2; }
    .svc-card:nth-child(3) { top: 74px; z-index: 3; }
    .svc-num  { font-size: 2rem !important; margin-bottom: 0.75rem !important; line-height: 1 !important; }
    .svc-heading { font-size: 1.05rem !important; margin-bottom: 0.6rem !important; }
    .svc-desc { font-size: 0.86rem !important; line-height: 1.65 !important; margin-bottom: 1rem !important; }
    .svc-cta  { font-size: 0.82rem !important; }
  }
  @media (max-width: 520px) {
    .hero-eyebrow-anim { gap: 0.5rem !important; margin-bottom: 2rem !important; }
    .hero-eyebrow-divider { display: none !important; }
    .hero-eyebrow-est { display: none !important; }
    .hero-eyebrow-text { white-space: normal !important; font-size: 0.95rem !important; }
    .hero-stat-box { padding: 0 0.75rem !important; }
  }
  .hero-h1-line1 {
    display: block;
    animation: heroFadeUp 0.9s cubic-bezier(0.22,1,0.36,1) 0.22s both;
  }
  .hero-h1-line2 {
    display: block;
    animation: heroFadeUp 0.9s cubic-bezier(0.22,1,0.36,1) 0.4s both;
  }
  .hero-rule-anim {
    animation: ruleGrow 0.85s cubic-bezier(0.22,1,0.36,1) 0.55s both;
  }
  .hero-body-anim {
    animation: heroFadeUp 0.85s ease 0.65s both;
  }
  .hero-cta-anim {
    animation: heroFadeUp 0.85s ease 0.8s both;
  }
  .hero-stat-anim-0 { animation: statReveal 0.7s ease 0.9s  both; }
  .hero-stat-anim-1 { animation: statReveal 0.7s ease 1.0s  both; }
  .hero-stat-anim-2 { animation: statReveal 0.7s ease 1.1s  both; }
  .hero-stat-anim-3 { animation: statReveal 0.7s ease 1.2s  both; }

  /* ── Section number pulse ────────────────────── */
  @keyframes numFade {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 0.4; transform: translateY(0); }
  }
  .prod-num-anim { opacity: 0; }
  .prod-num-anim.visible { animation: numFade 0.7s ease forwards; }

  /* Scroll reveal */
  .sr { opacity: 0; transform: translateY(26px); transition: opacity 0.85s ease, transform 0.85s ease; }
  .sr.visible { opacity: 1; transform: translateY(0); }
  .sr-left { opacity: 0; transform: translateX(-24px); transition: opacity 0.85s ease, transform 0.85s ease; max-width: 100%; }
  .sr-left.visible { opacity: 1; transform: translateX(0); }
  .sr-right { opacity: 0; transform: translateX(24px); transition: opacity 0.85s ease, transform 0.85s ease; max-width: 100%; }
  .sr-right.visible { opacity: 1; transform: translateX(0); }
  .sr-scale { opacity: 0; transform: scale(0.97); transition: opacity 0.75s ease, transform 0.75s ease; }
  .sr-scale.visible { opacity: 1; transform: scale(1); }

  /* Marquee */
  @keyframes marqueeScroll {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .marquee-track {
    display: flex;
    width: max-content;
    animation: marqueeScroll 40s linear infinite;
  }
  .marquee-track:hover { animation-play-state: paused; }

  /* Navbar */
  .navbar-scrolled {
    border-bottom: 1px solid ${C.borderMid} !important;
    box-shadow: 0 1px 20px rgba(28,26,23,0.05) !important;
  }

  .nav-link {
    position: relative;
    font-family: ${F.body};
    font-size: 0.875rem;
    font-weight: 400;
    color: ${C.warm};
    letter-spacing: 0.01em;
    padding: 4px 0;
    transition: color 0.2s;
    cursor: pointer;
  }
  .nav-link::after {
    content: '';
    position: absolute;
    left: 0; bottom: -2px;
    width: 0; height: 1px;
    background: ${C.charcoal};
    transition: width 0.28s ease;
  }
  .nav-link:hover { color: ${C.charcoal}; }
  .nav-link:hover::after { width: 100%; }

  /* Eyebrow */
  .eyebrow {
    font-family: ${F.italic};
    font-style: italic;
    font-size: 1.18rem;
    font-weight: 400;
    color: ${C.taupe};
    letter-spacing: 0.03em;
    display: block;
    margin-bottom: 16px;
  }

  /* ── Heritage Premium ───────────────────────────────────── */
  .gold-text {
    background: linear-gradient(135deg, ${C.goldStart} 0%, ${C.goldEnd} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: inline;
  }
  .section-dark {
    background: ${C.deepWarm};
    color: ${C.cream};
  }
  .card-heritage {
    background: ${C.parchment};
    border-bottom: 2px solid ${C.saffron};
    box-shadow: 0 2px 12px rgba(28,26,23,0.07);
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }
  .card-heritage:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 36px rgba(28,26,23,0.13);
  }
  .saffron-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: ${C.saffron}; color: #fff;
    font-family: ${F.body}; font-size: 0.68rem; font-weight: 600;
    letter-spacing: 0.13em; text-transform: uppercase;
    padding: 5px 14px; border-radius: 20px;
  }

  /* Buttons */
  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    background: ${C.navy}; color: ${C.cream};
    font-family: ${F.body}; font-size: 0.8rem; font-weight: 500;
    letter-spacing: 0.09em; text-transform: uppercase;
    padding: 13px 28px; border: none; border-radius: 1px;
    cursor: pointer; transition: background 0.2s, transform 0.15s;
  }
  .btn-primary:hover { background: ${C.dark}; transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); }

  .btn-outline {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; color: ${C.charcoal};
    font-family: ${F.body}; font-size: 0.8rem; font-weight: 500;
    letter-spacing: 0.09em; text-transform: uppercase;
    padding: 12px 28px; border: 1px solid ${C.borderMid}; border-radius: 1px;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-outline:hover { background: ${C.charcoal}; color: ${C.cream}; border-color: ${C.charcoal}; }

  /* Form */
  .form-input {
    width: 100%;
    background: #fff; border: 1px solid ${C.borderMid}; border-radius: 1px;
    padding: 11px 15px; font-family: ${F.body}; font-size: 0.9rem; color: ${C.charcoal};
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .form-input:focus { border-color: ${C.saffron}; box-shadow: 0 0 0 3px rgba(241,143,1,0.15); }
  .form-input::placeholder { color: ${C.taupe}; opacity: 0.55; }

  /* Cards */
  .product-card { border-radius: 1px; transition: border-color 0.22s, box-shadow 0.22s; }
  .product-card:hover { border-color: ${C.charcoal} !important; box-shadow: 0 6px 22px rgba(28,26,23,0.07); }

  .industry-tile {
    background: ${C.cream};
    border: 1px solid ${C.border};
    border-bottom: 2px solid transparent;
    padding: 2rem 1.75rem;
    border-radius: 2px;
    transition: border-color 0.22s, background 0.22s, transform 0.22s;
  }
  .industry-tile:hover {
    border-bottom-color: ${C.saffron};
    background: #fff;
    transform: translateY(-3px);
  }

  /* Footer link */
  .footer-link {
    font-family: ${F.body}; font-size: 0.84rem; color: rgba(250,247,242,0.52);
    transition: color 0.2s; cursor: pointer; display: block; margin-bottom: 10px;
    text-decoration: none; background: none; border: none; padding: 0; text-align: left;
  }
  .footer-link:hover { color: ${C.cream}; }

  /* Carousel */
  @keyframes carouselSlideIn {
    from { opacity: 0; transform: translateX(18px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes carouselProgress {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  .carousel-card-enter { animation: carouselSlideIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .carousel-card-enter:nth-child(2) { animation-delay: 0.06s; }
  .carousel-card-enter:nth-child(3) { animation-delay: 0.12s; }
  @media (max-width: 768px) { .carousel-track { grid-template-columns: 1fr 1fr !important; } }
  @media (max-width: 480px) { .carousel-track { grid-template-columns: 1fr !important; } }

  /* Mobile nav */
  .mobile-nav {
    display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: ${C.dark}; z-index: 999; flex-direction: column;
    align-items: center; justify-content: center; gap: 36px;
  }
  .mobile-nav.open { display: flex; }

  /* Responsive */
  @media (max-width: 1024px) {
    .hero-stats-row { flex-wrap: wrap !important; width: 100% !important; }
    .hero-stat-box { flex: 1 1 40% !important; border-left: 1px solid ${C.borderMid} !important; border-right: none !important; margin-bottom: 1rem; }
    .about-grid { flex-direction: column !important; }
    .contact-grid { flex-direction: column !important; }
    .footer-grid { flex-direction: column !important; gap: 3rem !important; }
    .footer-cols { flex-direction: column !important; gap: 2rem !important; }
    .infra-metrics-grid { grid-template-columns: repeat(3, 1fr) !important; }
  }
  @media (max-width: 1024px) {
    .pp-product-grid { grid-template-columns: repeat(3, 1fr) !important; }
  }
  /* Infra callout 2-col */

  /* Hero 2-col grid */
  .hero-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(2rem, 5vw, 5rem);
    align-items: stretch;
  }
  @media (max-width: 960px) {
    .hero-grid { grid-template-columns: 1fr !important; }
    .hero-img-col { display: none !important; }
  }

  @media (max-width: 768px) {
    .desktop-nav { display: none !important; }
    .mobile-menu-btn { display: flex !important; }
    .hero-headline { font-size: clamp(2.2rem, 9vw, 3.2rem) !important; }
    .products-grid { grid-template-columns: 1fr !important; }
    /* PP Products: horizontal scroll carousel on mobile */
    .pp-product-grid {
      display: flex !important; overflow-x: auto !important;
      scroll-snap-type: x mandatory !important;
      -webkit-overflow-scrolling: touch !important;
      scrollbar-width: none !important;
      gap: 0 !important;
    }
    .pp-product-grid::-webkit-scrollbar { display: none; }
    .pp-product-grid > * { flex: 0 0 78vw !important; max-width: 290px !important; scroll-snap-align: start !important; }
    /* Paper products: horizontal scroll carousel on mobile */
    .products-detail-grid {
      display: flex !important; overflow-x: auto !important;
      scroll-snap-type: x mandatory !important;
      -webkit-overflow-scrolling: touch !important;
      scrollbar-width: none !important;
      gap: 12px !important; background: transparent !important;
    }
    .products-detail-grid::-webkit-scrollbar { display: none; }
    .products-detail-grid > * { flex: 0 0 78vw !important; max-width: 290px !important; scroll-snap-align: start !important; }
    .industries-grid { grid-template-columns: 1fr 1fr !important; }
    .infra-metrics-grid { grid-template-columns: repeat(3, 1fr) !important; }
    .blog-teaser-grid { grid-template-columns: 1fr !important; }
    section { padding-top: 64px !important; padding-bottom: 64px !important; }
    .infra-section { padding-top: 44px !important; padding-bottom: 44px !important; }
  }
  @media (max-width: 480px) {
    .industries-grid { grid-template-columns: 1fr !important; }
    .infra-metrics-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .blog-teaser-header { flex-direction: column !important; align-items: flex-start !important; gap: 1rem !important; }
  }
  @media (max-width: 640px) {
    .contact-form-grid { grid-template-columns: 1fr !important; }
  }

  /* ── Homepage product panels ─────────────────────────────── */
  .hp-cat-row {
    display: flex; min-height: 62vh;
  }
  .hp-cat-pp {
    position: relative; overflow: hidden; cursor: pointer; text-decoration: none;
    display: flex; flex-direction: column; justify-content: flex-end;
    flex: 1; transition: flex 0.55s cubic-bezier(0.4, 0, 0.2, 1);
    background: ${C.charcoal};
  }
  .hp-cat-pp:hover { flex: 1.18; }
  .hp-cat-paper {
    position: relative; overflow: hidden; cursor: pointer; text-decoration: none;
    display: flex; flex-direction: column; justify-content: flex-end;
    flex: 1; transition: flex 0.55s cubic-bezier(0.4, 0, 0.2, 1);
    background: ${C.parchment};
  }
  .hp-cat-paper:hover { flex: 1.18; }
  .hp-cat-bg-img {
    position: absolute; inset: 0; width: 100%; height: 100%;
    object-fit: cover; display: block;
    transition: transform 0.85s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .hp-cat-pp:hover .hp-cat-bg-img,
  .hp-cat-paper:hover .hp-cat-bg-img { transform: scale(1.04); }
  .hp-pp-overlay {
    position: absolute; inset: 0; pointer-events: none;
    background:
      linear-gradient(to top, rgba(28,26,23,0.96) 0%, rgba(28,26,23,0.72) 38%, rgba(28,26,23,0.22) 68%, rgba(28,26,23,0.04) 100%),
      linear-gradient(to right, rgba(28,26,23,0.55) 0%, rgba(28,26,23,0.0) 55%);
  }
  .hp-paper-overlay {
    position: absolute; inset: 0; pointer-events: none;
    background:
      linear-gradient(to top, rgba(237,229,216,0.98) 0%, rgba(237,229,216,0.80) 36%, rgba(237,229,216,0.32) 62%, rgba(237,229,216,0.0) 100%),
      linear-gradient(to right, rgba(237,229,216,0.65) 0%, rgba(237,229,216,0.0) 55%);
  }
  .hp-cat-content { position: relative; z-index: 2; padding: clamp(1.4rem, 4.5vw, 3.5rem); }
  .hp-cat-index-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
  .hp-cat-index-num { font-family: ${F.body}; font-size: 0.58rem; letter-spacing: 0.22em; }
  .hp-cat-index-rule { flex: 1; height: 1px; }
  .hp-cat-index-tag { font-family: ${F.body}; font-size: 0.58rem; letter-spacing: 0.14em; text-transform: uppercase; }
  .hp-cat-eyebrow { font-family: ${F.body}; font-size: 0.62rem; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 0.65rem; display: block; }
  .hp-cat-title {
    font-family: ${F.display}; font-weight: 700;
    font-size: clamp(1.55rem, 3.4vw, 3.2rem);
    line-height: 1.04; letter-spacing: -0.025em; margin-bottom: 1.4rem;
  }
  .hp-cat-stats { display: flex; gap: 0; flex-wrap: wrap; margin-bottom: 2rem; border-top: 1px solid; padding-top: 1rem; }
  .hp-cat-stat { font-family: ${F.body}; font-size: 0.62rem; letter-spacing: 0.06em; padding-right: 1.4rem; margin-right: 1.4rem; border-right: 1px solid; }
  .hp-cat-stat:last-child { border-right: none; padding-right: 0; margin-right: 0; }
  .hp-cat-cta { display: inline-flex; align-items: center; gap: 8px; font-family: ${F.body}; font-size: 0.78rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; border-bottom: 1px solid; padding-bottom: 3px; transition: gap 0.25s; }
  .hp-cat-pp:hover .hp-cat-cta, .hp-cat-paper:hover .hp-cat-cta { gap: 14px; }
  .hp-cat-pp .hp-cat-index-num  { color: rgba(250,247,242,0.35); }
  .hp-cat-pp .hp-cat-index-rule { background: rgba(250,247,242,0.12); }
  .hp-cat-pp .hp-cat-index-tag  { color: rgba(250,247,242,0.40); }
  .hp-cat-pp .hp-cat-eyebrow    { color: rgba(250,247,242,0.48); }
  .hp-cat-pp .hp-cat-title      { color: #FAF7F2; }
  .hp-cat-pp .hp-cat-stats      { border-color: rgba(250,247,242,0.14); }
  .hp-cat-pp .hp-cat-stat       { color: rgba(250,247,242,0.50); border-color: rgba(250,247,242,0.14); }
  .hp-cat-pp .hp-cat-cta        { color: rgba(250,247,242,0.65); border-color: rgba(250,247,242,0.30); }
  .hp-cat-pp:hover .hp-cat-cta  { color: #FAF7F2; border-color: rgba(250,247,242,0.7); }
  .hp-cat-paper .hp-cat-index-num  { color: rgba(28,26,23,0.30); }
  .hp-cat-paper .hp-cat-index-rule { background: rgba(28,26,23,0.12); }
  .hp-cat-paper .hp-cat-index-tag  { color: rgba(28,26,23,0.38); }
  .hp-cat-paper .hp-cat-eyebrow    { color: rgba(28,26,23,0.48); }
  .hp-cat-paper .hp-cat-title      { color: ${C.charcoal}; }
  .hp-cat-paper .hp-cat-stats      { border-color: rgba(28,26,23,0.14); }
  .hp-cat-paper .hp-cat-stat       { color: rgba(28,26,23,0.50); border-color: rgba(28,26,23,0.14); }
  .hp-cat-paper .hp-cat-cta        { color: rgba(28,26,23,0.60); border-color: rgba(28,26,23,0.28); }
  .hp-cat-paper:hover .hp-cat-cta  { color: ${C.charcoal}; border-color: rgba(28,26,23,0.65); }
  @media (max-width: 680px) {
    .hp-cat-row { flex-direction: column; min-height: auto; }
    .hp-cat-pp, .hp-cat-paper { flex: 1 !important; min-height: 75vw; }
  }
`;

/* ─── Turiya Logo ─────────────────────────────────────────────────────────── */
function TuriyaLogo({ size = 40, onDark = false }: { size?: number; onDark?: boolean }) {
  const main = onDark ? C.cream : C.charcoal;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-label="Pune Global Group logo symbol"
      style={{ transform: "rotate(-45deg)", display: "block" }}>
      <path d="M6 6 L38 6 Q44 6, 44 12 L18 38 Q12 44, 6 44 L6 6 Z" fill={main} />
      <path d="M56 6 L94 6 L94 38 Q94 44, 88 44 L56 12 Q56 6, 62 6 Z" fill={C.saffron} />
      <path d="M94 56 L94 94 L62 94 Q56 94, 56 88 L82 62 Q88 56, 94 56 Z" fill={main} />
      <circle cx="25" cy="75" r="12" fill={C.saffron} opacity="0.15" />
      <circle cx="25" cy="75" r="5" fill={C.saffron} />
      <circle cx="25" cy="75" r="1.8" fill="#8B1A1A" />
    </svg>
  );
}

function Logo({ inverted = false }: { inverted?: boolean }) {
  const textColor = inverted ? C.cream : C.charcoal;
  const subColor  = inverted ? "rgba(250,247,242,0.55)" : C.taupe;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", userSelect: "none" }}>
      <TuriyaLogo size={42} onDark={inverted} />
      <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
        <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: "0.98rem",
          letterSpacing: "0.13em", color: textColor, lineHeight: 1.1, textTransform: "uppercase" }}>
          Pune Global Group
        </span>
        <span style={{ fontFamily: F.italic, fontStyle: "italic", fontWeight: 400,
          fontSize: "0.98rem", color: subColor, letterSpacing: "0.03em", lineHeight: 1.2 }}>
          Your Trusted Packaging Partner
        </span>
      </div>
    </div>
  );
}

/* ─── Stat counter hook ──────────────────────────────────────────────────────── */
function useCountUp(end: number, duration = 1400, enabled = true) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!enabled) { setVal(end); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * end));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end, duration, enabled]);
  return val;
}

/* ─── Scroll reveal hook ─────────────────────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const targets = document.querySelectorAll(".sr, .sr-left, .sr-right, .sr-scale");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            const delay = el.dataset.delay ? parseFloat(el.dataset.delay) : 0;
            setTimeout(() => el.classList.add("visible"), delay * 1000);
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    targets.forEach((t) => obs.observe(t));
    return () => obs.disconnect();
  }, []);
}

/* ─── Animated stat ──────────────────────────────────────────────────────────── */
function AnimatedStat({ raw, label, note, animClass, numColor, labelColor, noteColor }: {
  raw: string; label: string; note: string; animClass: string;
  numColor?: string; labelColor?: string; noteColor?: string;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 900); return () => clearTimeout(t); }, []);
  const num = parseInt(raw.replace(/[^0-9]/g, ""), 10);
  const suffix = raw.replace(/[0-9]/g, "");
  const counted = useCountUp(num, 1600, ready);
  const display = ready ? `${counted}${suffix}` : raw;

  return (
    <div className={animClass} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
      <div style={{ fontFamily: F.display, fontWeight: 700,
        fontSize: "2.2rem", color: numColor ?? C.goldEnd, lineHeight: 1,
        transition: "color 0.3s" }}>
        {display}
      </div>
      <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: "0.7rem",
        color: labelColor ?? C.cream, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontFamily: F.italic, fontStyle: "italic",
        fontSize: "1.15rem", color: noteColor ?? "rgba(250,247,242,0.6)" }}>
        {note}
      </div>
    </div>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────────────── */
function Hero() {
  const scrollToContact = () =>
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });

  const stats = [
    { raw: "1M+ Ton", label: "Material Supplied", note: "and counting" },
    { raw: "50+",     label: "Active Clients",    note: "across India" },
    { raw: "21",      label: "States Served",     note: "nationwide" },
    { raw: "1995",    label: "Established",       note: "Pune, Maharashtra" },
  ];

  return (
    <section style={{
      minHeight: "100vh", background: C.cream,
      display: "flex", flexDirection: "column", justifyContent: "center",
      padding: "clamp(50px, 8vh, 90px) clamp(1.5rem, 5vw, 4rem) clamp(48px, 8vh, 80px)",
      position: "relative", zIndex: 1,
    }}>
      <div className="hero-grid" style={{ maxWidth: "1400px", margin: "0 auto", width: "100%" }}>

        {/* ── LEFT COLUMN ─────────────────────────────────────── */}
        <div>
          {/* Eyebrow */}
          <div className="hero-eyebrow-anim"
            style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "3rem" }}>
            <span className="saffron-badge">Est. 1995 · Pune, India</span>
            <div className="hero-eyebrow-divider" style={{ flex: 1, height: "1px", background: "rgba(28,26,23,0.12)" }} />
            <span className="hero-eyebrow-est" style={{ fontFamily: F.body, fontSize: "0.7rem", color: "rgba(28,26,23,0.45)",
              letterSpacing: "0.12em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              PP · Board · Paper
            </span>
          </div>

          {/* Headline */}
          <h1 className="hero-headline" style={{
            fontFamily: F.display, fontWeight: 900,
            fontSize: "clamp(2.2rem, 4vw, 3.8rem)",
            lineHeight: 1.06, color: C.charcoal,
            letterSpacing: "-0.02em", marginBottom: "0",
          }}>
            <span className="hero-h1-line1" style={{ display: "block" }}>
              Industrial Packaging for{" "}
              <span style={{
                background: "linear-gradient(135deg, #1C1A17 0%, #7A736D 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Automotive, Pharma &amp; Electronics</span>
            </span>
            <span className="hero-h1-line2" style={{
              display: "block", fontSize: "0.72em", fontWeight: 400,
              letterSpacing: "0em", color: "rgba(28,26,23,0.55)", marginTop: "0.22em",
            }}>
              Precision PP Trays, Boxes &amp; Separators — Made in India Since 1995
            </span>
          </h1>

          {/* Rule */}
          <div className="hero-rule-anim"
            style={{ height: "1px", background: "rgba(28,26,23,0.12)", margin: "2.75rem 0" }} />

          {/* Body + CTAs */}
          <div className="hero-body-anim">
            <p style={{ fontFamily: F.body, fontSize: "1.05rem", lineHeight: 1.85,
              color: "rgba(28,26,23,0.65)", marginBottom: "2.5rem", fontWeight: 300 }}>
              Pune Global Group manufactures precision PP trays, separators, boxes
              and crates for automotive, pharma and electronics industries — export-ready,
              custom-spec, from our Pune facility. We also convert FBB sheets and
              trade paper &amp; board grades across 21 states.
            </p>
            <div className="hero-cta-anim" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/products" className="btn-primary" style={{ textDecoration: "none" }}>
                View Products <IconArrowRight size={14} />
              </Link>
              <button className="btn-outline" onClick={scrollToContact}>
                Get a Quote <IconChevronRight size={14} />
              </button>
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN — image + stats beneath ───────── */}
        <div className="hero-img-col" style={{ display: "grid", gridTemplateRows: "auto 1fr auto", gap: 0 }}>
          <div style={{
            position: "relative",
            height: "clamp(400px, 60vh, 620px)",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 8px 48px rgba(28,26,23,0.10)",
          }}>
          <div className="hero-carousel-wrap">
            {[
              "/hero-homepage-v2.jpg",
              "/hero-infrastructure.jpg",
              "/infrastructure/facility/dispatch-area.jpg",
              "/hero-pp-family.jpg",
              "/infrastructure/facility/quality-control.jpg",
              "/hero-paper-family.jpg",
              "/infrastructure/facility/storage-warehouse.jpg",
            ].map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="" className="hero-carousel-img" />
            ))}
          </div>

          {/* Certification badge overlay */}
          <div style={{
            position: "absolute", bottom: "1.5rem", right: "1.5rem",
            background: "rgba(20,18,16,0.88)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRadius: "8px",
            padding: "0.8rem 1.1rem",
            display: "flex", alignItems: "center", gap: "0.75rem",
            border: "1px solid rgba(250,247,242,0.10)",
          }}>
            <IconCircleCheck size={18} style={{ color: C.saffron, flexShrink: 0 }} />
            <div>
              <div style={{
                fontFamily: F.body, fontSize: "0.56rem", letterSpacing: "0.15em",
                textTransform: "uppercase", color: "rgba(250,247,242,0.45)", marginBottom: "3px",
              }}>
                Certified Quality
              </div>
              <div style={{
                fontFamily: F.body, fontSize: "0.76rem", fontWeight: 500,
                color: C.cream, letterSpacing: "0.01em",
              }}>
                ISO 9001:2015 · FSC · BRC
              </div>
            </div>
          </div>
          </div>

          {/* Spacer */}
          <div />

          {/* Stats — 4 columns under the image, aligned with CTAs on left */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: 0, alignSelf: "end",
            border: `1px solid rgba(28,26,23,0.08)`,
            borderRadius: "8px",
            overflow: "hidden",
          }}>
            {stats.map((stat, i) => (
              <div key={stat.label} style={{
                padding: "0.85rem 0.75rem",
                textAlign: "center",
                borderRight: i < stats.length - 1 ? "1px solid rgba(28,26,23,0.08)" : "none",
                background: i % 2 === 0 ? "rgba(28,26,23,0.02)" : "transparent",
              }}>
                <div style={{
                  fontFamily: F.display, fontWeight: 700,
                  fontSize: "1.35rem", color: C.charcoal, lineHeight: 1,
                  marginBottom: "4px",
                }}>
                  {stat.raw}
                </div>
                <div style={{
                  fontFamily: F.body, fontWeight: 500, fontSize: "0.58rem",
                  color: C.warm, letterSpacing: "0.06em", textTransform: "uppercase",
                  marginBottom: "2px",
                }}>
                  {stat.label}
                </div>
                <div style={{
                  fontFamily: F.italic, fontStyle: "italic",
                  fontSize: "0.72rem", color: "rgba(28,26,23,0.45)",
                }}>
                  {stat.note}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

/* ─── Marquee Ticker ─────────────────────────────────────────────────────────── */
function MarqueeTicker() {
  const items = [
    "PP Trays · Separators · Boxes",
    "Industrial PP Packaging",
    "Export Ready",
    "PP Crates · Layer Pads · ESD Bins",
    "Custom PP Manufacturing",
    "Board Converting",
    "Sheeting · Slitting · Rewinding",
    "ITC · TNPL · Imported Grades",
    "21 States · 50+ Clients",
  ];
  const repeated = [...items, ...items];

  return (
    <div style={{
      background: C.parchment, height: "54px", overflow: "hidden",
      display: "flex", alignItems: "center",
      borderTop: `1px solid ${C.borderMid}`, borderBottom: `1px solid ${C.borderMid}`,
    }}>
      <div className="marquee-track" aria-hidden="true">
        {repeated.map((item, i) => (
          <span key={i} style={{
            display: "inline-flex", alignItems: "center",
            fontFamily: F.italic, fontStyle: "italic",
            fontSize: "1.08rem", letterSpacing: "0.01em",
            color: C.warm, whiteSpace: "nowrap", padding: "0 2.5rem",
          }}>
            {item}
            <span style={{ marginLeft: "2.5rem", color: "#F5A623", fontSize: "0.5rem" }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── PP Product Grid (multi-image carousel + hover expand, matches Paper cards) ── */
const PP_PRODUCTS = [
  {
    name: "PP Corrugated Boxes",
    spec: "Manufactured · Returnable",
    desc: "Six closure systems — riveted, ultrasonic weld, interlock, detachable lid, velcro and collapsible. Custom dimensions for automotive and pharma.",
    imgs: [
      "/products/pp/boxes/box-01-hero.jpg",
      "/products/pp/boxes/box-01-engineering.jpg",
      "/products/pp/boxes/box-01-usecase.jpg",
    ],
    slug: "pp-box-open-top-riveted",
  },
  {
    name: "Separators & Inserts",
    spec: "Manufactured · Precision Die-Cut",
    desc: "Cross-partition grids and contour die-cut inserts — engineered to ±1 mm for glass, automotive and pharma component separation.",
    imgs: [
      "/products/pp/separators/sep-01-hero.jpg",
      "/products/pp/separators/sep-01-engineering.jpg",
      "/products/pp/separators/sep-01-usecase.jpg",
    ],
    slug: "pp-sep-cross-partition",
  },
  {
    name: "Industrial Bins",
    spec: "Manufactured · Factory Floor",
    desc: "Open top scrap bins, hopper front picking bins and nesting tapered bins — colour-coded, forklift-rated, kanban-compatible.",
    imgs: [
      "/products/pp/bins/bin-02-hero.jpg",
      "/products/pp/bins/bin-02-engineering.jpg",
      "/products/pp/bins/bin-02-usecase.jpg",
    ],
    slug: "pp-bin-hopper-front",
  },
  {
    name: "PP Layer Pads",
    spec: "Manufactured · Pallet-Ready",
    desc: "3–4 mm single-flute layer pads for pallet stacking, load separation and surface protection. 200–500 trip reuse cycle.",
    imgs: [
      "/products/pp/layer-pads/layerpad-hero.jpg",
      "/products/pp/layer-pads/layerpad-engineering.jpg",
      "/products/pp/layer-pads/layerpad-usecase.jpg",
    ],
    slug: "pp-layer-pad-heavy-duty",
  },
  {
    name: "ESD Anti-Static Trays",
    spec: "Manufactured · Anti-Static",
    desc: "Conductive PP corrugated trays with 10⁴–10⁶ Ω/sq surface resistivity. ANSI/ESD S20.20 compatible for PCB and electronics handling.",
    imgs: [
      "/products/pp/trays/tray-esd-antistatic-hero.jpg",
      "/products/pp/trays/tray-esd-antistatic-cad.jpg",
      "/products/pp/trays/tray-esd-antistatic-usecase1.jpg",
    ],
    slug: "pp-tray-esd-antistatic",
  },
];

function PPProductCard({ p, i }: { p: typeof PP_PRODUCTS[0]; i: number }) {
  const [idx, setIdx] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (hovered) return;
    let t: ReturnType<typeof setTimeout>;
    const len = p.imgs.length;

    const advance = (current: number) => {
      const isLast = current === len - 1;
      t = setTimeout(() => {
        const next = (current + 1) % len;
        setIdx(next);
        advance(next);
      }, isLast ? 3000 : 2000);
    };

    // Stagger initial start so cards don't all switch simultaneously
    const initT = setTimeout(() => advance(0), i * 700);
    return () => { clearTimeout(t); clearTimeout(initT); };
  }, [hovered, i, p.imgs.length]);

  return (
    <Link href={productPath(p.slug)}
      className="sr product-card" data-delay={`${0.07 * i}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#fff" : C.cream,
        border: "none",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        transition: "background 0.25s",
      }}>
      {/* Image area — expands on hover */}
      <div style={{
        height: hovered ? "240px" : "160px",
        overflow: "hidden",
        position: "relative",
        transition: "height 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
        flexShrink: 0,
      }}>
        {p.imgs.map((src, j) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img key={src} src={src} alt={`${p.name} — ${j + 1}`}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              opacity: j === idx ? 1 : 0,
              transition: "opacity 0.85s cubic-bezier(0.4, 0, 0.2, 1)",
            }} />
        ))}
        {/* Image index dots — always visible, subtler when not hovered */}
        <div style={{
          position: "absolute",
          bottom: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "5px",
          opacity: hovered ? 1 : 0.55,
          transition: "opacity 0.3s",
          zIndex: 2,
        }}>
          {p.imgs.map((_, j) => (
            <span key={j} style={{
              width: j === idx ? "16px" : "5px",
              height: "5px",
              borderRadius: "3px",
              background: j === idx ? "#fff" : "rgba(255,255,255,0.5)",
              transition: "width 0.35s ease, background 0.25s ease",
              display: "block",
            }} />
          ))}
        </div>
      </div>

      {/* Text body */}
      <div style={{ padding: "1.25rem 1.25rem 1.5rem",
        display: "flex", flexDirection: "column", gap: "0.35rem", flex: 1 }}>
        <span style={{ fontFamily: F.body, fontSize: "0.63rem", letterSpacing: "0.1em",
          textTransform: "uppercase", color: C.saffron, fontWeight: 600 }}>
          {p.spec}
        </span>
        <h4 style={{ fontFamily: F.display, fontWeight: 600, fontSize: "0.98rem",
          color: C.charcoal, lineHeight: 1.25 }}>
          {p.name}
        </h4>
        <p style={{ fontFamily: F.body, fontSize: "0.79rem", color: C.taupe,
          lineHeight: 1.7, flex: 1, fontWeight: 300 }}>
          {p.desc}
        </p>
        <span style={{ marginTop: "0.75rem", display: "inline-flex", alignItems: "center",
          gap: "4px", color: C.charcoal, fontFamily: F.body, fontWeight: 500,
          fontSize: "0.74rem", letterSpacing: "0.04em",
          borderBottom: `1px solid ${C.borderMid}`, paddingBottom: "1px",
          alignSelf: "flex-start" }}>
          View Details <IconChevronRight size={11} />
        </span>
      </div>
    </Link>
  );
}

function PPProductGrid() {
  return (
    <div className="pp-product-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1px",
      background: C.borderMid }}>
      {PP_PRODUCTS.map((p, i) => (
        <PPProductCard key={p.name} p={p} i={i} />
      ))}
    </div>
  );
}

/* ─── Paper Product Card (multi-image carousel + hover expand) ────────────────── */
type PaperProduct = {
  name: string; spec: string; desc: string;
  imgs: string[]; slug: string;
};

function PaperProductCard({ p, i }: { p: PaperProduct; i: number }) {
  const [idx, setIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  /* taller default image for Paper & Board Grades */
  const imgH = hovered ? "260px" : "180px";
  useEffect(() => {
    if (hovered) return;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => setIdx(c => (c + 1) % p.imgs.length), 4500);
    }, i * 600);
    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [hovered, i, p.imgs.length]);

  return (
    <Link href={productPath(p.slug)}
      className="sr product-card" data-delay={`${0.07 * i}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#fff" : C.cream,
        border: `1px solid ${C.border}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        transition: "background 0.25s",
      }}>
      {/* Image area — expands on hover */}
      <div style={{
        height: imgH,
        overflow: "hidden",
        position: "relative",
        transition: "height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        flexShrink: 0,
      }}>
        {p.imgs.map((src, j) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img key={src} src={src} alt={`${p.name} — ${j + 1}`}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              opacity: j === idx ? 1 : 0,
              transition: "opacity 0.55s ease",
            }} />
        ))}
        {/* Dot indicators — visible on hover */}
        <div style={{
          position: "absolute",
          bottom: "8px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "4px",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s",
          zIndex: 2,
        }}>
          {p.imgs.map((_, j) => (
            <span key={j} style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: j === idx ? "#fff" : "rgba(255,255,255,0.45)",
              transition: "background 0.2s, transform 0.2s",
              transform: j === idx ? "scale(1.3)" : "scale(1)",
              display: "block",
            }} />
          ))}
        </div>
      </div>

      {/* Text body */}
      <div style={{ padding: "1.5rem 1.5rem 1.75rem",
        display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 }}>
        <span style={{ fontFamily: F.body, fontSize: "0.63rem", letterSpacing: "0.1em",
          textTransform: "uppercase", color: C.saffron, fontWeight: 600 }}>
          {p.spec}
        </span>
        <h4 style={{ fontFamily: F.display, fontWeight: 600, fontSize: "1.05rem",
          color: C.charcoal, lineHeight: 1.25 }}>
          {p.name}
        </h4>
        <p style={{ fontFamily: F.body, fontSize: "0.82rem", color: C.taupe,
          lineHeight: 1.75, flex: 1, fontWeight: 300 }}>
          {p.desc}
        </p>
        <span style={{ marginTop: "0.85rem", display: "inline-flex", alignItems: "center",
          gap: "4px", color: C.charcoal, fontFamily: F.body, fontWeight: 500,
          fontSize: "0.74rem", letterSpacing: "0.04em", borderBottom: `1px solid ${C.borderMid}`,
          paddingBottom: "1px", alignSelf: "flex-start" }}>
          View Details <IconChevronRight size={11} />
        </span>
      </div>
    </Link>
  );
}

/* ─── Products Section ───────────────────────────────────────────────────────── */
function ProductsSection() {
  const scrollToContact = () =>
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });

  const lines = [
    {
      num: "01",
      eyebrow: "PP Manufacturing — Core Business",
      heading: "Trays · Separators · Boxes · Crates",
      desc: "Precision polypropylene packaging for automotive, pharma and electronics — custom sizes, export-ready documentation on every order.",
      tags: [
        { label: "PP Trays", href: "/products/pp-corrugated/pp-tray-folded-corner" },
        { label: "Separators", href: "/products/pp-corrugated/pp-sep-cross-partition" },
        { label: "Foldable Boxes", href: "/products/pp-corrugated/pp-box-collapsible" },
        { label: "PP Crates", href: "/products/pp-corrugated/pp-bin-scrap-open-top" },
        { label: "Layer Pads", href: "/products/pp-corrugated/pp-layer-pad-heavy-duty" },
        { label: "ESD Bins", href: "/products/pp-corrugated/pp-tray-esd-antistatic" },
      ],
      href: "/products/pp-corrugated",
      cta: "View PP Products",
    },
    {
      num: "02",
      eyebrow: "Board Converting",
      heading: "Cut to Size. Press-Ready.",
      desc: "Sheeting, slitting and rewinding to exact press dimensions. Fast turnaround, low MOQ, for printers and converters across India.",
      tags: [
        { label: "FBB Sheeting", href: "/infrastructure" },
        { label: "Duplex Cutting", href: "/infrastructure" },
        { label: "Slitting", href: "/infrastructure" },
        { label: "Rewinding", href: "/infrastructure" },
        { label: "Custom Dimensions", href: "/infrastructure" },
        { label: "Low MOQ", href: "/#contact" },
      ],
      href: "/infrastructure",
      cta: "See Converting Facility",
    },
    {
      num: "03",
      eyebrow: "Paper & PP Sheet Trading",
      heading: "ITC · TNPL · Imported",
      desc: "Trusted traders of ITC PSPD and TNPL — FBB, duplex, kraft and test liner. PP corrugated sheets also available ex-stock from our Pune warehouse.",
      tags: [
        { label: "Cyber XLPac", href: "/products/paper-board/cyber-xlpac-gc1" },
        { label: "Carte Lumina", href: "/products/paper-board/carte-lumina" },
        { label: "Safire Graphik", href: "/products/paper-board/safire-graphik" },
        { label: "Eco Natura", href: "/products/paper-board/eco-natura" },
        { label: "PP Sheets", href: "/products/pp-corrugated" },
        { label: "Ready Stock", href: "/#contact" },
      ],
      href: "/products",
      cta: "Browse All Grades",
    },
  ];

  const paperProducts = [
    {
      name: "Cyber XLPac GC1",
      spec: "ITC PSPD · Virgin FBB · GC1",
      desc: "India's benchmark FBB — coated both sides, virgin fibre, FSC certified. 200–400 GSM.",
      imgs: ["/products/paper/cyber-xlpac-gc1-hero.jpg", "/products/paper/cyber-xlpac-gc1-reel.jpg", "/products/paper/cyber-xlpac-gc1-stack.jpg", "/products/paper/cyber-xlpac-gc1-usecase.jpg"],
      slug: "cyber-xlpac-gc1",
    },
    {
      name: "Carte Lumina",
      spec: "ITC PSPD · Luxury Virgin Board",
      desc: "Avant-garde luxury virgin board for cosmetics, perfumes and premium brand packaging. 200–400 GSM.",
      imgs: ["/products/paper/carte-lumina-hero.jpg", "/products/paper/carte-lumina-reel.jpg", "/products/paper/carte-lumina-stack.jpg", "/products/paper/carte-lumina-usecase.jpg"],
      slug: "carte-lumina",
    },
    {
      name: "Eco Natura",
      spec: "ITC PSPD · Recycled Greyback",
      desc: "Best-in-class recycled greyback board — consistent caliper, smooth filling line performance. 230–400 GSM.",
      imgs: ["/products/paper/eco-natura-hero.jpg", "/products/paper/eco-natura-reel.jpg", "/products/paper/eco-natura-stack.jpg", "/products/paper/eco-natura-usecase.jpg"],
      slug: "eco-natura",
    },
  ];

  return (
    <section id="products" className="section-dark" style={{ background: C.deepWarm, padding: "100px clamp(1.5rem, 5vw, 4rem)" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        <div className="sr" style={{ marginBottom: "3.5rem" }}>
          <span style={{
            fontFamily: F.body, fontWeight: 500, fontSize: "0.72rem",
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "rgba(250,247,242,0.45)", display: "block", marginBottom: "0.85rem",
          }}>
            Our Products
          </span>
          <h2 style={{ fontFamily: F.italic, fontWeight: 400,
            fontSize: "clamp(2rem, 4vw, 3rem)", color: C.cream,
            letterSpacing: "-0.01em", lineHeight: 1.1, margin: "0 0 1.1rem",
            fontStyle: "italic" }}>
            From Raw Board to Finished Packaging
          </h2>
          <p style={{ fontFamily: F.body, fontSize: "1.0625rem", color: "rgba(250,247,242,0.60)",
            lineHeight: 1.75, maxWidth: "560px", margin: "0 0 2rem", fontWeight: 300 }}>
            Two manufacturing verticals — PP corrugated packaging and paper/board
            conversion — serving automotive, pharma, FMCG and export industries
            across 21 states.
          </p>
          <div style={{ width: "48px", height: "1px", background: "rgba(250,247,242,0.15)" }} />
        </div>

      </div>

      {/* Two-panel product showcase */}
      <div className="hp-cat-row">

        {/* PP Corrugated */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Link href="/products/pp-corrugated" className="hp-cat-pp">
          <img src="/hero-pp-family.jpg" alt="" className="hp-cat-bg-img" />
          <div className="hp-pp-overlay" />
          <div className="hp-cat-content">
            <div className="hp-cat-index-row">
              <span className="hp-cat-index-num">01</span>
              <div className="hp-cat-index-rule" />
              <span className="hp-cat-index-tag">Manufactured</span>
            </div>
            <span className="hp-cat-eyebrow">PP Corrugated Systems</span>
            <h2 className="hp-cat-title">
              Boxes · Trays<br />
              <em style={{ fontWeight: 400 }}>Bins · Separators</em>
            </h2>
            <div className="hp-cat-stats">
              {["7 product families", "20+ variants", "Custom to ±1 mm"].map(s => (
                <span key={s} className="hp-cat-stat">{s}</span>
              ))}
            </div>
            <span className="hp-cat-cta">Explore PP Systems →</span>
          </div>
        </Link>

        {/* Paper & Board */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Link href="/products/paper-board" className="hp-cat-paper">
          <img src="/hero-paper-family.jpg" alt="" className="hp-cat-bg-img" />
          <div className="hp-paper-overlay" />
          <div className="hp-cat-content">
            <div className="hp-cat-index-row">
              <span className="hp-cat-index-num">02</span>
              <div className="hp-cat-index-rule" />
              <span className="hp-cat-index-tag">Traded</span>
            </div>
            <span className="hp-cat-eyebrow">Paper &amp; Board Grades</span>
            <h2 className="hp-cat-title">
              Kraft · FBB<br />
              <em style={{ fontWeight: 400 }}>Duplex · Coated</em>
            </h2>
            <div className="hp-cat-stats">
              {["10 ITC PSPD grades", "200–400 GSM", "Ready stock · Pune"].map(s => (
                <span key={s} className="hp-cat-stat">{s}</span>
              ))}
            </div>
            <span className="hp-cat-cta">Browse Board Grades →</span>
          </div>
        </Link>

      </div>
    </section>
  );
}

/* ─── Infrastructure Callout ─────────────────────────────────────────────────── */
function InfraCallout() {
  const metrics = [
    { value: "50 T/Day", label: "Processing Capacity" },
    { value: "±0.3 mm",  label: "Sheet Tolerance" },
    { value: "2500 mm",  label: "Max Reel Width" },
    { value: "15400 mm", label: "Max Sheet Length" },
    { value: "6",        label: "In-House Machines" },
    { value: "48 Hr",    label: "Typical Turnaround" },
  ];

  return (
    <div className="infra-section" style={{ background: C.parchment, padding: "64px clamp(1.5rem, 5vw, 4rem)", position: "relative", overflow: "hidden" }}>

      {/* Raindrop pulse keyframes */}
      <style>{`
        @keyframes rp1 { 0%,100% { opacity: 0.42; } 50% { opacity: 0.54; } }
        @keyframes rp2 { 0%,100% { opacity: 0.53; } 50% { opacity: 0.43; } }
        @keyframes rp3 { 0%,100% { opacity: 0.44; } 50% { opacity: 0.54; } }
        @keyframes rp4 { 0%,100% { opacity: 0.52; } 50% { opacity: 0.42; } }
      `}</style>

      {/* Background — 4 best images side by side */}
      <div aria-hidden style={{
        position: "absolute", inset: 0,
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: 0,
        filter: "grayscale(0.2)",
      }}>
        {[
          { src: "/infrastructure/machines/synchro-sheeter-wide.jpg",    anim: "rp1 3.5s ease-in-out infinite" },
          { src: "/infrastructure/facility/converting-floor.jpg",        anim: "rp2 4.6s ease-in-out 0.8s infinite" },
          { src: "/infrastructure/support/full-product-lineup.jpg",      anim: "rp3 3.2s ease-in-out 1.5s infinite" },
          { src: "/infrastructure/facility/quality-control.jpg",         anim: "rp4 4.2s ease-in-out 0.4s infinite" },
        ].map((item) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={item.src} src={item.src} alt="" style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
            animation: item.anim,
          }} />
        ))}
      </div>

      {/* Soft wash over images for text clarity */}
      <div aria-hidden style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(237,229,216,0.55) 0%, rgba(237,229,216,0.50) 50%, rgba(237,229,216,0.55) 100%)",
      }} />

      <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* 2-col: text + metrics left, facility photo right */}
        <div style={{ maxWidth: "100%" }}>

          {/* Left: header + metrics */}
          <div>
            <div className="infra-callout-header" style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: "2rem", flexWrap: "wrap", marginBottom: "2.5rem",
            }}>
              <div>
                <span style={{
                  display: "inline-block",
                  fontFamily: F.body, fontStyle: "normal",
                  fontSize: "0.62rem", fontWeight: 600,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: "rgba(28,26,23,0.50)",
                  border: "1px solid rgba(28,26,23,0.15)",
                  borderRadius: "999px", padding: "0.3em 1em",
                  marginBottom: "0.85rem",
                }}>
                  MIDC Sanaswadi, Pune · Converting Facility
                </span>
                <h2 style={{ fontFamily: F.display, fontWeight: 600,
                  fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)", color: C.charcoal,
                  lineHeight: 1.2, letterSpacing: "-0.02em" }}>
                  Cut-to-size. Wound to spec.<br />
                  <em style={{ fontWeight: 400, opacity: 0.65 }}>Shipped on time.</em>
                </h2>
              </div>
              <Link href="/infrastructure" style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                fontFamily: F.body, fontSize: "0.98rem", fontWeight: 500,
                color: C.charcoal, textDecoration: "none", letterSpacing: "0.07em",
                textTransform: "uppercase",
                border: `1px solid rgba(28,26,23,0.22)`,
                padding: "11px 22px", borderRadius: "1px", whiteSpace: "nowrap",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={e => { const a = e.currentTarget; a.style.borderColor = "rgba(28,26,23,0.5)"; a.style.background = "rgba(28,26,23,0.05)"; }}
              onMouseLeave={e => { const a = e.currentTarget; a.style.borderColor = "rgba(28,26,23,0.22)"; a.style.background = "transparent"; }}>
                View Full Facility <IconArrowRight size={13} />
              </Link>
            </div>

            <div className="infra-metrics-grid" style={{
              display: "grid", gridTemplateColumns: "repeat(6, 1fr)",
              gap: "1px", background: "rgba(28,26,23,0.10)",
            }}>
              {metrics.map((m) => (
                <div key={m.label} style={{
                  background: C.parchment, padding: "1.5rem 1rem", textAlign: "center",
                }}>
                  <div style={{ fontFamily: F.display, fontWeight: 700,
                    fontSize: "1.5rem", color: C.charcoal, lineHeight: 1 }}>
                    {m.value}
                  </div>
                  <div style={{ fontFamily: F.body, fontSize: "0.66rem",
                    color: "rgba(28,26,23,0.55)", letterSpacing: "0.07em",
                    textTransform: "uppercase", marginTop: "6px" }}>
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ─── Industries Section ─────────────────────────────────────────────────────── */
function IndustriesSection() {
  const tradeCustomers = [
    {
      num: "01",
      icon: <IconBuildingFactory2 size={22} color={C.saffron} />,
      name: "Corrugators",
      desc: "Kraft liner, test liner and fluting medium in ready stock. Sheeted or in rolls. Reliable supply for high-volume corrugated board production.",
    },
    {
      num: "02",
      icon: <IconPackage size={22} color={C.saffron} />,
      name: "Box Makers",
      desc: "Pre-cut corrugated sheets and boards delivered to size. Reduce waste and lead times for small and mid-size box manufacturers.",
    },
    {
      num: "03",
      icon: <IconStack2 size={22} color={C.saffron} />,
      name: "Printers & Converters",
      desc: "FBB, duplex, coated and specialty boards sheeted to press-ready sizes. ITC and TNPL grades with consistent caliper and whiteness.",
    },
  ];

  const endIndustries = [
    {
      num: "04",
      icon: <IconCar size={22} color={C.saffron} />,
      name: "Automotive",
      desc: "Returnable PP boxes, component trays and corrugated packaging for OEMs and Tier-1 suppliers across Pune and MIDC belt.",
    },
    {
      num: "05",
      icon: <IconPill size={22} color={C.saffron} />,
      name: "Pharmaceutical",
      desc: "FBB cartons, duplex board and PP trays meeting pharma packaging compliance requirements.",
    },
    {
      num: "06",
      icon: <IconShoppingCart size={22} color={C.saffron} />,
      name: "E-Commerce & FMCG",
      desc: "Transit-ready corrugated boxes, retail cartons and shelf-ready packaging for consumer brands and last-mile delivery.",
    },
    {
      num: "07",
      icon: <IconTool size={22} color={C.saffron} />,
      name: "Engineering",
      desc: "Heavy-duty 7-ply corrugated crates and export-standard packaging for precision machinery and industrial goods.",
    },
  ];

  return (
    <section id="industries" style={{ background: C.parchment, padding: "100px clamp(1.5rem, 5vw, 4rem)" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        <div className="sr" style={{ marginBottom: "3.5rem" }}>
          <span className="eyebrow">Who We Serve</span>
          <h2 style={{ fontFamily: F.display, fontWeight: 700,
            fontSize: "clamp(2rem, 4vw, 3.2rem)", color: C.charcoal,
            letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Paper, Board &amp; PP Packaging.
          </h2>
          <p style={{ fontFamily: F.body, fontSize: "1rem", color: C.taupe,
            lineHeight: 1.8, maxWidth: "500px", marginTop: "1rem", fontWeight: 300 }}>
            From paper traders and corrugators to automotive OEMs and pharma brands —
            we supply the right grade, converted to the right size, on time.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
          <span style={{ fontFamily: F.body, fontWeight: 500, fontSize: "0.68rem",
            letterSpacing: "0.12em", textTransform: "uppercase", color: C.taupe }}>
            Paper Trade Customers
          </span>
          <div style={{ flex: 1, height: "1px", background: C.border }} />
        </div>

        <div className="industries-grid" style={{ display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)", gap: "1px",
          background: C.borderMid, marginBottom: "3rem" }}>
          {tradeCustomers.map((ind, i) => (
            <div key={ind.name} className="industry-tile sr" data-delay={`${0.1 * i}`}
              style={{ background: C.parchment }}>
              <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: "2.8rem",
                color: C.saffron, lineHeight: 1, marginBottom: "1.25rem", opacity: 0.4 }}>
                {ind.num}
              </div>
              <div style={{ width: "38px", height: "38px", background: "rgba(212,134,14,0.08)",
                borderRadius: "1px", display: "flex", alignItems: "center",
                justifyContent: "center", marginBottom: "1rem" }}>
                {ind.icon}
              </div>
              <h3 style={{ fontFamily: F.display, fontWeight: 600, fontSize: "1.05rem",
                color: C.charcoal, marginBottom: "0.6rem" }}>
                {ind.name}
              </h3>
              <p style={{ fontFamily: F.body, fontSize: "0.85rem", lineHeight: 1.75,
                color: C.taupe, fontWeight: 300 }}>
                {ind.desc}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
          <span style={{ fontFamily: F.body, fontWeight: 500, fontSize: "0.68rem",
            letterSpacing: "0.12em", textTransform: "uppercase", color: C.taupe }}>
            End-Use Industries
          </span>
          <div style={{ flex: 1, height: "1px", background: C.border }} />
        </div>

        <div className="industries-grid" style={{ display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: C.borderMid }}>
          {endIndustries.map((ind, i) => (
            <div key={ind.name} className="industry-tile sr" data-delay={`${0.1 * i}`}
              style={{ background: C.parchment }}>
              <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: "2.8rem",
                color: C.saffron, lineHeight: 1, marginBottom: "1.25rem", opacity: 0.4 }}>
                {ind.num}
              </div>
              <div style={{ width: "38px", height: "38px", background: "rgba(212,134,14,0.08)",
                borderRadius: "1px", display: "flex", alignItems: "center",
                justifyContent: "center", marginBottom: "1rem" }}>
                {ind.icon}
              </div>
              <h3 style={{ fontFamily: F.display, fontWeight: 600, fontSize: "1.05rem",
                color: C.charcoal, marginBottom: "0.6rem" }}>
                {ind.name}
              </h3>
              <p style={{ fontFamily: F.body, fontSize: "0.85rem", lineHeight: 1.75,
                color: C.taupe, fontWeight: 300 }}>
                {ind.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Client Logo Band ───────────────────────────────────────────────────────── */
function ClientLogoBand() {
  // Only include logo files that exist in public/clients/
  // Add berger-paints.png, tnpl.png, venkys.svg, wurth.svg, yojana.svg when ready
  const clients = [
    { name: "Asian Paints",   file: "asian-paints.svg"   },
    { name: "ITC",            file: "itc.svg"            },
    { name: "Finolex",        file: "finolex.svg"        },
    { name: "Volkswagen",     file: "volkswagen.svg"     },
    { name: "General Motors", file: "general-motors.svg" },
    { name: "Mitsubishi",     file: "mitsubishi.svg"     },
    { name: "Suguna",         file: "suguna.jpg"         },
    { name: "Sun Pharma",     file: "sun-pharma.svg"     },
    { name: "Cipla",          file: "cipla.svg"          },
    { name: "Dr. Reddy's",    file: "dr-reddys.svg"      },
    { name: "Alkem Labs",     file: "alkem.png"          },
    { name: "Glenmark",       file: "glenmark.png"       },
  ];
  const doubled = [...clients, ...clients];

  return (
    <section style={{
      background: C.parchment,
      borderTop: `1px solid ${C.border}`,
      borderBottom: `1px solid ${C.border}`,
      padding: "3.5rem 0 3rem",
      position: "relative",
    }}>
      {/* Section label */}
      <p style={{
        textAlign: "center",
        fontFamily: F.body, fontSize: "0.58rem", fontWeight: 600,
        letterSpacing: "0.24em", textTransform: "uppercase",
        color: C.taupe, opacity: 0.55, marginBottom: "2.25rem",
      }}>
        Our packaging is used by
      </p>

      {/* Marquee wrapper */}
      <div style={{ position: "relative", overflow: "hidden", width: "100%" }}>
        {/* Left fade */}
        <div aria-hidden="true" style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: "140px",
          background: `linear-gradient(to right, ${C.parchment} 30%, transparent)`,
          zIndex: 2, pointerEvents: "none",
        }} />
        {/* Right fade */}
        <div aria-hidden="true" style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: "140px",
          background: `linear-gradient(to left, ${C.parchment} 30%, transparent)`,
          zIndex: 2, pointerEvents: "none",
        }} />

        <div className="logo-track">
          {doubled.map((c, i) => (
            <div key={`${c.name}-${i}`} className="logo-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/clients/${c.file}`}
                alt={c.name}
                className="logo-img"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.style.display = "none";
                  if (el.parentElement) el.parentElement.style.display = "none";
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Blog Teaser ────────────────────────────────────────────────────────────── */
function BlogTeaser() {
  const posts = [
    {
      slug: "gsm-guide-paper-board",
      category: "Industry Guide",
      title: "Understanding GSM in Paper & Board — A Complete Buyer's Guide",
      excerpt: "GSM is the most fundamental specification in paper buying. Get it wrong and you're either over-spending or watching your cartons fail.",
      read: "6 min",
    },
    {
      slug: "fbb-vs-duplex-board",
      category: "Product Guide",
      title: "FBB vs Duplex Board: Which is Right for Your Packaging?",
      excerpt: "Knowing when to use FBB vs Duplex could save 15–25% on board cost without compromising performance.",
      read: "5 min",
    },
    {
      slug: "export-packaging-compliance-india",
      category: "Compliance",
      title: "Export Packaging Compliance for Indian Manufacturers in 2026",
      excerpt: "BIS, EU, US FDA and FSC — what Indian exporters need to know before their next shipment.",
      read: "8 min",
    },
    {
      slug: "pp-corrugated-returnable-packaging",
      category: "Industry Trends",
      title: "Why PP Corrugated is Replacing Cardboard in Returnable Packaging",
      excerpt: "Automotive OEMs and pharma companies are switching to PP corrugated for closed-loop logistics. Here's the economics.",
      read: "5 min",
    },
  ];

  return (
    <section className="section-dark" style={{ background: C.deepWarm, padding: "80px clamp(1.5rem, 5vw, 4rem)" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        <div className="sr blog-teaser-header" style={{
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          marginBottom: "3rem", flexWrap: "wrap", gap: "1rem",
        }}>
          <div>
            <span className="eyebrow" style={{ color: "rgba(250,247,242,0.45)" }}>Knowledge Hub</span>
            <h2 style={{ fontFamily: F.display, fontWeight: 700,
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: C.cream,
              letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              Packaging Intelligence,<br />
              <em style={{ fontWeight: 400 }}>Free to Use.</em>
            </h2>
          </div>
          <Link href="/blog" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            fontFamily: F.body, fontSize: "1.15rem", fontWeight: 500,
            color: "rgba(250,247,242,0.60)", textDecoration: "none", letterSpacing: "0.06em",
            textTransform: "uppercase",
            borderBottom: "1px solid rgba(250,247,242,0.22)", paddingBottom: "3px",
            whiteSpace: "nowrap",
          }}>
            All Articles <IconArrowRight size={12} />
          </Link>
        </div>

        <div className="blog-teaser-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1px", background: "rgba(250,247,242,0.08)" }}>
          {posts.map((post, i) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              className="sr" data-delay={`${0.1 * i}`}
              style={{
                display: "block", textDecoration: "none",
                background: C.deepWarm, padding: "2rem",
                transition: "background 0.22s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(250,247,242,0.05)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = C.deepWarm; }}>
              <div style={{ display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: "1.25rem" }}>
                <span style={{ fontFamily: F.body, fontSize: "0.64rem", fontWeight: 600,
                  letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(250,247,242,0.45)" }}>
                  {post.category}
                </span>
                <span style={{ fontFamily: F.italic, fontStyle: "italic",
                  fontSize: "1.15rem", color: "rgba(250,247,242,0.35)" }}>
                  {post.read} read
                </span>
              </div>
              <h3 style={{ fontFamily: F.display, fontWeight: 600, fontSize: "1rem",
                color: C.cream, lineHeight: 1.4, marginBottom: "0.75rem" }}>
                {post.title}
              </h3>
              <p style={{ fontFamily: F.body, fontSize: "1.02rem", color: "rgba(250,247,242,0.55)",
                lineHeight: 1.7, marginBottom: "1.5rem", fontWeight: 300 }}>
                {post.excerpt}
              </p>
              <span style={{ fontFamily: F.body, fontSize: "0.74rem", fontWeight: 500,
                color: "rgba(250,247,242,0.65)", letterSpacing: "0.05em", display: "inline-flex",
                alignItems: "center", gap: "4px",
                borderBottom: "1px solid rgba(250,247,242,0.22)", paddingBottom: "1px" }}>
                Read Article <IconChevronRight size={11} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── About Section ──────────────────────────────────────────────────────────── */
function AboutSection() {
  return (
    <section id="about" style={{ background: C.cream, padding: "100px clamp(1.5rem, 5vw, 4rem)" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div className="about-grid" style={{ display: "flex", gap: "5rem", alignItems: "flex-start" }}>

          {/* Left */}
          <div className="sr-left" style={{ flex: "1 1 55%", position: "relative" }}>
            <div style={{
              position: "absolute", top: "-10px", left: "-10px",
              fontFamily: F.display, fontWeight: 700,
              fontSize: "clamp(6rem, 14vw, 11rem)",
              color: C.charcoal, opacity: 0.03, lineHeight: 1,
              userSelect: "none", pointerEvents: "none", letterSpacing: "-0.04em",
            }}>
              1995
            </div>

            <span className="eyebrow">Our Story</span>
            <h2 style={{ fontFamily: F.display, fontWeight: 700,
              fontSize: "clamp(1.9rem, 3.5vw, 3rem)", color: C.charcoal,
              letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: "2rem" }}>
              Three Decades of<br />
              <em style={{ fontWeight: 400 }}>Packaging Excellence.</em>
            </h2>

            <p style={{ fontFamily: F.body, fontSize: "1rem", lineHeight: 1.9,
              color: C.taupe, marginBottom: "1.25rem", fontWeight: 300 }}>
              Founded in 1995 by Director{" "}
              <strong style={{ color: C.charcoal, fontWeight: 600 }}>Yogesh Sahu</strong>,
              Pune Global Group has been a trusted paper and board trader in Pune,
              Maharashtra — supplying corrugators, printers and box makers with ITC, TNPL
              and imported grades. Over three decades, we built in-house converting
              capabilities: sheeting, rewinding and slitting so customers get
              cut-to-size stock with fast turnaround and low MOQ.
            </p>

            <p style={{ fontFamily: F.body, fontSize: "1rem", lineHeight: 1.9,
              color: C.taupe, marginBottom: "2.5rem", fontWeight: 300 }}>
              Today we operate from our converting facility at BU Bhandari MIDC, Sanaswadi,
              and our commercial office in Gulmohar Center Point, Pune — serving
              50+ clients across India.
            </p>

            <Link href="/infrastructure" className="btn-outline" style={{ textDecoration: "none" }}>
              Our Converting Facility <IconArrowRight size={13} />
            </Link>
          </div>

          {/* Right — key figures card */}
          <div className="sr-right" style={{ flex: "0 0 340px" }}>
            <div style={{
              background: C.parchment, border: `1px solid ${C.borderMid}`,
              borderTop: `3px solid ${C.saffron}`, padding: "2.5rem",
            }}>
              <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: "0.68rem",
                color: C.taupe, letterSpacing: "0.14em", textTransform: "uppercase",
                display: "block", marginBottom: "1.5rem" }}>
                At a Glance
              </span>

              {[
                { stat: "1995",    label: "Year Established" },
                { stat: "50+",    label: "Active Clients" },
                { stat: "40+",    label: "Paper Grades Stocked" },
                { stat: "50 T",  label: "Daily Processing Capacity" },
              ].map((item) => (
                <div key={item.label} style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "baseline", padding: "0.85rem 0",
                  borderBottom: `1px solid ${C.border}`,
                }}>
                  <span style={{ fontFamily: F.body, fontWeight: 400,
                    fontSize: "0.95rem", color: C.warm }}>
                    {item.label}
                  </span>
                  <span style={{ fontFamily: F.display, fontWeight: 700,
                    fontSize: "1.4rem", color: C.saffron }}>
                    {item.stat}
                  </span>
                </div>
              ))}

              {/* Certifications */}
              <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: "0.68rem",
                color: C.taupe, letterSpacing: "0.14em", textTransform: "uppercase",
                display: "block", marginBottom: "1rem", marginTop: "2rem" }}>
                Certifications
              </span>
              {[
                { label: "ISO 9001:2015", desc: "Quality Management System" },
                { label: "FSC C064218",   desc: "Chain of Custody certified" },
                { label: "BRC",           desc: "Packaging & Packaging Materials" },
              ].map((v) => (
                <div key={v.label} style={{
                  display: "flex", gap: "0.75rem", alignItems: "flex-start", marginBottom: "0.85rem",
                }}>
                  <IconCircleCheck size={15} style={{ color: C.saffron, marginTop: "2px", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: "0.95rem",
                      color: C.charcoal, marginBottom: "2px" }}>
                      {v.label}
                    </div>
                    <div style={{ fontFamily: F.body, fontSize: "0.82rem", color: C.taupe,
                      lineHeight: 1.5, fontWeight: 300 }}>
                      {v.desc}
                    </div>
                  </div>
                </div>
              ))}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ─── Contact Section ────────────────────────────────────────────────────────── */
function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("submitting");
    try {
      await emailjs.send(
        "service_ybv3hbj",
        "template_njm152v",
        {
          name: form.name,
          email: form.email,
          phone: form.phone || "—",
          message: form.message,
        },
        { publicKey: "LxaNXYpu9X7rnTnEn" }
      );
      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      console.error("Contact form error:", err);
      setStatus("error");
    }
  };

  const contactItems = [
    { icon: <IconPhone size={16} color={C.saffron} />, label: "Phone",
      value: "+91 98233 83230", href: "tel:+919823383230" },
    { icon: <IconMail size={16} color={C.saffron} />, label: "Email",
      value: "yogesh.sahu@puneglobalgroup.in", href: "mailto:yogesh.sahu@puneglobalgroup.in" },
    { icon: <IconMapPin size={16} color={C.saffron} />, label: "Office",
      value: "206 Gulmohar Center Point, Pune 411006, Maharashtra", href: null },
    { icon: <IconBuildingFactory2 size={16} color={C.saffron} />, label: "Factory",
      value: "108 BU Bhandari MIDC, Sanaswadi 412208, Pune", href: null },
  ];

  return (
    <section id="contact" style={{ background: C.parchment, padding: "100px clamp(1.5rem, 5vw, 4rem)" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        <div className="sr" style={{ marginBottom: "3.5rem" }}>
          <span className="eyebrow">Get In Touch</span>
          <h2 style={{ fontFamily: F.display, fontWeight: 700,
            fontSize: "clamp(2rem, 4vw, 3.2rem)", color: C.charcoal,
            letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Start Your Packaging Project.
          </h2>
        </div>

        <div className="contact-grid" style={{ display: "flex", gap: "4rem", alignItems: "flex-start" }}>

          {/* Contact info */}
          <div className="sr-left" style={{ flex: "1 1 40%" }}>
            <div style={{ background: C.cream, border: `1px solid ${C.borderMid}`, padding: "2.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px",
                paddingBottom: "1.5rem", borderBottom: `2px solid ${C.saffron}`, marginBottom: "2rem" }}>
                <TuriyaLogo size={34} />
                <div>
                  <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: "1.1rem",
                    color: C.charcoal, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Pune Global Group
                  </div>
                  <div style={{ fontFamily: F.italic, fontStyle: "italic",
                    fontSize: "0.98rem", color: C.taupe }}>
                    Paper &amp; PP Packaging Solutions
                  </div>
                </div>
              </div>

              {contactItems.map((item) => (
                <div key={item.label} style={{ display: "flex", gap: "1rem",
                  alignItems: "flex-start", marginBottom: "1.5rem" }}>
                  <div style={{ width: "34px", height: "34px",
                    background: "rgba(212,134,14,0.08)", borderRadius: "1px",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: "0.68rem",
                      color: C.saffron, textTransform: "uppercase", letterSpacing: "0.08em",
                      marginBottom: "3px" }}>
                      {item.label}
                    </div>
                    {item.href ? (
                      <a href={item.href} style={{ fontFamily: F.body, fontSize: "1.1rem",
                        color: C.charcoal, lineHeight: 1.5, transition: "color 0.2s" }}
                        onMouseEnter={e => (e.currentTarget.style.color = C.saffron)}
                        onMouseLeave={e => (e.currentTarget.style.color = C.charcoal)}>
                        {item.value}
                      </a>
                    ) : (
                      <div style={{ fontFamily: F.body, fontSize: "1.1rem",
                        color: C.charcoal, lineHeight: 1.5 }}>
                        {item.value}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: `1px solid ${C.border}`,
                fontFamily: F.italic, fontStyle: "italic", fontSize: "1.02rem",
                color: C.taupe, lineHeight: 1.6 }}>
                Monday – Saturday · 9:30 AM – 6:30 PM IST
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="sr-right" style={{ flex: "1 1 55%" }}>
            <div style={{ background: C.cream, border: `1px solid ${C.borderMid}`,
              borderTop: `3px solid ${C.charcoal}`, padding: "2.5rem" }}>
              <h3 style={{ fontFamily: F.display, fontWeight: 600, fontSize: "1.4rem",
                color: C.charcoal, marginBottom: "0.5rem" }}>
                Request a Quote
              </h3>
              <p style={{ fontFamily: F.body, fontSize: "1.08rem", color: C.taupe,
                lineHeight: 1.65, marginBottom: "2rem", fontWeight: 300 }}>
                Share your packaging requirements and our team will respond within one business day.
              </p>

              {status === "success" ? (
                <div style={{ background: "rgba(212,134,14,0.06)", border: `1px solid rgba(212,134,14,0.25)`,
                  padding: "2rem", textAlign: "center" }}>
                  <IconCircleCheck size={38} style={{ color: C.saffron, marginBottom: "1rem" }} />
                  <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: "1.15rem",
                    color: C.charcoal, marginBottom: "0.5rem" }}>
                    Message Received
                  </div>
                  <div style={{ fontFamily: F.body, fontSize: "1.1rem", color: C.taupe,
                    lineHeight: 1.6, fontWeight: 300 }}>
                    Thank you for reaching out. We will respond within one business day.
                  </div>
                  <button className="btn-primary" style={{ marginTop: "1.5rem" }}
                    onClick={() => setStatus("idle")}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div className="contact-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                    <div>
                      <label style={{ display: "block", fontFamily: F.body, fontWeight: 500,
                        fontSize: "0.72rem", color: C.warm, letterSpacing: "0.06em",
                        textTransform: "uppercase", marginBottom: "6px" }}>
                        Name <span style={{ color: C.saffron }}>*</span>
                      </label>
                      <input type="text" className="form-input" placeholder="Your full name"
                        value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                    </div>
                    <div>
                      <label style={{ display: "block", fontFamily: F.body, fontWeight: 500,
                        fontSize: "0.72rem", color: C.warm, letterSpacing: "0.06em",
                        textTransform: "uppercase", marginBottom: "6px" }}>
                        Phone
                      </label>
                      <input type="tel" className="form-input" placeholder="+91 XXXXX XXXXX"
                        value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontFamily: F.body, fontWeight: 500,
                      fontSize: "0.72rem", color: C.warm, letterSpacing: "0.06em",
                      textTransform: "uppercase", marginBottom: "6px" }}>
                      Email <span style={{ color: C.saffron }}>*</span>
                    </label>
                    <input type="email" className="form-input" placeholder="your@email.com"
                      value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                  </div>

                  <div>
                    <label style={{ display: "block", fontFamily: F.body, fontWeight: 500,
                      fontSize: "0.72rem", color: C.warm, letterSpacing: "0.06em",
                      textTransform: "uppercase", marginBottom: "6px" }}>
                      Message <span style={{ color: C.saffron }}>*</span>
                    </label>
                    <textarea className="form-input" rows={5}
                      placeholder="Describe your packaging requirements — product type, quantity, dimensions, material preferences..."
                      value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      required style={{ resize: "vertical", minHeight: "130px" }} />
                  </div>

                  {status === "error" && (
                    <div style={{ background: "rgba(180,30,30,0.05)", border: "1px solid rgba(180,30,30,0.2)",
                      padding: "11px 15px", fontFamily: F.body, fontSize: "0.86rem", color: "#B41E1E" }}>
                      Something went wrong. Please try again or call us directly.
                    </div>
                  )}

                  <button type="submit" className="btn-primary"
                    disabled={status === "submitting"}
                    style={{
                      background: C.saffron, color: "#fff",
                      border: "none", padding: "13px 32px",
                      fontFamily: F.body, fontWeight: 600,
                      fontSize: "0.82rem", letterSpacing: "0.09em",
                      textTransform: "uppercase", cursor: "pointer",
                      borderRadius: "2px",
                      transition: "background 0.2s, transform 0.15s",
                      alignSelf: "flex-start", opacity: status === "submitting" ? 0.7 : 1,
                    }}>
                    {status === "submitting"
                      ? <><IconLoader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Sending...</>
                      : <>Send Request <IconArrowRight size={14} /></>}
                  </button>

                  <p style={{ fontFamily: F.italic, fontStyle: "italic",
                    fontSize: "1.15rem", color: C.taupe, opacity: 0.7 }}>
                    We respect your privacy. Your information will never be shared.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  useScrollReveal();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <style dangerouslySetInnerHTML={{ __html:
        `@keyframes spin { 0% { transform:rotate(0deg); } 100% { transform:rotate(360deg); } }` }} />
      <main style={{ paddingTop: "70px" }}>
        <Hero />
        <ClientLogoBand />
        <ProductsSection />
        <InfraCallout />
        <BlogTeaser />
        <MarqueeTicker />
        <ContactSection />
      </main>
    </>
  );
}
