-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "walletUsed" DECIMAL(65,30) DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "walletBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;
