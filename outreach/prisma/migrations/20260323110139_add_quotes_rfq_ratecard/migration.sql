-- CreateTable
CREATE TABLE "Quote" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "quoteNo" TEXT NOT NULL,
    "leadId" INTEGER NOT NULL,
    "contactId" INTEGER,
    "gstType" TEXT NOT NULL,
    "marginPercent" TEXT NOT NULL,
    "subtotal" TEXT NOT NULL,
    "totalCgst" TEXT NOT NULL,
    "totalSgst" TEXT NOT NULL,
    "totalIgst" TEXT NOT NULL,
    "totalGst" TEXT NOT NULL,
    "grandTotal" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "validUntil" TIMESTAMP(3),
    "notes" TEXT,
    "terms" TEXT,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteItem" (
    "id" SERIAL NOT NULL,
    "quoteId" INTEGER NOT NULL,
    "productType" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "description" TEXT,
    "length" INTEGER,
    "breadth" INTEGER,
    "height" INTEGER,
    "sheetThickness" TEXT,
    "gsm" INTEGER,
    "grade" TEXT,
    "flute" TEXT,
    "closureType" TEXT,
    "extras" JSONB,
    "qty" TEXT NOT NULL,
    "sheetArea" TEXT NOT NULL,
    "sheetRatePerSqm" TEXT NOT NULL,
    "sheetCost" TEXT NOT NULL,
    "cuttingRate" TEXT NOT NULL,
    "weldingRate" TEXT NOT NULL,
    "printingRate" TEXT NOT NULL,
    "sheetingRate" TEXT,
    "slittingRate" TEXT,
    "rewindingRate" TEXT,
    "conversionCost" TEXT NOT NULL,
    "extrasCost" TEXT NOT NULL,
    "unitCost" TEXT NOT NULL,
    "marginPercent" TEXT NOT NULL,
    "sellingPrice" TEXT NOT NULL,
    "gstRate" TEXT NOT NULL,
    "taxableAmt" TEXT NOT NULL,
    "cgst" TEXT NOT NULL,
    "sgst" TEXT NOT NULL,
    "igst" TEXT NOT NULL,
    "lineTotal" TEXT NOT NULL,
    "remarks" TEXT,

    CONSTRAINT "QuoteItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierRfq" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rfqNo" TEXT NOT NULL,
    "quoteId" INTEGER NOT NULL,
    "supplierName" TEXT NOT NULL,
    "supplierEmail" TEXT,
    "supplierPhone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "sentAt" TIMESTAMP(3),
    "responseDeadline" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "SupplierRfq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RfqItem" (
    "id" SERIAL NOT NULL,
    "rfqId" INTEGER NOT NULL,
    "materialName" TEXT NOT NULL,
    "specification" TEXT,
    "quantity" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "estimatedRate" TEXT,
    "supplierQuotedRate" TEXT,
    "notes" TEXT,

    CONSTRAINT "RfqItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateCard" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "defaultRate" TEXT NOT NULL,
    "lastPurchaseRate" TEXT,
    "notes" TEXT,

    CONSTRAINT "RateCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Quote_quoteNo_key" ON "Quote"("quoteNo");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierRfq_rfqNo_key" ON "SupplierRfq"("rfqNo");

-- CreateIndex
CREATE UNIQUE INDEX "RateCard_category_name_key" ON "RateCard"("category", "name");

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierRfq" ADD CONSTRAINT "SupplierRfq_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RfqItem" ADD CONSTRAINT "RfqItem_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "SupplierRfq"("id") ON DELETE CASCADE ON UPDATE CASCADE;
