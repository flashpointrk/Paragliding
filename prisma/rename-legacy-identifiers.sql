-- Renames an existing database from the original Turkish identifiers to the
-- English ones in prisma/schema.prisma.
--
-- Only needed for a database created before the rename. A database created
-- from prisma/migrations/0000_init is already English and must NOT run this.
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f prisma/rename-legacy-identifiers.sql
--
-- It runs in a single transaction, so it either applies completely or not at
-- all. Take a backup first, and stop the application while it runs: the renames
-- are instant, but code built against the old names breaks the moment they
-- change.
--
-- Afterwards, record the baseline as already applied:
--   npx prisma migrate resolve --applied 0000_init
--
-- Stored *values* are a separate job: `npm run db:migrate-legacy-values`.

BEGIN;

-- Enum values
ALTER TYPE "RezervasyonDurum" RENAME VALUE 'BEKLEMEDE' TO 'PENDING';
ALTER TYPE "RezervasyonDurum" RENAME VALUE 'TEYIT' TO 'CONFIRMED';
ALTER TYPE "RezervasyonDurum" RENAME VALUE 'ERTELENDI' TO 'POSTPONED';
ALTER TYPE "RezervasyonDurum" RENAME VALUE 'IPTAL' TO 'CANCELLED';
ALTER TYPE "RezervasyonDurum" RENAME VALUE 'TAMAMLANDI' TO 'COMPLETED';
ALTER TYPE "MailOutboxTuru" RENAME VALUE 'ILETISIM_ADMIN' TO 'CONTACT_ADMIN';
ALTER TYPE "MailOutboxTuru" RENAME VALUE 'REZERVASYON_MUSTERI' TO 'BOOKING_CUSTOMER';
ALTER TYPE "MailOutboxTuru" RENAME VALUE 'REZERVASYON_ADMIN' TO 'BOOKING_ADMIN';

-- Enum types
ALTER TYPE "RezervasyonDurum" RENAME TO "BookingStatus";
ALTER TYPE "MailOutboxTuru" RENAME TO "MailOutboxType";

-- Columns (renamed while the tables still carry their old names)

-- login_denemeleri
ALTER TABLE "login_denemeleri" RENAME COLUMN "basarili" TO "successful";
ALTER TABLE "login_denemeleri" RENAME COLUMN "tarih" TO "occurredAt";

-- paketler
ALTER TABLE "paketler" RENAME COLUMN "ad" TO "name";
ALTER TABLE "paketler" RENAME COLUMN "aciklama" TO "description";
ALTER TABLE "paketler" RENAME COLUMN "icerik" TO "content";
ALTER TABLE "paketler" RENAME COLUMN "adEn" TO "nameEn";
ALTER TABLE "paketler" RENAME COLUMN "aciklamaEn" TO "descriptionEn";
ALTER TABLE "paketler" RENAME COLUMN "icerikEn" TO "contentEn";
ALTER TABLE "paketler" RENAME COLUMN "fiyatGosterimi" TO "showPrice";
ALTER TABLE "paketler" RENAME COLUMN "fiyatMin" TO "priceMin";
ALTER TABLE "paketler" RENAME COLUMN "siralama" TO "sortOrder";
ALTER TABLE "paketler" RENAME COLUMN "aktif" TO "active";

-- pilotlar
ALTER TABLE "pilotlar" RENAME COLUMN "ad" TO "name";
ALTER TABLE "pilotlar" RENAME COLUMN "uzmanlik" TO "specialty";
ALTER TABLE "pilotlar" RENAME COLUMN "deneyimYil" TO "experienceYears";
ALTER TABLE "pilotlar" RENAME COLUMN "lisans" TO "licence";
ALTER TABLE "pilotlar" RENAME COLUMN "lisansEn" TO "licenceEn";
ALTER TABLE "pilotlar" RENAME COLUMN "diller" TO "languages";
ALTER TABLE "pilotlar" RENAME COLUMN "fotoUrl" TO "photoUrl";
ALTER TABLE "pilotlar" RENAME COLUMN "metin" TO "bio";
ALTER TABLE "pilotlar" RENAME COLUMN "uzmanlikEn" TO "specialtyEn";
ALTER TABLE "pilotlar" RENAME COLUMN "metinEn" TO "bioEn";
ALTER TABLE "pilotlar" RENAME COLUMN "aktif" TO "active";

