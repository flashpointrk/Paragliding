-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OPERATOR');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'POSTPONED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MailOutboxType" AS ENUM ('CONTACT_ADMIN', 'BOOKING_CUSTOMER', 'BOOKING_ADMIN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OPERATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_attempts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ip" TEXT,
    "successful" BOOLEAN NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT[],
    "nameTr" TEXT,
    "descriptionTr" TEXT,
    "contentTr" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "showPrice" BOOLEAN NOT NULL DEFAULT false,
    "priceMin" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pilots" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "experienceYears" INTEGER NOT NULL,
    "licence" TEXT,
    "licenceTr" TEXT,
    "languages" TEXT[],
    "photoUrl" TEXT,
    "bio" TEXT NOT NULL,
    "specialtyTr" TEXT,
    "bioTr" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pilots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "preferredDate" TIMESTAMP(3) NOT NULL,
    "alternateDate" TIMESTAMP(3),
    "preferredTime" TEXT,
    "guestCount" INTEGER NOT NULL DEFAULT 1,
    "weightRange" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'EN',
    "transferRequested" BOOLEAN NOT NULL DEFAULT false,
    "mediaPreference" TEXT,
    "note" TEXT,
    "privacyConsent" BOOLEAN NOT NULL,
    "explicitConsent" BOOLEAN NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_status_history" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL,
    "note" TEXT,
    "userId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_thresholds" (
    "id" TEXT NOT NULL,
    "locationName" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "takeoffHeading" DOUBLE PRECISION NOT NULL,
    "windMaxGreen" DOUBLE PRECISION NOT NULL,
    "windMaxAmber" DOUBLE PRECISION NOT NULL,
    "gustDeltaMaxGreen" DOUBLE PRECISION NOT NULL,
    "gustDeltaMaxAmber" DOUBLE PRECISION NOT NULL,
    "precipMaxGreen" DOUBLE PRECISION NOT NULL,
    "precipMaxAmber" DOUBLE PRECISION NOT NULL,
    "visibilityMinGreen" DOUBLE PRECISION NOT NULL,
    "visibilityMinAmber" DOUBLE PRECISION NOT NULL,
    "windSectorMin" DOUBLE PRECISION,
    "windSectorMax" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weather_thresholds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_settings" (
    "id" TEXT NOT NULL,
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "address" TEXT,
    "openingHours" TEXT,
    "openingHoursTr" TEXT,
    "mapEmbed" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "youtube" TEXT,
    "turnstileEnabled" BOOLEAN NOT NULL DEFAULT false,
    "turnstileSiteKey" TEXT,
    "turnstileSecret" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_requests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_outbox" (
    "id" TEXT NOT NULL,
    "type" "MailOutboxType" NOT NULL,
    "recipient" TEXT,
    "bookingId" TEXT,
    "contactRequestId" TEXT,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastError" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mail_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "questionTr" TEXT,
    "answerTr" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "author" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "altText" TEXT,
    "titleTr" TEXT,
    "altTextTr" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'image',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_contents" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'tr',
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "images" JSONB NOT NULL DEFAULT '{}',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "altText" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "login_attempts_email_occurredAt_idx" ON "login_attempts"("email", "occurredAt");

-- CreateIndex
CREATE INDEX "login_attempts_ip_occurredAt_idx" ON "login_attempts"("ip", "occurredAt");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_preferredDate_idx" ON "bookings"("preferredDate");

-- CreateIndex
CREATE INDEX "booking_status_history_bookingId_idx" ON "booking_status_history"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "weather_thresholds_locationName_key" ON "weather_thresholds"("locationName");

-- CreateIndex
CREATE INDEX "contact_requests_createdAt_idx" ON "contact_requests"("createdAt");

-- CreateIndex
CREATE INDEX "mail_outbox_sentAt_nextAttemptAt_idx" ON "mail_outbox"("sentAt", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "mail_outbox_bookingId_idx" ON "mail_outbox"("bookingId");

-- CreateIndex
CREATE INDEX "mail_outbox_contactRequestId_idx" ON "mail_outbox"("contactRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "page_contents_slug_locale_key" ON "page_contents"("slug", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "page_media_url_key" ON "page_media"("url");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_status_history" ADD CONSTRAINT "booking_status_history_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_status_history" ADD CONSTRAINT "booking_status_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_outbox" ADD CONSTRAINT "mail_outbox_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_outbox" ADD CONSTRAINT "mail_outbox_contactRequestId_fkey" FOREIGN KEY ("contactRequestId") REFERENCES "contact_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

