// QA Verification Script for Pune Global Group Website
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = './qa-screenshots';

mkdirSync(SCREENSHOT_DIR, { recursive: true });

const results = [];
const consoleErrors = { homepage: [], infrastructure: [], products: [] };

function log(msg) {
  console.log(msg);
  results.push(msg);
}

async function runQA() {
  const browser = await chromium.launch({ headless: true });

  // ─── PAGE 1: HOMEPAGE ──────────────────────────────────────────────────────
  log('\n========================================');
  log('PAGE: HOMEPAGE — http://localhost:3000');
  log('========================================');

  {
    const page = await browser.newPage();
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.homepage.push(msg.text());
    });
    page.on('pageerror', err => consoleErrors.homepage.push(`JS ERROR: ${err.message}`));

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/01-homepage-full.png`, fullPage: true });
    log('Screenshot saved: 01-homepage-full.png');

    await page.screenshot({ path: `${SCREENSHOT_DIR}/02-homepage-hero.png` });
    log('Screenshot saved: 02-homepage-hero.png');

    // ── Section background check ──
    const heroSections = await page.evaluate(() => {
      const sections = document.querySelectorAll('section');
      const out = [];
      for (const s of sections) {
        const bg = window.getComputedStyle(s).backgroundColor;
        const text = s.textContent.substring(0, 80).trim().replace(/\s+/g, ' ');
        out.push({ bg, text });
      }
      return out.slice(0, 6);
    });
    log('First 6 section backgrounds:');
    for (let i = 0; i < heroSections.length; i++) {
      log(`  Section[${i}]: bg=${heroSections[i].bg} | text="${heroSections[i].text}"`);
    }

    const hasDarkHero = heroSections.some(s => s.bg.includes('40, 0, 3') || s.bg.includes('40,0,3'));
    log(`DARK HERO CHECK: ${hasDarkHero ? 'PASS — dark mahogany found' : 'FAIL — no rgb(40,0,3) found in first 6 sections'}`);

    // ── All background colors ──
    const allBgs = await page.evaluate(() => {
      const elements = document.querySelectorAll('section, main, [class*="section"]');
      const bgs = new Set();
      for (const el of elements) {
        const bg = window.getComputedStyle(el).backgroundColor;
        if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') bgs.add(bg);
      }
      return [...bgs];
    });
    log(`Unique background colors: ${allBgs.join(' | ')}`);

    const hasHoneydew = allBgs.some(bg => bg.includes('223, 243, 227') || bg.includes('223,243,227'));
    log(`HONEYDEW BACKGROUND CHECK: ${hasHoneydew ? 'PASS — mint/honeydew color found' : 'FAIL — no rgb(223,243,227) found'}`);

    // ── Carrot orange ──
    const hasOrange = await page.evaluate(() => {
      for (const el of document.querySelectorAll('*')) {
        const bg = window.getComputedStyle(el).backgroundColor;
        const color = window.getComputedStyle(el).color;
        if (bg.includes('241, 143, 1') || color.includes('241, 143, 1')) return true;
        if (bg.includes('241,143,1') || color.includes('241,143,1')) return true;
      }
      return false;
    });
    log(`CARROT ORANGE ACCENT CHECK: ${hasOrange ? 'PASS — orange #F18F01 found' : 'FAIL — no rgb(241,143,1) found'}`);

    // ── H1 text ──
    const h1Text = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.textContent.trim() : 'NO H1';
    });
    log(`H1 text: "${h1Text}"`);

    // ── Gold gradient check ──
    const h1GradientEl = await page.evaluate(() => {
      for (const el of document.querySelectorAll('h1 span, h1 em, h1 strong, h1 [class]')) {
        const bg = window.getComputedStyle(el).backgroundImage;
        const webkitFill = window.getComputedStyle(el).webkitTextFillColor;
        if (bg && bg !== 'none') return { bg, webkitFill, text: el.textContent };
      }
      return null;
    });
    log(`Gold gradient element: ${JSON.stringify(h1GradientEl)}`);
    log(`GOLD GRADIENT CHECK: ${h1GradientEl ? 'PASS — gradient span found in H1' : 'FAIL — no gradient span in H1'}`);

    // ── Saffron pill badge ──
    const pillCheck = await page.evaluate(() => {
      // Look for small colored badge/pill elements
      const candidates = document.querySelectorAll('span, div, p');
      for (const el of candidates) {
        const bg = window.getComputedStyle(el).backgroundColor;
        const borderRadius = window.getComputedStyle(el).borderRadius;
        const text = el.textContent.trim();
        if (text.length < 60 && text.length > 2 && parseFloat(borderRadius) > 8) {
          if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
            return { bg, text, borderRadius };
          }
        }
      }
      return null;
    });
    log(`Pill/badge element: ${JSON.stringify(pillCheck)}`);

    // ── Founder quote check ──
    const pageText = await page.evaluate(() => document.body.innerText);
    const hasFounderQuote = pageText.includes('Umesh Sahu') || pageText.includes('In 1995, I chose Pune');
    log(`FOUNDER QUOTE REMOVED CHECK: ${!hasFounderQuote ? 'PASS — no founder quote found' : 'FAIL — founder quote still present!'}`);
    if (pageText.includes('Umesh Sahu')) log('  WARNING: "Umesh Sahu" still in page text');
    if (pageText.includes('In 1995')) log('  WARNING: "In 1995" still in page text');

    // ── Contact form ──
    const hasContactForm = await page.evaluate(() => {
      const form = document.querySelector('form');
      return form ? `FOUND — form with ${form.querySelectorAll('input, textarea, button').length} inputs/buttons` : 'NOT FOUND';
    });
    log(`CONTACT FORM CHECK: ${hasContactForm}`);

    // ── Double grain ──
    const grainCount = await page.evaluate(() => {
      return document.querySelectorAll('[class*="grain"], [class*="noise"], [class*="texture"]').length;
    });
    log(`GRAIN ELEMENT COUNT: ${grainCount} (0=none, 1=single OK, 2+=double grain BUG)`);
    log(`DOUBLE GRAIN CHECK: ${grainCount <= 1 ? 'PASS' : 'FAIL — multiple grain elements found'}`);

    // ── text-shadow check on gold elements ──
    const textShadowCheck = await page.evaluate(() => {
      const goldEls = document.querySelectorAll('[class*="gold"], [class*="accent"], h1 span');
      const results = [];
      for (const el of goldEls) {
        const ts = window.getComputedStyle(el).textShadow;
        results.push({ class: el.className, textShadow: ts });
      }
      return results.slice(0, 5);
    });
    log(`Text-shadow check on gold elements:`);
    for (const item of textShadowCheck) {
      log(`  .${item.class}: text-shadow=${item.textShadow}`);
    }

    // ── Console errors ──
    log(`CONSOLE ERRORS: ${consoleErrors.homepage.length === 0 ? 'NONE (PASS)' : `${consoleErrors.homepage.length} error(s):`}`);
    for (const e of consoleErrors.homepage) log(`  ERROR: ${e}`);

    // ── Horizontal overflow (desktop) ──
    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    log(`HORIZONTAL OVERFLOW (desktop): ${!hasOverflow ? 'NONE (PASS)' : 'OVERFLOW DETECTED (FAIL)'}`);

    await page.close();
  }

  // ─── PAGE 2: INFRASTRUCTURE ────────────────────────────────────────────────
  log('\n========================================');
  log('PAGE: INFRASTRUCTURE — http://localhost:3000/infrastructure');
  log('========================================');

  {
    const page = await browser.newPage();
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.infrastructure.push(msg.text());
    });
    page.on('pageerror', err => consoleErrors.infrastructure.push(`JS ERROR: ${err.message}`));

    await page.goto(`${BASE_URL}/infrastructure`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/03-infrastructure-full.png`, fullPage: true });
    log('Screenshot saved: 03-infrastructure-full.png');

    await page.screenshot({ path: `${SCREENSHOT_DIR}/04-infrastructure-hero.png` });
    log('Screenshot saved: 04-infrastructure-hero.png');

    // ── Dark hero ──
    const heroSections = await page.evaluate(() => {
      const sections = document.querySelectorAll('section');
      const out = [];
      for (const s of sections) {
        const bg = window.getComputedStyle(s).backgroundColor;
        const text = s.textContent.substring(0, 80).trim().replace(/\s+/g, ' ');
        out.push({ bg, text });
      }
      return out.slice(0, 4);
    });
    log('First 4 section backgrounds:');
    for (let i = 0; i < heroSections.length; i++) {
      log(`  Section[${i}]: bg=${heroSections[i].bg} | text="${heroSections[i].text}"`);
    }

    const hasDarkHero = heroSections.some(s => s.bg.includes('40, 0, 3') || s.bg.includes('40,0,3'));
    log(`DARK HERO CHECK: ${hasDarkHero ? 'PASS — mahogany dark background found' : 'FAIL — no mahogany background'}`);

    // ── H1 ──
    const h1Text = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.textContent.trim() : 'NO H1';
    });
    log(`H1 text: "${h1Text}"`);
    log(`H1 INFRASTRUCTURE CHECK: ${h1Text.toLowerCase().includes('infrastructure') ? 'PASS' : 'FAIL — "Infrastructure" not in H1'}`);

    // ── How We Work removed ──
    const pageText = await page.evaluate(() => document.body.innerText);
    const hasHowWeWork = pageText.includes('How We Work') || pageText.includes('From Order to Despatch');
    log(`"HOW WE WORK" REMOVED CHECK: ${!hasHowWeWork ? 'PASS — section not found' : 'FAIL — section still present!'}`);
    if (pageText.includes('How We Work')) log('  WARNING: "How We Work" text still present');
    if (pageText.includes('From Order to Despatch')) log('  WARNING: "From Order to Despatch" still present');
    if (pageText.includes('Step 1') || pageText.includes('Step 2')) log('  WARNING: Step workflow text still present');

    // ── Last section (CTA band) ──
    const lastSection = await page.evaluate(() => {
      const all = document.querySelectorAll('section');
      if (!all.length) return null;
      const last = all[all.length - 1];
      return {
        bg: window.getComputedStyle(last).backgroundColor,
        text: last.textContent.substring(0, 100).trim().replace(/\s+/g, ' ')
      };
    });
    log(`Last section: bg=${lastSection?.bg} | text="${lastSection?.text}"`);
    const lastIsDark = lastSection?.bg?.includes('40, 0, 3') || lastSection?.bg?.includes('40,0,3');
    log(`CTA BAND DARK CHECK: ${lastIsDark ? 'PASS — last section is dark mahogany' : `INFO — last section bg is ${lastSection?.bg}`}`);

    // ── Console errors ──
    log(`CONSOLE ERRORS: ${consoleErrors.infrastructure.length === 0 ? 'NONE (PASS)' : `${consoleErrors.infrastructure.length} error(s):`}`);
    for (const e of consoleErrors.infrastructure) log(`  ERROR: ${e}`);

    await page.close();
  }

  // ─── PAGE 3: PRODUCTS ──────────────────────────────────────────────────────
  log('\n========================================');
  log('PAGE: PRODUCTS — http://localhost:3000/products');
  log('========================================');

  {
    const page = await browser.newPage();
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.products.push(msg.text());
    });
    page.on('pageerror', err => consoleErrors.products.push(`JS ERROR: ${err.message}`));

    await page.goto(`${BASE_URL}/products`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/05-products-full.png`, fullPage: true });
    log('Screenshot saved: 05-products-full.png');

    await page.screenshot({ path: `${SCREENSHOT_DIR}/06-products-hero.png` });
    log('Screenshot saved: 06-products-hero.png');

    // ── Dark hero ──
    const heroSections = await page.evaluate(() => {
      const sections = document.querySelectorAll('section');
      const out = [];
      for (const s of sections) {
        const bg = window.getComputedStyle(s).backgroundColor;
        const text = s.textContent.substring(0, 80).trim().replace(/\s+/g, ' ');
        out.push({ bg, text });
      }
      return out.slice(0, 4);
    });
    log('First 4 section backgrounds:');
    for (let i = 0; i < heroSections.length; i++) {
      log(`  Section[${i}]: bg=${heroSections[i].bg} | text="${heroSections[i].text}"`);
    }

    const hasDarkHero = heroSections.some(s => s.bg.includes('40, 0, 3') || s.bg.includes('40,0,3'));
    log(`DARK HERO CHECK: ${hasDarkHero ? 'PASS — mahogany dark background found' : 'FAIL — no mahogany background'}`);

    // ── H1 ──
    const h1Text = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.textContent.trim() : 'NO H1';
    });
    log(`H1 text: "${h1Text}"`);
    log(`H1 PRODUCTS CHECK: ${h1Text.toLowerCase().includes('product') ? 'PASS' : 'FAIL — "Products" not in H1'}`);

    // ── Honeydew backgrounds ──
    const allBgs = await page.evaluate(() => {
      const elements = document.querySelectorAll('section, main');
      const bgs = [];
      for (const el of elements) {
        const bg = window.getComputedStyle(el).backgroundColor;
        if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') bgs.push(bg);
      }
      return bgs;
    });
    log(`Section backgrounds: ${allBgs.join(' | ')}`);
    const hasHoneydew = allBgs.some(bg => bg.includes('223, 243, 227') || bg.includes('223,243,227'));
    log(`HONEYDEW BACKGROUND CHECK: ${hasHoneydew ? 'PASS — mint/honeydew found' : 'FAIL — no honeydew'}`);

    // ── Console errors ──
    log(`CONSOLE ERRORS: ${consoleErrors.products.length === 0 ? 'NONE (PASS)' : `${consoleErrors.products.length} error(s):`}`);
    for (const e of consoleErrors.products) log(`  ERROR: ${e}`);

    await page.close();
  }

  // ─── MOBILE VIEWPORT CHECK ─────────────────────────────────────────────────
  log('\n========================================');
  log('MOBILE VIEWPORT CHECK (375x812)');
  log('========================================');

  {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 375, height: 812 });
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.homepage.push(`[MOBILE] ${msg.text()}`);
    });

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/07-mobile-homepage-hero.png` });
    log('Screenshot saved: 07-mobile-homepage-hero.png');

    await page.screenshot({ path: `${SCREENSHOT_DIR}/08-mobile-homepage-full.png`, fullPage: true });
    log('Screenshot saved: 08-mobile-homepage-full.png');

    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    log(`MOBILE HORIZONTAL OVERFLOW: ${!hasHorizontalOverflow ? 'NONE (PASS)' : 'OVERFLOW DETECTED (FAIL)'}`);

    if (hasHorizontalOverflow) {
      const offenders = await page.evaluate(() => {
        const docWidth = document.documentElement.clientWidth;
        const found = [];
        document.querySelectorAll('*').forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.right > docWidth + 5) {
            found.push(`${el.tagName}.${[...el.classList].slice(0, 2).join('.')} right=${Math.round(rect.right)}px`);
          }
        });
        return found.slice(0, 10);
      });
      log(`  Overflow offenders: ${offenders.join(', ')}`);
    }

    const heroHeight = await page.evaluate(() => {
      const h = document.querySelector('h1');
      return h ? Math.round(h.getBoundingClientRect().height) : -1;
    });
    log(`Mobile H1 height: ${heroHeight}px ${heroHeight > 0 ? '(PASS — renders)' : '(FAIL — not rendered)'}`);

    // Mobile nav check
    const mobileNav = await page.evaluate(() => {
      const hamburger = document.querySelector('[class*="hamburger"], [class*="menu-btn"], button[aria-label*="menu" i], button[aria-label*="nav" i]');
      return hamburger ? `Hamburger found: ${hamburger.outerHTML.substring(0, 100)}` : 'No hamburger button found';
    });
    log(`Mobile nav: ${mobileNav}`);

    await page.close();
  }

  // ─── NAV LINK CHECK ────────────────────────────────────────────────────────
  log('\n========================================');
  log('NAVIGATION LINKS CHECK');
  log('========================================');

  {
    const page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    const navLinks = await page.evaluate(() => {
      const links = document.querySelectorAll('nav a, header a');
      return [...links].map(a => ({ text: a.textContent.trim(), href: a.getAttribute('href') }));
    });
    log(`Nav links found: ${navLinks.map(l => `"${l.text}"→${l.href}`).join(' | ')}`);

    for (const link of navLinks.slice(0, 8)) {
      if (!link.href || link.href === '#' || link.href.startsWith('mailto') || link.href.startsWith('tel')) continue;
      try {
        const targetUrl = link.href.startsWith('http') ? link.href : `${BASE_URL}${link.href}`;
        const resp = await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
        log(`  NAV "${link.text}" (${link.href}): HTTP ${resp.status()} — ${resp.status() === 200 ? 'PASS' : 'FAIL'}`);
      } catch (e) {
        log(`  NAV "${link.text}" (${link.href}): ERROR — ${e.message}`);
      }
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/09-nav-last-page.png` });
    log('Screenshot saved: 09-nav-last-page.png');

    await page.close();
  }

  await browser.close();

  // ─── TOTALS ────────────────────────────────────────────────────────────────
  log('\n========================================');
  log('SUMMARY');
  log('========================================');
  const passCount = results.filter(r => r.includes(': PASS')).length;
  const failCount = results.filter(r => r.includes(': FAIL')).length;
  log(`PASS: ${passCount}  |  FAIL: ${failCount}`);

  writeFileSync('./qa-report.txt', results.join('\n'));
  console.log('\nReport saved: qa-report.txt');
  console.log(`Screenshots: ${SCREENSHOT_DIR}/`);
}

runQA().catch(err => {
  console.error('QA script crashed:', err);
  process.exit(1);
});