-- rezervasyonlar
ALTER TABLE "rezervasyonlar" RENAME COLUMN "paketId" TO "packageId";
ALTER TABLE "rezervasyonlar" RENAME COLUMN "tarihTercih" TO "preferredDate";
ALTER TABLE "rezervasyonlar" RENAME COLUMN "tarihAlternatif" TO "alternateDate";
ALTER TABLE "rezervasyonlar" RENAME COLUMN "saatTercih" TO "preferredTime";
ALTER TABLE "rezervasyonlar" RENAME COLUMN "kisiSayisi" TO "guestCount";
ALTER TABLE "rezervasyonlar" RENAME COLUMN "kiloAralik" TO "weightRange";
ALTER TABLE "rezervasyonlar" RENAME COLUMN "adSoyad" TO "fullName";
ALTER TABLE "rezervasyonlar" RENAME COLUMN "telefon" TO "phone";
ALTER TABLE "rezervasyonlar" RENAME COLUMN "dil" TO "locale";
ALTER TABLE "rezervasyonlar" RENAME COLUMN "transferTalep" TO "transferRequested";
ALTER TABLE "rezervasyonlar" RENAME COLUMN "medyaTercih" TO "mediaPreference";
ALTER TABLE "rezervasyonlar" RENAME COLUMN "not" TO "note";
ALTER TABLE "rezervasyonlar" RENAME COLUMN "kvkkOnay" TO "privacyConsent";
ALTER TABLE "rezervasyonlar" RENAME COLUMN "acikRizaOnay" TO "explicitConsent";
ALTER TABLE "rezervasyonlar" RENAME COLUMN "durum" TO "status";

-- rezervasyon_durum_gecmisi
ALTER TABLE "rezervasyon_durum_gecmisi" RENAME COLUMN "rezervasyonId" TO "bookingId";
ALTER TABLE "rezervasyon_durum_gecmisi" RENAME COLUMN "durum" TO "status";
ALTER TABLE "rezervasyon_durum_gecmisi" RENAME COLUMN "not" TO "note";
ALTER TABLE "rezervasyon_durum_gecmisi" RENAME COLUMN "kullaniciId" TO "userId";
ALTER TABLE "rezervasyon_durum_gecmisi" RENAME COLUMN "tarih" TO "occurredAt";

-- hava_esikleri
ALTER TABLE "hava_esikleri" RENAME COLUMN "lokasyonAd" TO "locationName";
ALTER TABLE "hava_esikleri" RENAME COLUMN "kalkisYon" TO "takeoffHeading";
ALTER TABLE "hava_esikleri" RENAME COLUMN "ruzgarMaxYesil" TO "windMaxGreen";
ALTER TABLE "hava_esikleri" RENAME COLUMN "ruzgarMaxSari" TO "windMaxAmber";
ALTER TABLE "hava_esikleri" RENAME COLUMN "gustFarkMaxYesil" TO "gustDeltaMaxGreen";
ALTER TABLE "hava_esikleri" RENAME COLUMN "gustFarkMaxSari" TO "gustDeltaMaxAmber";
ALTER TABLE "hava_esikleri" RENAME COLUMN "yagisMaxYesil" TO "precipMaxGreen";
ALTER TABLE "hava_esikleri" RENAME COLUMN "yagisMaxSari" TO "precipMaxAmber";
ALTER TABLE "hava_esikleri" RENAME COLUMN "gorusMinYesil" TO "visibilityMinGreen";
ALTER TABLE "hava_esikleri" RENAME COLUMN "gorusMinSari" TO "visibilityMinAmber";
ALTER TABLE "hava_esikleri" RENAME COLUMN "yonSektorMin" TO "windSectorMin";
ALTER TABLE "hava_esikleri" RENAME COLUMN "yonSektorMax" TO "windSectorMax";
ALTER TABLE "hava_esikleri" RENAME COLUMN "aktif" TO "active";

-- iletisim_ayarlari
ALTER TABLE "iletisim_ayarlari" RENAME COLUMN "telefon" TO "phone";
ALTER TABLE "iletisim_ayarlari" RENAME COLUMN "adres" TO "address";
ALTER TABLE "iletisim_ayarlari" RENAME COLUMN "calismaSaatleri" TO "openingHours";
ALTER TABLE "iletisim_ayarlari" RENAME COLUMN "calismaSaatleriEn" TO "openingHoursEn";
ALTER TABLE "iletisim_ayarlari" RENAME COLUMN "turnstileAktif" TO "turnstileEnabled";

