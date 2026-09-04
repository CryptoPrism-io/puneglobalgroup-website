# Pune Global Group operating manual

This is the human-readable map for using the repository as a Company OS. The system of record remains the specialist application or verified document; this file only routes work.

## Ask the agent

Use one of the repo-local skills by name:

- `$pgg-website-ops` — website copy, product pages, SEO, images, contact flow, Firebase build/deploy preparation.
- `$pgg-crm-sales` — lead research, activity updates, RFQs, quotations, follow-ups and won/lost handoff.
- `$pgg-finance-erp` — customers, suppliers, products, sales, purchases, invoices, proformas, payments and accounting reports.
- `$pgg-gst-docs` — GST reconciliation/filing preparation and confidential company-document inventory.

Good requests name the outcome and provide source evidence. Example: “Use `$pgg-crm-sales` to draft a quotation for this customer from the attached PO; preview it but do not send.”

## Operating cycle

### Daily

1. Capture new enquiries and every customer interaction in `outreach/`.
2. Review follow-ups, qualified leads, open RFQs and quotations awaiting response.
3. After approval, create won-order accounting records in `invoicer/` and reconcile receipts against bank evidence.
4. Keep website changes separate from CRM/ERP data changes and verify the website build before deployment.

### Weekly

1. Review CRM pipeline ageing and quotations without a next action.
2. Review ERP receivables, payables, purchase entries, stock/product master changes and numbering continuity.
3. Archive superseded confidential documents locally and update the document register.
4. Check backups and production access; remove unused credentials and accounts.

### Monthly / filing period

1. Work from `.company-private/gst/`; read its `README.md` and `AGENTS.md` first.
2. Reconcile ERP sales/purchase data with invoices, credit notes, portal data and bank evidence.
3. Resolve differences before preparing a return. Never adjust figures merely to make totals match.
4. Present the return period, entity, liability/input-credit summary and unresolved exceptions to the user.
5. File, pay, or complete OTP/DSC/EVC only after explicit approval; save and register the portal acknowledgement.

## Permission gates

Agents may inspect, reconcile, calculate, draft, generate previews and run non-production checks. They must pause before:

- sending customer/vendor communications;
- deploying a production service;
- writing or migrating a production database;
- issuing, deleting or materially revising a financial document;
- recording a payment without evidence;
- submitting a GST return, creating a payment liability, paying tax, or completing OTP/DSC/EVC.

## Confidential document structure

Use this local-only layout when consolidating master documents:

```text
.company-private/
  gst/                         # GST automation, working data and filing history
  master-docs/
    current/
    archive/
  brand-assets/
  sales/
    invoices/
    proforma-invoices/
    quotations/
  purchases/
    to-review/
  banking/
  customers/
  vendors/
```

`.company-private/` is gitignored. Keep only the non-secret inventory in `DOCUMENT_REGISTER.md`. Do not put passwords, OTPs, full bank numbers or portal cookies in the register.

## Current ownership decisions

- `outreach/` owns CRM and quotations.
- The private AWS outreach deployment is the sole production CRM database. Local PostgreSQL is a temporary rollback copy only and must not receive new production records.
- Production CRM access is through the SSM tunnel opened by `outreach/deploy/open-aws-crm.ps1`; do not expose PostgreSQL or the CRM with public security-group ingress.
- CRM CI/CD may build immutable images, back up PostgreSQL, apply reviewed Prisma migrations and restart the AWS service. It must never copy production records between databases.
- `invoicer/` owns accounting ERP records.
- `.company-private/gst/` owns GST filing workflows and working data. The former `C:\cpio_db\GST` directory was moved here on 24 August 2026.
- `pgg-ops/` remains secondary until its identity data and overlapping modules are reconciled.
- Current PGG GST registration, proprietor PAN, Udyam/MSME and bank-proof files are inventoried under `.company-private/master-docs/current/`.
- The historical `MASTER_DOCS/PGP` and files carrying GSTIN `27ANUPS5904Q1ZU` belong to Pune Global Packaging/legacy records and are not current Pune Global Group sources.
- The verified copies under `.company-private/` are now canonical. Original Downloads files were retained as safety copies; do not re-import them unless their hash or content has changed.
- `C:\Users\44776\Downloads\PGG` is an older working copy of the `pgg-ops` codebase with uncommitted changes. It was not imported as company documentation and must not be deleted until those code changes are reconciled separately.

## Known security work

Replace any remaining documented default passwords before production use. The obsolete GCP migration scripts and their legacy connection-string fallbacks were removed on 1 September 2026 when AWS became the sole production CRM authority.
