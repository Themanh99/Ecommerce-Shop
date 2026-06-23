-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "shopName" TEXT NOT NULL DEFAULT 'MoonKid',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "description" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "twitterUrl" TEXT,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "githubUrl" TEXT,
    "youtubeUrl" TEXT,
    "shippingFeeDefault" DECIMAL(12,0) NOT NULL DEFAULT 30000,
    "freeShippingThreshold" DECIMAL(12,0) NOT NULL DEFAULT 500000,
    "orderExpiryHours" INTEGER NOT NULL DEFAULT 12,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_columns" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_columns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_links" (
    "id" TEXT NOT NULL,
    "footerColumnId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "footer_links_footerColumnId_idx" ON "footer_links"("footerColumnId");

-- AddForeignKey
ALTER TABLE "footer_links" ADD CONSTRAINT "footer_links_footerColumnId_fkey" FOREIGN KEY ("footerColumnId") REFERENCES "footer_columns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