-- iletisim_talepleri
ALTER TABLE "iletisim_talepleri" RENAME COLUMN "ad" TO "name";
ALTER TABLE "iletisim_talepleri" RENAME COLUMN "konu" TO "subject";
ALTER TABLE "iletisim_talepleri" RENAME COLUMN "mesaj" TO "message";

-- mail_outbox
ALTER TABLE "mail_outbox" RENAME COLUMN "tur" TO "type";
ALTER TABLE "mail_outbox" RENAME COLUMN "alici" TO "recipient";
ALTER TABLE "mail_outbox" RENAME COLUMN "rezervasyonId" TO "bookingId";
ALTER TABLE "mail_outbox" RENAME COLUMN "iletisimTalebiId" TO "contactRequestId";
ALTER TABLE "mail_outbox" RENAME COLUMN "denemeSayisi" TO "attemptCount";
ALTER TABLE "mail_outbox" RENAME COLUMN "sonrakiDeneme" TO "nextAttemptAt";
ALTER TABLE "mail_outbox" RENAME COLUMN "sonHata" TO "lastError";
ALTER TABLE "mail_outbox" RENAME COLUMN "gonderildiAt" TO "sentAt";

-- sss
ALTER TABLE "sss" RENAME COLUMN "soru" TO "question";
ALTER TABLE "sss" RENAME COLUMN "cevap" TO "answer";
ALTER TABLE "sss" RENAME COLUMN "soruEn" TO "questionEn";
ALTER TABLE "sss" RENAME COLUMN "cevapEn" TO "answerEn";
ALTER TABLE "sss" RENAME COLUMN "siralama" TO "sortOrder";
ALTER TABLE "sss" RENAME COLUMN "aktif" TO "active";

-- blog_yazilari
ALTER TABLE "blog_yazilari" RENAME COLUMN "baslik" TO "title";
ALTER TABLE "blog_yazilari" RENAME COLUMN "ozet" TO "summary";
ALTER TABLE "blog_yazilari" RENAME COLUMN "icerik" TO "content";
ALTER TABLE "blog_yazilari" RENAME COLUMN "gorselUrl" TO "imageUrl";
ALTER TABLE "blog_yazilari" RENAME COLUMN "yayinda" TO "published";
ALTER TABLE "blog_yazilari" RENAME COLUMN "yayinTarihi" TO "publishedAt";
ALTER TABLE "blog_yazilari" RENAME COLUMN "yazar" TO "author";

-- galeri_medya
ALTER TABLE "galeri_medya" RENAME COLUMN "baslik" TO "title";
ALTER TABLE "galeri_medya" RENAME COLUMN "altMetin" TO "altText";
ALTER TABLE "galeri_medya" RENAME COLUMN "baslikEn" TO "titleEn";
ALTER TABLE "galeri_medya" RENAME COLUMN "altMetinEn" TO "altTextEn";
ALTER TABLE "galeri_medya" RENAME COLUMN "genislik" TO "width";
ALTER TABLE "galeri_medya" RENAME COLUMN "yukseklik" TO "height";
ALTER TABLE "galeri_medya" RENAME COLUMN "kategori" TO "category";
ALTER TABLE "galeri_medya" RENAME COLUMN "tur" TO "type";
ALTER TABLE "galeri_medya" RENAME COLUMN "aktif" TO "active";
ALTER TABLE "galeri_medya" RENAME COLUMN "siralama" TO "sortOrder";

-- sayfa_icerikleri
ALTER TABLE "sayfa_icerikleri" RENAME COLUMN "dil" TO "locale";
ALTER TABLE "sayfa_icerikleri" RENAME COLUMN "baslik" TO "title";
ALTER TABLE "sayfa_icerikleri" RENAME COLUMN "icerik" TO "content";
ALTER TABLE "sayfa_icerikleri" RENAME COLUMN "gorseller" TO "images";
ALTER TABLE "sayfa_icerikleri" RENAME COLUMN "aktif" TO "active";

-- sayfa_medya
ALTER TABLE "sayfa_medya" RENAME COLUMN "baslik" TO "title";
ALTER TABLE "sayfa_medya" RENAME COLUMN "altMetin" TO "altText";
ALTER TABLE "sayfa_medya" RENAME COLUMN "genislik" TO "width";
ALTER TABLE "sayfa_medya" RENAME COLUMN "yukseklik" TO "height";
ALTER TABLE "sayfa_medya" RENAME COLUMN "aktif" TO "active";
ALTER TABLE "sayfa_medya" RENAME COLUMN "siralama" TO "sortOrder";

