"use client";

import React, { useState, useEffect, useRef, FormEvent } from "react";
import OptImg, { useSlideLoader } from "@/components/OptImg";
import CarouselControls, { useCarousel } from "@/components/CarouselControls";
import { blogPosts } from "@/lib/pgg-data";
import Link from "next/link";
import {
  IconPhone, IconMail, IconMapPin, IconBuildingFactory2, IconPackage, IconStack2,
  IconChevronRight, IconArrowRight, IconCircleCheck,
  IconLoader2, IconCar, IconPill, IconShoppingCart, IconTool,
} from "@tabler/icons-react";
import { productPath } from "@/lib/pgg-data";
import emailjs from "@emailjs/browser";
import { motion, useInView } from "framer-motion";


/* ─── Tokens ─────────────────────────────────────────────────────────────────── */
const C = {
  cream: "#FAF7F2",
  parchment: "#142236",
  charcoal: "#FAF7F2",
  warm: "rgba(250,247,242,0.60)",
  taupe: "rgba(250,247,242,0.60)",
  saffron: "#5B9BD5",
  saffrondark: "#0A1628",
  dark: "#0B1422",
  deepWarm: "#0F1A2E",
  navy: "#0F1A2E",
  granite: "rgba(250,247,242,0.60)",
  goldStart: "#E0EEFF",
  goldEnd: "#5B9BD5",
  border: "rgba(250,247,242,0.10)",
  borderMid: "rgba(250,247,242,0.18)",
};

const F = {
  display: "'Playfair Display', Georgia, serif",
  body:    "'DM Sans', system-ui, sans-serif",
  italic:  "'DM Sans', system-ui, sans-serif",
};

