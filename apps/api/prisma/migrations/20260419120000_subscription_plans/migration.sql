-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE_TRIAL', 'PRO_MONTHLY', 'PRO_YEARLY');

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN "subscriptionPlan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE_TRIAL';
ALTER TABLE "Restaurant" ADD COLUMN "trialEndsAt" TIMESTAMP(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '2 months');
ALTER TABLE "Restaurant" ADD COLUMN "trialOrdersRemaining" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "Restaurant" ADD COLUMN "proRenewsAt" TIMESTAMP(3);