-- Tables
ALTER TABLE "login_denemeleri" RENAME TO "login_attempts";
ALTER TABLE "paketler" RENAME TO "packages";
ALTER TABLE "pilotlar" RENAME TO "pilots";
ALTER TABLE "rezervasyonlar" RENAME TO "bookings";
ALTER TABLE "rezervasyon_durum_gecmisi" RENAME TO "booking_status_history";
ALTER TABLE "hava_esikleri" RENAME TO "weather_thresholds";
ALTER TABLE "iletisim_ayarlari" RENAME TO "contact_settings";
ALTER TABLE "iletisim_talepleri" RENAME TO "contact_requests";
ALTER TABLE "sss" RENAME TO "faqs";
ALTER TABLE "blog_yazilari" RENAME TO "blog_posts";
ALTER TABLE "galeri_medya" RENAME TO "gallery_media";
ALTER TABLE "sayfa_icerikleri" RENAME TO "page_contents";
ALTER TABLE "sayfa_medya" RENAME TO "page_media";

-- Primary keys and foreign keys
ALTER TABLE "login_attempts" RENAME CONSTRAINT "login_denemeleri_pkey" TO "login_attempts_pkey";
ALTER TABLE "packages" RENAME CONSTRAINT "paketler_pkey" TO "packages_pkey";
ALTER TABLE "pilots" RENAME CONSTRAINT "pilotlar_pkey" TO "pilots_pkey";
ALTER TABLE "bookings" RENAME CONSTRAINT "rezervasyonlar_pkey" TO "bookings_pkey";
ALTER TABLE "booking_status_history" RENAME CONSTRAINT "rezervasyon_durum_gecmisi_pkey" TO "booking_status_history_pkey";
ALTER TABLE "weather_thresholds" RENAME CONSTRAINT "hava_esikleri_pkey" TO "weather_thresholds_pkey";
ALTER TABLE "contact_settings" RENAME CONSTRAINT "iletisim_ayarlari_pkey" TO "contact_settings_pkey";
ALTER TABLE "contact_requests" RENAME CONSTRAINT "iletisim_talepleri_pkey" TO "contact_requests_pkey";
ALTER TABLE "faqs" RENAME CONSTRAINT "sss_pkey" TO "faqs_pkey";
ALTER TABLE "blog_posts" RENAME CONSTRAINT "blog_yazilari_pkey" TO "blog_posts_pkey";
ALTER TABLE "gallery_media" RENAME CONSTRAINT "galeri_medya_pkey" TO "gallery_media_pkey";
ALTER TABLE "page_contents" RENAME CONSTRAINT "sayfa_icerikleri_pkey" TO "page_contents_pkey";
ALTER TABLE "page_media" RENAME CONSTRAINT "sayfa_medya_pkey" TO "page_media_pkey";
ALTER TABLE "bookings" RENAME CONSTRAINT "rezervasyonlar_paketId_fkey" TO "bookings_packageId_fkey";
ALTER TABLE "booking_status_history" RENAME CONSTRAINT "rezervasyon_durum_gecmisi_rezervasyonId_fkey" TO "booking_status_history_bookingId_fkey";
ALTER TABLE "booking_status_history" RENAME CONSTRAINT "rezervasyon_durum_gecmisi_kullaniciId_fkey" TO "booking_status_history_userId_fkey";
ALTER TABLE "mail_outbox" RENAME CONSTRAINT "mail_outbox_rezervasyonId_fkey" TO "mail_outbox_bookingId_fkey";
ALTER TABLE "mail_outbox" RENAME CONSTRAINT "mail_outbox_iletisimTalebiId_fkey" TO "mail_outbox_contactRequestId_fkey";

-- Indexes
ALTER INDEX "login_denemeleri_email_tarih_idx" RENAME TO "login_attempts_email_occurredAt_idx";
ALTER INDEX "login_denemeleri_ip_tarih_idx" RENAME TO "login_attempts_ip_occurredAt_idx";
ALTER INDEX "rezervasyonlar_durum_idx" RENAME TO "bookings_status_idx";
ALTER INDEX "rezervasyonlar_tarihTercih_idx" RENAME TO "bookings_preferredDate_idx";
ALTER INDEX "rezervasyon_durum_gecmisi_rezervasyonId_idx" RENAME TO "booking_status_history_bookingId_idx";
ALTER INDEX "hava_esikleri_lokasyonAd_key" RENAME TO "weather_thresholds_locationName_key";
ALTER INDEX "iletisim_talepleri_createdAt_idx" RENAME TO "contact_requests_createdAt_idx";
ALTER INDEX "mail_outbox_gonderildiAt_sonrakiDeneme_idx" RENAME TO "mail_outbox_sentAt_nextAttemptAt_idx";
ALTER INDEX "mail_outbox_rezervasyonId_idx" RENAME TO "mail_outbox_bookingId_idx";
ALTER INDEX "mail_outbox_iletisimTalebiId_idx" RENAME TO "mail_outbox_contactRequestId_idx";
ALTER INDEX "blog_yazilari_slug_key" RENAME TO "blog_posts_slug_key";
ALTER INDEX "sayfa_icerikleri_slug_dil_key" RENAME TO "page_contents_slug_locale_key";
ALTER INDEX "sayfa_medya_url_key" RENAME TO "page_media_url_key";

