-- CreateTable
CREATE TABLE "Lead" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyName" TEXT NOT NULL,
    "industry" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "address" TEXT,
    "website" TEXT,
    "gstin" TEXT,
    "employeeCount" INTEGER,
    "estimatedRevenue" TEXT,
    "yearEstablished" INTEGER,
    "icpType" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "productFit" JSONB,
    "fitScore" INTEGER,
    "fitNotes" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'NEW',
    "stageChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lostReason" TEXT,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "sourceUrl" TEXT,
    "scrapedAt" TIMESTAMP(3),
    "scrapeBatchId" INTEGER,
    "currentPackaging" TEXT,
    "currentSupplier" TEXT,
    "estimatedMonthlyVolume" TEXT,
    "painPoints" TEXT,
    "opportunities" TEXT,
    "discType" TEXT,
    "discNotes" TEXT,
    "spinSituation" TEXT,
    "spinProblem" TEXT,
    "spinImplication" TEXT,
    "spinNeedPayoff" TEXT,
    "meddic" JSONB,
    "growGoal" TEXT,
    "growReality" TEXT,
    "growOptions" TEXT,
    "growWill" TEXT,
    "notes" TEXT,
    "tags" JSONB,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "leadId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT,
    "department" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "whatsapp" TEXT,
    "linkedinUrl" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "discType" TEXT,
    "notes" TEXT,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leadId" INTEGER NOT NULL,
    "contactId" INTEGER,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapeBatch" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "leadsFound" INTEGER NOT NULL DEFAULT 0,
    "leadsNew" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "ScrapeBatch_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_scrapeBatchId_fkey" FOREIGN KEY ("scrapeBatchId") REFERENCES "ScrapeBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