/* ─── Global CSS ─────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  /* ── Plain hero, buttons, steps ── */
  .hero2-grid { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: clamp(2rem, 5vw, 4.5rem); align-items: center; }
  .hero2-img { aspect-ratio: 4 / 3; }
  .hero2-facts { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1.5rem; border-top: 1px solid rgba(250,247,242,0.12); padding-top: 1.75rem; }
  .hero2-facts > div { display: flex; flex-direction: column; gap: 0.25rem; }
  .btn2 { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 1.4rem; border-radius: 6px; font-family: 'DM Sans', system-ui, sans-serif; font-size: 1rem; font-weight: 600; text-decoration: none; transition: background 0.2s, border-color 0.2s; }
  .btn2-primary { background: #3A7BBF; color: #fff; border: 1px solid #3A7BBF; }
  .btn2-primary:hover { background: #2F6AA6; }
  .btn2-ghost { background: transparent; color: #FAF7F2; border: 1px solid rgba(250,247,242,0.35); }
  .btn2-ghost:hover { border-color: rgba(250,247,242,0.7); }
  .btn2-link { display: inline-flex; align-items: center; gap: 6px; color: #9CC3EA; font-family: 'DM Sans', system-ui, sans-serif; font-size: 1rem; font-weight: 500; text-decoration: none; padding: 0 0.5rem; min-height: 48px; }
  .how-steps { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1.5rem; }
  .how-steps li { display: flex; flex-direction: column; }
  .how-num { width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(250,247,242,0.35); color: #FAF7F2; display: inline-flex; align-items: center; justify-content: center; font-family: 'DM Sans', system-ui, sans-serif; font-weight: 600; margin-bottom: 1rem; }
  @media (max-width: 960px) {
    .hero2-grid { grid-template-columns: 1fr; }
    .hero2-facts { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .how-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 560px) { .how-steps { grid-template-columns: 1fr; } }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; font-size: 16px; }
  body {
    background: ${C.deepWarm};
    color: ${C.charcoal};
    font-family: ${F.body};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  ::selection { background: ${C.saffron}; color: #fff; }
  @keyframes typewriterBlink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
  a { text-decoration: none; color: inherit; }

  /* ── Hero entrance animations (handled by Framer Motion) ── */

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
    padding: 0 clamp(1.2rem, 3vw, 3rem);
    display: flex; align-items: center; justify-content: center;
  }
  .logo-img {
    height: clamp(24px, 4vw, 36px); width: auto; max-width: clamp(80px, 12vw, 120px);
    object-fit: contain;
    filter: brightness(1.8);
    opacity: 1;
    transition: filter 0.3s;
    display: block;
  }
  .logo-img:hover { filter: brightness(2.5); }
  .logo-img.logo-invert { filter: invert(1) brightness(1.2); }
  .logo-img.logo-invert:hover { filter: invert(1) brightness(1.6); }

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
    .hero-eyebrow-anim { gap: 0.5rem !important; margin-bottom: 1rem !important; }
    .hero-eyebrow-divider { display: none !important; }
    .hero-eyebrow-est { display: none !important; }
    .hero-headline { font-size: clamp(1.3rem, 5.5vw, 1.8rem) !important; }
    .hero-carousel-box { height: 180px !important; }
    .hero-stat-note { display: none !important; }
    .hero-stat-num { font-size: 0.82rem !important; }
    .hero-stats-mini > div { padding: 0.45rem 0.2rem !important; }
  }
  /* hero-h1, hero-rule, hero-body, hero-cta, hero-stat animations
     now handled by Framer Motion — CSS keyframe rules removed */

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
    box-shadow: 0 1px 20px rgba(0,0,0,0.2) !important;
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
    font-style: normal;
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
    box-shadow: 0 2px 12px rgba(0,0,0,0.2);
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }
  .card-heritage:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 36px rgba(0,0,0,0.3);
  }
  .saffron-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(250,247,242,0.14); color: #FAF7F2;
    font-family: ${F.body}; font-size: 0.68rem; font-weight: 600;
    letter-spacing: 0.13em; text-transform: uppercase;
    padding: 5px 14px; border-radius: 20px;
    border: 1px solid rgba(250,247,242,0.22);
  }

  /* Buttons — 3D emboss */
  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    background: linear-gradient(180deg, #6BAAE0 0%, #3A7BBF 100%); color: #fff;
    font-family: ${F.body}; font-size: 0.8rem; font-weight: 600;
    letter-spacing: 0.09em; text-transform: uppercase;
    padding: 13px 28px; border: none; border-radius: 4px;
    cursor: pointer;
    box-shadow: 0 2px 0 #2A5A8A, 0 4px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.25);
    transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
    text-shadow: 0 1px 0 rgba(0,0,0,0.15);
  }
  .btn-primary:hover {
    background: linear-gradient(180deg, #8AC0F0 0%, #5B9BD5 100%);
    box-shadow: 0 3px 0 #2A5A8A, 0 6px 20px rgba(91,155,213,0.4), inset 0 1px 0 rgba(255,255,255,0.35);
    transform: translateY(-2px);
  }
  .btn-primary:active {
    transform: translateY(1px);
    box-shadow: 0 1px 0 #2A5A8A, 0 2px 6px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15);
  }

  .btn-outline {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(250,247,242,0.06); color: ${C.charcoal};
    font-family: ${F.body}; font-size: 0.8rem; font-weight: 500;
    letter-spacing: 0.09em; text-transform: uppercase;
    padding: 12px 28px; border: 1px solid ${C.borderMid}; border-radius: 4px;
    cursor: pointer;
    box-shadow: 0 2px 0 rgba(0,0,0,0.2), 0 4px 10px rgba(0,0,0,0.15), inset 0 1px 0 rgba(250,247,242,0.08);
    transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
  }
  .btn-outline:hover {
    background: rgba(250,247,242,0.14); color: ${C.cream}; border-color: rgba(250,247,242,0.35);
    box-shadow: 0 3px 0 rgba(0,0,0,0.25), 0 6px 16px rgba(250,247,242,0.1), inset 0 1px 0 rgba(250,247,242,0.12);
    transform: translateY(-2px);
  }
  .btn-outline:active { transform: translateY(1px); box-shadow: 0 1px 0 rgba(0,0,0,0.2), inset 0 1px 0 rgba(250,247,242,0.06); }

  /* Form */
  .form-input {
    width: 100%;
    background: ${C.parchment}; border: 1px solid ${C.borderMid}; border-radius: 1px;
    padding: 11px 15px; font-family: ${F.body}; font-size: 0.9rem; color: ${C.charcoal};
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .form-input:focus { border-color: ${C.saffron}; box-shadow: 0 0 0 3px rgba(91,155,213,0.2); }
  .form-input::placeholder { color: ${C.taupe}; opacity: 0.55; }

  /* Cards */
  .product-card { border-radius: 1px; transition: border-color 0.22s, box-shadow 0.22s; }
  .product-card:hover { border-color: ${C.charcoal} !important; box-shadow: 0 6px 22px rgba(0,0,0,0.3); }

  .industry-tile {
    background: ${C.parchment};
    border: 1px solid ${C.border};
    border-bottom: 2px solid transparent;
    padding: 2rem 1.75rem;
    border-radius: 2px;
    transition: border-color 0.22s, background 0.22s, transform 0.22s;
  }
  .industry-tile:hover {
    border-bottom-color: ${C.saffron};
    background: ${C.dark};
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
    .about-grid > * { flex: 1 1 auto !important; }
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
    .hero-section { justify-content: flex-start !important; }
    .hero-grid { display: flex !important; flex-direction: column !important; gap: 0 !important; flex: 1 !important; justify-content: center !important; }
    .hero-text-col, .hero-img-col { display: contents !important; }
    .hero-spacer { display: none !important; }
    .hero-eyebrow-anim { order: 1; margin-bottom: 1.5rem !important; }
    .hero-headline { order: 2; margin-bottom: 0.5rem !important; }
    .hero-carousel-box { order: 3; height: 280px !important; margin: 1.75rem 0 !important; border-radius: 10px !important; }
    .hero-rule { display: none !important; }
    .hero-body-cta { order: 5; margin-top: 0.5rem !important; }
    .hero-body-cta p { margin-bottom: 1.75rem !important; }
    .hero-stats-mini { order: 6; grid-template-columns: repeat(4, 1fr) !important; margin-top: 2rem !important; margin-left: calc(-1 * clamp(1.5rem, 5vw, 4rem)) !important; margin-right: calc(-1 * clamp(1.5rem, 5vw, 4rem)) !important; border-radius: 0 !important; align-self: stretch !important; }
    .hero-subtitle-line { display: none !important; }
  }
  @media (max-width: 768px) {
    .hero-headline { font-size: clamp(1.45rem, 6vw, 2.2rem) !important; }
    .hero-eyebrow-anim .saffron-badge { font-size: 0.55rem !important; padding: 4px 10px !important; }
    .hero-body-cta p { font-size: 0.82rem !important; line-height: 1.7 !important; margin-bottom: 1.5rem !important; }
    .hero-body-cta .btn-primary,
    .hero-body-cta .btn-outline { font-size: 0.68rem !important; padding: 10px 20px !important; }
    .hero-carousel-box { height: 240px !important; }
    .hero-stats-mini > div { padding: 0.75rem 0.4rem !important; }
    .hero-stat-num { font-size: 0.95rem !important; }
    .hero-stat-label { font-size: 0.45rem !important; }
    .hero-stat-note { font-size: 0.55rem !important; }
    .hero-cert-badge { padding: 0.45rem 0.65rem !important; gap: 0.45rem !important; bottom: 0.6rem !important; right: 0.6rem !important; }
    .hero-cert-badge svg { width: 14px !important; height: 14px !important; }
    .hero-cert-label { font-size: 0.44rem !important; }
    .hero-cert-text { font-size: 0.62rem !important; }
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
      gap: 16px !important;
      padding: 0 clamp(1.5rem, 5vw, 4rem) !important;
      scroll-padding-left: clamp(1.5rem, 5vw, 4rem) !important;
      background: transparent !important;
    }
    .pp-product-grid::-webkit-scrollbar { display: none; }
    .pp-product-grid > * { flex: 0 0 82vw !important; max-width: 340px !important; scroll-snap-align: start !important; border-radius: 8px !important; overflow: hidden !important; }
    /* Paper products: horizontal scroll carousel on mobile */
    .products-detail-grid {
      display: flex !important; overflow-x: auto !important;
      scroll-snap-type: x mandatory !important;
      -webkit-overflow-scrolling: touch !important;
      scrollbar-width: none !important;
      gap: 16px !important;
      padding: 0 clamp(1.5rem, 5vw, 4rem) !important;
      scroll-padding-left: clamp(1.5rem, 5vw, 4rem) !important;
      background: transparent !important;
    }
    .products-detail-grid::-webkit-scrollbar { display: none; }
    .products-detail-grid > * { flex: 0 0 82vw !important; max-width: 340px !important; scroll-snap-align: start !important; border-radius: 8px !important; overflow: hidden !important; }
    .industries-grid { grid-template-columns: 1fr 1fr !important; gap: 1px !important; }
    .industry-tile { padding: 0.85rem 1rem !important; display: flex !important; align-items: center !important; gap: 0.75rem !important; flex-direction: row !important; }
    .industry-tile > div:first-child { display: none !important; }
    .industry-tile > p { display: none !important; }
    .industry-tile > div:nth-child(2) { width: 30px !important; height: 30px !important; margin-bottom: 0 !important; flex-shrink: 0 !important; }
    .industry-tile > h3 { margin-bottom: 0 !important; font-size: 0.82rem !important; }
    .infra-metrics-grid { grid-template-columns: repeat(3, 1fr) !important; }
    .blog-teaser-grid { grid-template-columns: 1fr 1fr !important; }
    section { padding-top: 48px !important; padding-bottom: 48px !important; }
    section.hero-section, section.hero2 { padding-top: 96px !important; }
    .infra-section { padding-top: 32px !important; padding-bottom: 32px !important; }
  }
  @media (max-width: 480px) {
    .industries-grid { grid-template-columns: 1fr 1fr !important; }
    .blog-teaser-grid { grid-template-columns: 1fr !important; }
    .infra-metrics-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .blog-teaser-header { flex-direction: column !important; align-items: flex-start !important; gap: 1rem !important; }
  }
  @media (max-width: 640px) {
    .contact-form-grid { grid-template-columns: 1fr !important; }
  }

  /* ── Scroll controls — bottom bar with arrows + counter ── */
  .scroll-hint-wrap { position: relative; }
  .scroll-controls {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1rem;
  }
  .scroll-counter {
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 0.68rem;
    color: rgba(250,247,242,0.4);
    letter-spacing: 0.05em;
  }
  .scroll-arrow {
    width: 32px; height: 32px;
    border-radius: 50%;
    border: 1px solid rgba(250,247,242,0.15);
    background: rgba(15,20,30,0.7);
    color: rgba(250,247,242,0.7);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.8rem;
    padding: 0;
  }
  .scroll-arrow:hover {
    background: rgba(91,155,213,0.25);
    border-color: rgba(91,155,213,0.4);
    color: #fff;
  }
  .scroll-arrow:active { transform: scale(0.92); }
  .scroll-arrow.hidden { opacity: 0.25; pointer-events: none; }

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
      linear-gradient(to top, rgba(15,26,46,0.96) 0%, rgba(15,26,46,0.72) 38%, rgba(15,26,46,0.22) 68%, rgba(15,26,46,0.04) 100%),
      linear-gradient(to right, rgba(15,26,46,0.55) 0%, rgba(15,26,46,0.0) 55%);
    opacity: 1; transition: opacity 0.55s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .hp-cat-pp:hover .hp-pp-overlay { opacity: 0.82; }
  .hp-paper-overlay {
    position: absolute; inset: 0; pointer-events: none;
    background:
      linear-gradient(to top, rgba(15,26,46,0.96) 0%, rgba(15,26,46,0.72) 36%, rgba(15,26,46,0.32) 62%, rgba(15,26,46,0.0) 100%),
      linear-gradient(to right, rgba(15,26,46,0.55) 0%, rgba(15,26,46,0.0) 55%);
    opacity: 1; transition: opacity 0.55s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .hp-cat-paper:hover .hp-paper-overlay { opacity: 0.82; }
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
  .hp-cat-cta { display: inline-flex; align-items: center; gap: 8px; font-family: ${F.body}; font-size: 0.78rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; border-bottom: 1px solid; padding-bottom: 3px; transition: gap 0.25s, transform 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
  .hp-cat-pp:hover .hp-cat-cta, .hp-cat-paper:hover .hp-cat-cta { gap: 14px; transform: translateX(4px); }
  .hp-cat-pp .hp-cat-index-num  { color: rgba(250,247,242,0.35); }
  .hp-cat-pp .hp-cat-index-rule { background: rgba(250,247,242,0.12); }
  .hp-cat-pp .hp-cat-index-tag  { color: rgba(250,247,242,0.40); }
  .hp-cat-pp .hp-cat-eyebrow    { color: rgba(250,247,242,0.48); }
  .hp-cat-pp .hp-cat-title      { color: #FAF7F2; }
  .hp-cat-pp .hp-cat-stats      { border-color: rgba(250,247,242,0.14); }
  .hp-cat-pp .hp-cat-stat       { color: rgba(250,247,242,0.50); border-color: rgba(250,247,242,0.14); }
  .hp-cat-pp .hp-cat-cta        { color: rgba(250,247,242,0.65); border-color: rgba(250,247,242,0.30); }
  .hp-cat-pp:hover .hp-cat-cta  { color: #FAF7F2; border-color: rgba(250,247,242,0.7); }
  .hp-cat-paper .hp-cat-index-num  { color: rgba(250,247,242,0.35); }
  .hp-cat-paper .hp-cat-index-rule { background: rgba(250,247,242,0.12); }
  .hp-cat-paper .hp-cat-index-tag  { color: rgba(250,247,242,0.40); }
  .hp-cat-paper .hp-cat-eyebrow    { color: rgba(250,247,242,0.48); }
  .hp-cat-paper .hp-cat-title      { color: #FAF7F2; }
  .hp-cat-paper .hp-cat-stats      { border-color: rgba(250,247,242,0.14); }
  .hp-cat-paper .hp-cat-stat       { color: rgba(250,247,242,0.50); border-color: rgba(250,247,242,0.14); }
  .hp-cat-paper .hp-cat-cta        { color: rgba(250,247,242,0.65); border-color: rgba(250,247,242,0.30); }
  .hp-cat-paper:hover .hp-cat-cta  { color: #FAF7F2; border-color: rgba(250,247,242,0.7); }
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
        <span style={{ fontFamily: F.italic, fontStyle: "normal", fontWeight: 400,
          fontSize: "0.98rem", color: subColor, letterSpacing: "0.03em", lineHeight: 1.2 }}>
          Your Trusted Packaging Partner
        </span>
      </div>
    </div>
  );
}

/* ─── Typewriter component ──────────────────────────────────────────────────── */
function Typewriter({ text, delay = 0, speed = 45, style }: {
  text: string; delay?: number; speed?: number; style?: React.CSSProperties;
}) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) return;
    const t = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, speed);
    return () => clearTimeout(t);
  }, [started, displayed, text, speed]);

  return (
    <span style={style}>
      {displayed}
      {displayed.length < text.length && started && (
        <span style={{ opacity: 0.7, animation: "typewriterBlink 0.6s step-end infinite" }}>|</span>
      )}
    </span>
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
      <div style={{ fontFamily: F.italic, fontStyle: "normal",
        fontSize: "1.15rem", color: noteColor ?? "rgba(250,247,242,0.6)" }}>
        {note}
      </div>
    </div>
  );
}

/* ─── Floating Particles (ambient hero background) ───────────────────────────── */
function FloatingParticles() {
  const particles = [
    { top: "8%",  left: "5%",  size: 4, opacity: 0.07, anim: "float-p1", dur: "11s", delay: "0s" },
    { top: "15%", left: "22%", size: 3, opacity: 0.05, anim: "float-p2", dur: "13s", delay: "1.5s" },
    { top: "30%", left: "12%", size: 5, opacity: 0.09, anim: "float-p3", dur: "9s",  delay: "0.8s" },
    { top: "45%", left: "35%", size: 2, opacity: 0.06, anim: "float-p1", dur: "14s", delay: "3s" },
    { top: "60%", left: "8%",  size: 6, opacity: 0.04, anim: "float-p4", dur: "12s", delay: "2s" },
    { top: "72%", left: "28%", size: 3, opacity: 0.08, anim: "float-p2", dur: "10s", delay: "4s" },
    { top: "20%", left: "55%", size: 4, opacity: 0.06, anim: "float-p3", dur: "11s", delay: "1s" },
    { top: "10%", left: "75%", size: 5, opacity: 0.05, anim: "float-p1", dur: "13s", delay: "2.5s" },
    { top: "40%", left: "68%", size: 3, opacity: 0.10, anim: "float-p4", dur: "9s",  delay: "0.3s" },
    { top: "55%", left: "82%", size: 2, opacity: 0.07, anim: "float-p2", dur: "15s", delay: "3.5s" },
    { top: "78%", left: "60%", size: 4, opacity: 0.05, anim: "float-p3", dur: "12s", delay: "1.8s" },
    { top: "85%", left: "90%", size: 6, opacity: 0.04, anim: "float-p1", dur: "10s", delay: "4.5s" },
    { top: "35%", left: "92%", size: 3, opacity: 0.08, anim: "float-p4", dur: "14s", delay: "0.5s" },
    { top: "65%", left: "45%", size: 5, opacity: 0.06, anim: "float-p2", dur: "11s", delay: "2.8s" },
  ];

  return (
    <div style={{
      position: "absolute", inset: 0, overflow: "hidden",
      pointerEvents: "none", zIndex: 0,
    }}>
      <style>{`
        @keyframes float-p1 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-25px) translateX(8px); }
        }
        @keyframes float-p2 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-35px) translateX(-12px); }
        }
        @keyframes float-p3 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(15px); }
        }
        @keyframes float-p4 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-40px) translateX(-6px); }
        }
      `}</style>

      {/* Subtle radial glow behind headline area */}
      <div style={{
        position: "absolute",
        top: "30%", left: "20%",
        width: "600px", height: "600px",
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(circle, rgba(91,155,213,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {particles.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          top: p.top,
          left: p.left,
          width: `${p.size}px`,
          height: `${p.size}px`,
          borderRadius: "50%",
          background: `rgba(91,155,213,${p.opacity})`,
          boxShadow: `0 0 ${p.size * 2}px rgba(91,155,213,${p.opacity * 0.5})`,
          animation: `${p.anim} ${p.dur} ease-in-out ${p.delay} infinite`,
        }} />
      ))}
    </div>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────────────── */

/* Framer Motion shared easing */
const heroEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const WA_QUOTE = "https://wa.me/919823383230?text=" + encodeURIComponent("Hi, I'd like a quote for PP packaging. Part size / quantity: ");

function Hero() {
  const facts = [
    { value: "1995",    label: "In business since" },
    { value: "50+",     label: "Active clients" },
    { value: "21",      label: "States supplied" },
    { value: "±1 mm",   label: "Custom sizing" },
  ];

  return (
    <section className="hero2" style={{ background: C.deepWarm, padding: "clamp(104px, 14vh, 140px) clamp(1.25rem, 5vw, 4rem) clamp(48px, 7vh, 72px)" }}>
      <div className="hero2-grid" style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div>
          <p style={{ fontFamily: F.body, fontSize: "0.85rem", fontWeight: 600, color: "#9CC3EA", margin: "0 0 1.25rem", letterSpacing: "0.02em" }}>
            PP corrugated packaging, made in Pune since 1995
          </p>
          <h1 style={{ fontFamily: F.display, fontWeight: 700, fontSize: "clamp(2.1rem, 4.2vw, 3.6rem)", lineHeight: 1.1, letterSpacing: "-0.015em", color: C.cream, margin: 0 }}>
            Returnable PP boxes, trays and separators, made to your part size.
          </h1>
          <p style={{ fontFamily: F.body, fontSize: "1.1rem", lineHeight: 1.7, color: "rgba(250,247,242,0.78)", margin: "1.5rem 0 2rem", maxWidth: "36rem" }}>
            We make PP corrugated packaging for automotive, pharma and electronics plants.
            Send us your part size or a drawing and we&apos;ll come back with a design and a price.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/contact" className="btn2 btn2-primary">Request a quote</Link>
            <a href={WA_QUOTE} target="_blank" rel="noopener noreferrer" className="btn2 btn2-ghost">WhatsApp us</a>
            <Link href="/products/pp-corrugated" className="btn2-link">Browse PP products <IconArrowRight size={14} /></Link>
          </div>
        </div>
        <div className="hero2-img">
          <OptImg src="/hero-pp-family.jpg" alt="PP corrugated boxes, trays, bins and separators" priority
            sizes="(max-width: 960px) 100vw, 45vw"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: "8px" }} />
        </div>
      </div>
      <dl className="hero2-facts" style={{ maxWidth: "1280px", margin: "clamp(2.5rem, 6vh, 4rem) auto 0" }}>
        {facts.map((f) => (
          <div key={f.label}>
            <dt style={{ fontFamily: F.body, fontSize: "0.85rem", color: "rgba(250,247,242,0.7)", order: 2 }}>{f.label}</dt>
            <dd style={{ fontFamily: F.display, fontSize: "1.75rem", fontWeight: 700, color: C.cream, margin: 0, order: 1 }}>{f.value}</dd>
          </div>
        ))}
      </dl>
      <p style={{ maxWidth: "1280px", margin: "1.5rem auto 0", fontFamily: F.body, fontSize: "0.95rem", color: "rgba(250,247,242,0.7)" }}>
        Buying FBB, kraft or duplex board? <Link href="/products/paper-board" style={{ color: "#9CC3EA", textDecoration: "underline" }}>See our paper &amp; board grades</Link>
      </p>
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
            fontFamily: F.italic, fontStyle: "normal",
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
    ],
    slug: "pp-tray-esd-antistatic",
  },
];

function PPProductCard({ p, i }: { p: typeof PP_PRODUCTS[0]; i: number }) {
  const [hovered, setHovered] = useState(false);
  const { idx, go, swipe } = useCarousel(p.imgs.length, { delay: 4000 + (i % 3) * 700, paused: hovered });
  const shouldLoad = useSlideLoader(idx, p.imgs.length);

  return (
    <motion.div
      className="sr product-card" data-delay={`${0.07 * i}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -6, transition: { type: "spring", stiffness: 300, damping: 25 } }}
      style={{
        boxShadow: hovered ? "0 12px 40px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.1)",
        transition: "box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
      <Link href={productPath(p.slug)}
        style={{
          background: hovered ? C.dark : C.parchment,
          border: "none",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          textDecoration: "none",
          transition: "background 0.25s",
          height: "100%",
        }}>
        {/* Image area */}
        <div className="cc-host" {...swipe} style={{
          height: "200px",
          overflow: "hidden",
          position: "relative",
          flexShrink: 0,
        }}>
          {p.imgs.map((src, j) => (
            <OptImg key={src} src={src} alt={`${p.name} — ${j + 1}`}
              load={shouldLoad(j)} sizes="(max-width: 768px) 100vw, (max-width: 960px) 50vw, 33vw"
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
          <CarouselControls count={p.imgs.length} idx={idx} go={go} label="image" showCount={false} />
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
            <motion.span animate={{ x: hovered ? 4 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
              View Details
            </motion.span>
            <motion.span animate={{ x: hovered ? 6 : 0, opacity: hovered ? 1 : 0.6 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} style={{ display: "inline-flex" }}>
              <IconChevronRight size={11} />
            </motion.span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function PPProductGrid() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const [current, setCurrent] = useState(1);
  const total = PP_PRODUCTS.length;

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 10);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    const card = el.querySelector<HTMLElement>(":scope > *");
    if (card) {
      const cardW = card.offsetWidth + 16;
      const idx = Math.round(el.scrollLeft / cardW) + 1;
      setCurrent(Math.min(Math.max(idx, 1), total));
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el.removeEventListener("scroll", checkScroll);
  }, []);

  const scroll = (dir: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(":scope > *");
    const w = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * w, behavior: "smooth" });
  };

  return (
    <div className="scroll-hint-wrap">
      <div ref={scrollRef} className="pp-product-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1px",
        background: C.borderMid }}>
        {PP_PRODUCTS.map((p, i) => (
          <PPProductCard key={p.name} p={p} i={i} />
        ))}
      </div>
      <div className="scroll-controls">
        <span className="scroll-counter">{current} / {total}</span>
        <button
          className={`scroll-arrow${canLeft ? "" : " hidden"}`}
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
        >←</button>
        <button
          className={`scroll-arrow${canRight ? "" : " hidden"}`}
          onClick={() => scroll(1)}
          aria-label="Scroll right"
        >→</button>
      </div>
    </div>
  );
}

/* ─── Paper Product Card (multi-image carousel + hover expand) ────────────────── */
type PaperProduct = {
  name: string; spec: string; desc: string;
  imgs: string[]; slug: string;
};

function PaperProductCard({ p, i }: { p: PaperProduct; i: number }) {
  const [hovered, setHovered] = useState(false);
  const { idx, go, swipe } = useCarousel(p.imgs.length, { delay: 4500 + (i % 3) * 700, paused: hovered });
  const imgH = "200px";
  const shouldLoad = useSlideLoader(idx, p.imgs.length);

  return (
    <motion.div
      className="sr product-card" data-delay={`${0.07 * i}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -6, transition: { type: "spring", stiffness: 300, damping: 25 } }}
      style={{
        boxShadow: hovered ? "0 12px 40px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.1)",
        transition: "box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
      <Link href={productPath(p.slug)}
        style={{
          background: hovered ? C.dark : C.parchment,
          border: `1px solid ${C.border}`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          textDecoration: "none",
          transition: "background 0.25s",
          height: "100%",
        }}>
        {/* Image area */}
        <div className="cc-host" {...swipe} style={{
          height: imgH,
          overflow: "hidden",
          position: "relative",
          flexShrink: 0,
        }}>
          {p.imgs.map((src, j) => (
            <OptImg key={src} src={src} alt={`${p.name} — ${j + 1}`}
              load={shouldLoad(j)} sizes="(max-width: 768px) 100vw, (max-width: 960px) 50vw, 33vw"
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
          <CarouselControls count={p.imgs.length} idx={idx} go={go} label="image" showCount={false} />
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
            <motion.span animate={{ x: hovered ? 4 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
              View Details
            </motion.span>
            <motion.span animate={{ x: hovered ? 6 : 0, opacity: hovered ? 1 : 0.6 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} style={{ display: "inline-flex" }}>
              <IconChevronRight size={11} />
            </motion.span>
          </span>
        </div>
      </Link>
    </motion.div>
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
      imgs: ["/products/paper/cyber-xlpac-gc1-hero.jpg", "/products/paper/cyber-xlpac-gc1-reel.jpg", "/products/paper/cyber-xlpac-gc1-stack.jpg"],
      slug: "cyber-xlpac-gc1",
    },
    {
      name: "Carte Lumina",
      spec: "ITC PSPD · Luxury Virgin Board",
      desc: "Avant-garde luxury virgin board for cosmetics, perfumes and premium brand packaging. 200–400 GSM.",
      imgs: ["/products/paper/carte-lumina-hero.jpg", "/products/paper/carte-lumina-reel.jpg", "/products/paper/carte-lumina-stack.jpg"],
      slug: "carte-lumina",
    },
    {
      name: "Eco Natura",
      spec: "ITC PSPD · Recycled Greyback",
      desc: "Best-in-class recycled greyback board — consistent caliper, smooth filling line performance. 230–400 GSM.",
      imgs: ["/products/paper/eco-natura-hero.jpg", "/products/paper/eco-natura-reel.jpg", "/products/paper/eco-natura-stack.jpg"],
      slug: "eco-natura",
    },
  ];

  return (
    <section id="products" className="section-dark" style={{ background: "#152844", padding: "100px clamp(1.5rem, 5vw, 4rem)" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: "3.5rem" }}>
          <span style={{
            fontFamily: F.body, fontWeight: 500, fontSize: "0.72rem",
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "#5B9BD5", display: "block", marginBottom: "0.85rem",
          }}>
            What we make
          </span>
          <motion.h2
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            style={{ fontFamily: F.italic, fontWeight: 400,
            fontSize: "clamp(2rem, 4vw, 3rem)", color: C.cream,
            letterSpacing: "-0.01em", lineHeight: 1.1, margin: "0 0 1.1rem",
            fontStyle: "normal" }}>
            PP packaging we manufacture, and board we supply
          </motion.h2>
          <motion.p
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            style={{ fontFamily: F.body, fontSize: "1.0625rem", color: "rgba(250,247,242,0.60)",
            lineHeight: 1.75, maxWidth: "560px", margin: "0 0 2rem", fontWeight: 300 }}>
            Custom PP corrugated boxes, trays, bins and separators from our Pune plant.
            Paper and board grades, cut to size or by the reel, supplied from stock.
          </motion.p>
          <div style={{ width: "48px", height: "1px", background: "rgba(250,247,242,0.15)" }} />
        </motion.div>

      </div>

      {/* Two-panel product showcase */}
      <motion.div className="hp-cat-row"
        initial={false}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>

        {/* PP Corrugated */}
        <Link href="/products/pp-corrugated" className="hp-cat-pp">
          <OptImg src="/hero-pp-family.jpg" alt="" className="hp-cat-bg-img" sizes="(max-width: 960px) 100vw, 50vw" />
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
        <Link href="/products/paper-board" className="hp-cat-paper">
          <OptImg src="/hero-paper-family.jpg" alt="" className="hp-cat-bg-img" sizes="(max-width: 960px) 100vw, 50vw" />
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

      </motion.div>
    </section>
  );
}

/* ─── Animated Infra Metric ─────────────────────────────────────────────────── */
function InfraMetricValue({ value }: { value: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  // Parse: extract leading number (int or float), prefix (like ±), and suffix (like " mm")
  const match = value.match(/^([^\d]*?)([\d.]+)(.*)$/);
  const prefix = match ? match[1] : "";
  const num = match ? parseFloat(match[2]) : 0;
  const suffix = match ? match[3] : value;
  const isDecimal = match ? match[2].includes(".") : false;
  const counted = useCountUp(isDecimal ? num * 10 : num, 1400, inView);
  const display = match
    ? `${prefix}${isDecimal ? (counted / 10).toFixed(1) : counted}${suffix}`
    : value;

  return (
    <div ref={ref} style={{ fontFamily: F.display, fontWeight: 700,
      fontSize: "1.5rem", color: C.charcoal, lineHeight: 1 }}>
      {inView ? display : value}
    </div>
  );
}

/* ─── How ordering works + facility numbers ──────────────────────────────────── */
function InfraCallout() {
  const steps = [
    { n: "1", title: "Send your requirement", body: "Part size, quantity and how the packaging is used. A drawing or a photo of the part helps." },
    { n: "2", title: "Get a design and price", body: "We suggest the box, tray or partition layout, board thickness and a unit price." },
    { n: "3", title: "Approve a sample", body: "Check fit with your parts on your line before the order is confirmed." },
    { n: "4", title: "Production and delivery", body: "Made at our MIDC Sanaswadi plant in Pune and delivered to your site." },
  ];
  const metrics = [
    { value: "50 T/day", label: "Processing capacity" },
    { value: "±0.3 mm",  label: "Sheet tolerance" },
    { value: "2500 mm",  label: "Max reel width" },
    { value: "6",        label: "In-house machines" },
  ];

  return (
    <section style={{ background: C.parchment, padding: "clamp(56px, 8vw, 96px) clamp(1.25rem, 5vw, 4rem)" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <h2 style={{ fontFamily: F.display, fontWeight: 700, fontSize: "clamp(1.6rem, 2.8vw, 2.3rem)", color: C.cream, margin: "0 0 0.75rem" }}>
          How ordering works
        </h2>
        <p style={{ fontFamily: F.body, fontSize: "1.05rem", color: "rgba(250,247,242,0.75)", margin: "0 0 2.5rem", maxWidth: "40rem" }}>
          Most PP packaging we make is custom. This is the usual path from enquiry to delivery.
        </p>
        <ol className="how-steps">
          {steps.map((s) => (
            <li key={s.n}>
              <span className="how-num" aria-hidden="true">{s.n}</span>
              <h3 style={{ fontFamily: F.body, fontSize: "1.1rem", fontWeight: 600, color: C.cream, margin: "0 0 0.4rem" }}>{s.title}</h3>
              <p style={{ fontFamily: F.body, fontSize: "0.98rem", lineHeight: 1.6, color: "rgba(250,247,242,0.75)", margin: 0 }}>{s.body}</p>
            </li>
          ))}
        </ol>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem 2.5rem", alignItems: "center", marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid rgba(250,247,242,0.12)" }}>
          {metrics.map((m) => (
            <div key={m.label}>
              <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: "1.5rem", color: C.cream }}>{m.value}</div>
              <div style={{ fontFamily: F.body, fontSize: "0.85rem", color: "rgba(250,247,242,0.7)" }}>{m.label}</div>
            </div>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link href="/infrastructure" className="btn2 btn2-ghost">See the facility</Link>
            <Link href="/contact" className="btn2 btn2-primary">Start a quote</Link>
          </div>
        </div>
      </div>
    </section>
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
    <section id="industries" style={{ background: C.parchment, padding: "clamp(48px, 8vw, 100px) clamp(1.5rem, 5vw, 4rem)" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        <div className="sr" style={{ marginBottom: "clamp(1.5rem, 4vw, 3.5rem)" }}>
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
              <div style={{ width: "38px", height: "38px", background: "rgba(200,184,154,0.10)",
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
              <div style={{ width: "38px", height: "38px", background: "rgba(200,184,154,0.10)",
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
  const clients: { name: string; file: string; invert?: boolean }[] = [
    { name: "Asian Paints",   file: "asian-paints.svg"   },
    { name: "ITC",            file: "itc.svg"            },
    { name: "Finolex",        file: "finolex.svg"        },
    { name: "Volkswagen",     file: "volkswagen.svg"     },
    { name: "General Motors", file: "general-motors.svg" },
    { name: "Mitsubishi",     file: "mitsubishi.svg"     },
    { name: "Suguna",         file: "suguna.jpg"         },
    { name: "Sun Pharma",     file: "sun-pharma.svg", invert: true },
    { name: "Cipla",          file: "cipla.svg"          },
    { name: "Dr. Reddy's",    file: "dr-reddys.svg"      },
    { name: "Alkem Labs",     file: "alkem.png"          },
    { name: "Glenmark",       file: "glenmark.png"       },
  ];
  const doubled = [...clients, ...clients];

  return (
    <section style={{
      background: "#152844",
      borderTop: `1px solid ${C.border}`,
      borderBottom: `1px solid ${C.border}`,
      padding: "clamp(1.5rem, 4vw, 3.5rem) 0 clamp(1.25rem, 3vw, 3rem)",
      position: "relative",
    }}>
      {/* Section label */}
      <p style={{
        textAlign: "center",
        fontFamily: F.body, fontSize: "0.58rem", fontWeight: 600,
        letterSpacing: "0.24em", textTransform: "uppercase",
        color: "#5B9BD5", opacity: 1, marginBottom: "clamp(1rem, 2.5vw, 2.25rem)",
      }}>
        Our packaging is used by
      </p>

      {/* Marquee wrapper */}
      <div style={{ position: "relative", overflow: "hidden", width: "100%" }}>
        {/* Left fade */}
        <div aria-hidden="true" style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: "clamp(40px, 10vw, 140px)",
          background: `linear-gradient(to right, #152844 30%, transparent)`,
          zIndex: 2, pointerEvents: "none",
        }} />
        {/* Right fade */}
        <div aria-hidden="true" style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: "clamp(40px, 10vw, 140px)",
          background: `linear-gradient(to left, #152844 30%, transparent)`,
          zIndex: 2, pointerEvents: "none",
        }} />

        <div className="logo-track">
          {doubled.map((c, i) => (
            <div key={`${c.name}-${i}`} className="logo-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/clients/${c.file}`}
                alt={c.name}
                className={`logo-img${c.invert ? " logo-invert" : ""}`}
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
  // Latest PP guides first; keeps the homepage in step with the blog data
  const posts = blogPosts
    .filter((p) => ["pp-corrugated-specification-guide", "esd-antistatic-pp-corrugated", "pp-corrugated-returnable-packaging", "pp-layer-pads-palletisation"].includes(p.slug))
    .map((p) => ({ slug: p.slug, category: p.category, title: p.title, excerpt: p.excerpt, read: p.readTime, coverImage: p.coverImage }));

  return (
    <section className="section-dark" style={{ background: C.deepWarm, padding: "80px clamp(1.5rem, 5vw, 4rem)" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        <motion.div className="blog-teaser-header"
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          marginBottom: "3rem", flexWrap: "wrap", gap: "1rem",
        }}>
          <div>
            <span className="eyebrow" style={{ color: "rgba(250,247,242,0.45)" }}>From the blog</span>
            <h2 style={{ fontFamily: F.display, fontWeight: 700,
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: C.cream,
              letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              Guides for packaging buyers
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
            All articles <IconArrowRight size={12} />
          </Link>
        </motion.div>

        <div className="blog-teaser-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1px", background: "rgba(250,247,242,0.08)" }}>
          {posts.map((post, i) => (
            <motion.div key={post.slug}
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}>
              <Link href={`/blog/${post.slug}`}
                style={{
                  display: "block", textDecoration: "none",
                  background: C.deepWarm,
                  transition: "background 0.22s",
                  height: "100%",
                  overflow: "hidden",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(250,247,242,0.05)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = C.deepWarm; }}>
              <OptImg src={post.coverImage ?? `/blog/${post.slug}.png`} alt="" sizes="(max-width: 768px) 100vw, 33vw" style={{
                width: "100%", height: "160px", objectFit: "cover", display: "block",
                transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              }} />
              <div style={{ padding: "1.5rem 1.75rem 2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: "1rem" }}>
                <span style={{ fontFamily: F.body, fontSize: "0.64rem", fontWeight: 600,
                  letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(250,247,242,0.45)" }}>
                  {post.category}
                </span>
                <span style={{ fontFamily: F.italic, fontStyle: "normal",
                  fontSize: "0.92rem", color: "rgba(250,247,242,0.35)" }}>
                  {post.read}
                </span>
              </div>
              <h3 style={{ fontFamily: F.display, fontWeight: 600, fontSize: "1rem",
                color: C.cream, lineHeight: 1.4, marginBottom: "0.65rem" }}>
                {post.title}
              </h3>
              <p style={{ fontFamily: F.body, fontSize: "0.88rem", color: "rgba(250,247,242,0.55)",
                lineHeight: 1.7, marginBottom: "1.25rem", fontWeight: 300 }}>
                {post.excerpt}
              </p>
              <span style={{ fontFamily: F.body, fontSize: "0.74rem", fontWeight: 500,
                color: "rgba(250,247,242,0.65)", letterSpacing: "0.05em", display: "inline-flex",
                alignItems: "center", gap: "4px",
                borderBottom: "1px solid rgba(250,247,242,0.22)", paddingBottom: "1px" }}>
                Read article <IconChevronRight size={11} />
              </span>
              </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── About Section ──────────────────────────────────────────────────────────── */
function AboutSection() {
  return (
    <section id="about" style={{ background: C.deepWarm, padding: "100px clamp(1.5rem, 5vw, 4rem)" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div className="about-grid" style={{ display: "flex", gap: "5rem", alignItems: "flex-start" }}>

          {/* Left */}
          <motion.div
            initial={false}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ flex: "1 1 55%", position: "relative" }}>
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

            <div style={{
              borderRadius: "8px", overflow: "hidden", marginBottom: "2rem",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}>
              <OptImg src="/infrastructure/facility/converting-floor.jpg" alt="PGG Converting Facility at MIDC Sanaswadi" sizes="(max-width: 960px) 100vw, 50vw" style={{
                width: "100%", height: "220px", objectFit: "cover", display: "block",
              }} />
            </div>

            <Link href="/infrastructure" className="btn-outline" style={{ textDecoration: "none" }}>
              Our Converting Facility <IconArrowRight size={13} />
            </Link>
          </motion.div>

          {/* Right — key figures card */}
          <motion.div
            initial={false}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            style={{ flex: "0 0 340px" }}>
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
          </motion.div>

        </div>
      </div>
    </section>
  );
}

/* ─── Quote CTA (the full form lives on /contact) ────────────────────────────── */
function ContactSection() {
  return (
    <section id="contact" style={{ background: C.deepWarm, padding: "clamp(56px, 8vw, 96px) clamp(1.25rem, 5vw, 4rem)" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(250,247,242,0.12)", paddingTop: "clamp(40px, 6vw, 64px)" }}>
        <div style={{ maxWidth: "40rem" }}>
          <h2 style={{ fontFamily: F.display, fontWeight: 700, fontSize: "clamp(1.7rem, 3vw, 2.5rem)", color: C.cream, margin: "0 0 0.75rem" }}>
            Need packaging for a part?
          </h2>
          <p style={{ fontFamily: F.body, fontSize: "1.05rem", lineHeight: 1.7, color: "rgba(250,247,242,0.78)", margin: 0 }}>
            Tell us the part size and quantity. We reply within one working day.
            Prefer to talk? Call <a href="tel:+919823383230" style={{ color: "#9CC3EA", textDecoration: "underline" }}>+91 98233 83230</a>, Monday to Saturday, 9:30 am to 6:30 pm.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/contact" className="btn2 btn2-primary">Request a quote</Link>
          <a href={WA_QUOTE} target="_blank" rel="noopener noreferrer" className="btn2 btn2-ghost">WhatsApp us</a>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  useScrollReveal();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <style dangerouslySetInnerHTML={{ __html:
        `@keyframes spin { 0% { transform:rotate(0deg); } 100% { transform:rotate(360deg); } }` }} />
      <main className="section-dark" style={{ paddingTop: "0" }}>
        <Hero />
        <ClientLogoBand />
        <ProductsSection />
        <InfraCallout />
        <BlogTeaser />
        <ContactSection />
      </main>
    </>
  );
}