-- Column defaults that also carried Turkish values. Existing rows are rewritten
-- separately by `npm run db:migrate-legacy-values`; these two statements fix
-- what new rows get.
ALTER TABLE "gallery_media" ALTER COLUMN "type" SET DEFAULT 'image';
ALTER TABLE "bookings" ALTER COLUMN "locale" SET DEFAULT 'EN';


-- The translation columns were `<field>En` and held English while the base
-- column held Turkish. English is now the default locale, so the base column
-- holds English and the translation is `<field>Tr`. Rename, then swap the two
-- values so existing rows end up the right way round.

ALTER TABLE "packages" RENAME COLUMN "nameEn" TO "nameTr";
ALTER TABLE "packages" RENAME COLUMN "descriptionEn" TO "descriptionTr";
ALTER TABLE "packages" RENAME COLUMN "contentEn" TO "contentTr";
ALTER TABLE "pilots" RENAME COLUMN "licenceEn" TO "licenceTr";
ALTER TABLE "pilots" RENAME COLUMN "specialtyEn" TO "specialtyTr";
ALTER TABLE "pilots" RENAME COLUMN "bioEn" TO "bioTr";
ALTER TABLE "contact_settings" RENAME COLUMN "openingHoursEn" TO "openingHoursTr";
ALTER TABLE "faqs" RENAME COLUMN "questionEn" TO "questionTr";
ALTER TABLE "faqs" RENAME COLUMN "answerEn" TO "answerTr";
ALTER TABLE "gallery_media" RENAME COLUMN "titleEn" TO "titleTr";
ALTER TABLE "gallery_media" RENAME COLUMN "altTextEn" TO "altTextTr";

UPDATE "packages" SET "name" = "nameTr", "nameTr" = "name"
  WHERE "nameTr" IS NOT NULL AND "nameTr" <> '';
UPDATE "packages" SET "description" = "descriptionTr", "descriptionTr" = "description"
  WHERE "descriptionTr" IS NOT NULL AND "descriptionTr" <> '';
UPDATE "pilots" SET "licence" = "licenceTr", "licenceTr" = "licence"
  WHERE "licenceTr" IS NOT NULL AND "licenceTr" <> '';
UPDATE "pilots" SET "specialty" = "specialtyTr", "specialtyTr" = "specialty"
  WHERE "specialtyTr" IS NOT NULL AND "specialtyTr" <> '';
UPDATE "pilots" SET "bio" = "bioTr", "bioTr" = "bio"
  WHERE "bioTr" IS NOT NULL AND "bioTr" <> '';
UPDATE "contact_settings" SET "openingHours" = "openingHoursTr", "openingHoursTr" = "openingHours"
  WHERE "openingHoursTr" IS NOT NULL AND "openingHoursTr" <> '';
UPDATE "faqs" SET "question" = "questionTr", "questionTr" = "question"
  WHERE "questionTr" IS NOT NULL AND "questionTr" <> '';
UPDATE "faqs" SET "answer" = "answerTr", "answerTr" = "answer"
  WHERE "answerTr" IS NOT NULL AND "answerTr" <> '';
UPDATE "gallery_media" SET "title" = "titleTr", "titleTr" = "title"
  WHERE "titleTr" IS NOT NULL AND "titleTr" <> '';
UPDATE "gallery_media" SET "altText" = "altTextTr", "altTextTr" = "altText"
  WHERE "altTextTr" IS NOT NULL AND "altTextTr" <> '';
-- `content` is a non-null array defaulting to {}, so an empty array means
-- "no translation" — NULL never appears and COALESCE would wipe the base.
UPDATE "packages" SET "content" = "contentTr", "contentTr" = "content"
  WHERE array_length("contentTr", 1) IS NOT NULL;

COMMIT;
