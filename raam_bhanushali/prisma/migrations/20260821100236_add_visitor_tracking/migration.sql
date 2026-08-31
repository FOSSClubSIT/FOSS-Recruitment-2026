-- DropForeignKey
ALTER TABLE "PortfolioView"
DROP CONSTRAINT "PortfolioView_portfolioId_fkey";

-- Add visitorId as nullable first
ALTER TABLE "PortfolioView"
ADD COLUMN "visitorId" TEXT;

-- Give existing historical views a visitor ID
UPDATE "PortfolioView"
SET "visitorId" = 'legacy-' || "id"
WHERE "visitorId" IS NULL;

-- Make visitorId required for all future views
ALTER TABLE "PortfolioView"
ALTER COLUMN "visitorId" SET NOT NULL;

-- Create indexes
CREATE INDEX "PortfolioView_visitorId_idx"
ON "PortfolioView"("visitorId");

CREATE INDEX "PortfolioView_portfolioId_visitorId_idx"
ON "PortfolioView"("portfolioId", "visitorId");

-- Restore foreign key
ALTER TABLE "PortfolioView"
ADD CONSTRAINT "PortfolioView_portfolioId_fkey"
FOREIGN KEY ("portfolioId")
REFERENCES "Portfolio"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;