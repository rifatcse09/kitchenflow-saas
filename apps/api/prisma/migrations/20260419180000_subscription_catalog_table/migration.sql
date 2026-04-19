-- Catalog table for subscription products; restaurants reference by id.

CREATE TYPE "SubscriptionEnforcement" AS ENUM ('TRIAL_TIME_AND_ORDERS', 'PRO_UNLIMITED');

CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "enforcement" "SubscriptionEnforcement" NOT NULL,
    "trialDurationMonths" INTEGER NOT NULL DEFAULT 2,
    "guestOrderTrialCap" INTEGER NOT NULL DEFAULT 10,
    "paidWindowMonths" INTEGER NOT NULL DEFAULT 120,
    "renewalPeriodMonths" INTEGER,
    "guestOrderPaidBudget" INTEGER NOT NULL DEFAULT 999999,
    "priceCents" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Subscription_slug_key" ON "Subscription"("slug");

INSERT INTO "Subscription" (
    "id",
    "slug",
    "name",
    "description",
    "active",
    "sortOrder",
    "enforcement",
    "trialDurationMonths",
    "guestOrderTrialCap",
    "paidWindowMonths",
    "renewalPeriodMonths",
    "guestOrderPaidBudget",
    "priceCents",
    "createdAt",
    "updatedAt"
) VALUES
    (1, 'free-trial', 'Free trial', '2 months and 10 guest orders.', true, 0, 'TRIAL_TIME_AND_ORDERS', 2, 10, 2, NULL, 10, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'pro-monthly', 'Pro · monthly', 'Paid tier with monthly renewal (demo).', true, 1, 'PRO_UNLIMITED', 2, 10, 120, 1, 999999, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 'pro-yearly', 'Pro · yearly', 'Paid tier with yearly renewal (demo).', true, 2, 'PRO_UNLIMITED', 2, 10, 120, 12, 999999, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

SELECT setval(pg_get_serial_sequence('"Subscription"', 'id'), (SELECT MAX("id") FROM "Subscription"));

ALTER TABLE "Restaurant" ADD COLUMN "subscriptionId" INTEGER;

UPDATE "Restaurant" SET "subscriptionId" = CASE "subscriptionPlan"::text
    WHEN 'FREE_TRIAL' THEN 1
    WHEN 'PRO_MONTHLY' THEN 2
    WHEN 'PRO_YEARLY' THEN 3
    ELSE 1
END;

ALTER TABLE "Restaurant" ALTER COLUMN "subscriptionId" SET NOT NULL;

ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_subscriptionId_fkey"
    FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Restaurant" DROP COLUMN "subscriptionPlan";

DROP TYPE "SubscriptionPlan";
