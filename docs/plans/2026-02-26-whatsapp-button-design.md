# WhatsApp Floating Button — Design

**Date**: 2026-02-26
**Status**: Approved

## Summary

Fixed-position WhatsApp button on every page, bottom-right corner. Opens `wa.me/919823383230` with pre-filled enquiry message. Hides when the contact form (`#contact`) is in viewport.

## Details

- **Component**: `<WhatsAppButton />` — client component (`"use client"`)
- **Placement**: `layout.tsx`, outside `<main>` so it renders on all pages
- **Position**: `fixed`, bottom-right, `z-index: 9999`
- **Icon**: WhatsApp SVG (official logo path), white on #25D366 green
- **Size**: 56px circle on desktop, 48px on mobile
- **Link**: `https://wa.me/919823383230?text=Hi%2C%20I'd%20like%20to%20enquire%20about%20your%20packaging%20products.`
- **Animation**: fade-in on mount (0.4s), subtle scale pulse every 4s
- **Viewport-aware**: `IntersectionObserver` on `#contact` section — button fades out when contact form is visible, fades back in when scrolled away
- **Accessibility**: `aria-label="Chat on WhatsApp"`, `target="_blank"`, `rel="noopener noreferrer"`

## Files to modify

1. `src/components/WhatsAppButton.tsx` — new client component
2. `src/app/layout.tsx` — add `<WhatsAppButton />` after children
