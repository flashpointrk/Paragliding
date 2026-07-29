import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Seed script.
 *
 * What it creates:
 *  - The admin user (from ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME)
 *  - A WeatherThreshold for the launch site
 *  - Four packages
 *  - Two sample pilots
 *  - ContactSettings (a single row, id="global")
 *  - Seven FAQ entries
 *
 * Idempotent: safe to run repeatedly (upsert).
 *
 * Security: ADMIN_PASSWORD is REQUIRED and must be at least 8 characters. Set a
 * strong one on first install (e.g. `openssl rand -base64 18`). Weak or
 * placeholder passwords are rejected.
 *
 * Note: the coordinates, take-off heading and wind sector are preliminary
 * values; confirm them with the pilot before going live.
 */

const FIXED_ID = {
  gokovaWeatherThreshold: 'hava-esigi-gokova-oren-alatepe',
  globalContactSettings: 'global',
} as const;

const PACKAGE_SLUG = {
  standard: 'standart-tandem',
  group: 'grup-rezervasyonu',
} as const;

const PILOT_KEYS = {
  first: 'pilot-sample-one',
  second: 'pilot-sample-two',
} as const;

// Pilots use slug-like ids rather than cuid, so the ids stay stable.
// Note: @default(cuid()) stays in the schema; the seed supplies fixed ids.
async function upsertAdmin() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@paragliding.local';
  const name = process.env.ADMIN_NAME ?? 'Administrator';

  // Security: the old default password (admin123) is NO LONGER ACCEPTED.
  // ADMIN_PASSWORD must be set, otherwise the seed throws.
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.trim().length < 8) {
    throw new Error(
      'ADMIN_PASSWORD is required and must be at least 8 characters. ' +
        'Set a strong password in your .env, e.g. `openssl rand -base64 18`.'
    );
  }
  // Reject known weak placeholders.
  const weakPasswords = new Set([
    'admin123',
    'replace-me',
    'password',
    '12345678',
    'parola',
  ]);
  if (weakPasswords.has(password.trim().toLowerCase())) {
    throw new Error(
      'ADMIN_PASSWORD is a weak or placeholder value. Set a strong, unique password.'
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: Role.ADMIN,
    },
    create: {
      email,
      name,
      passwordHash,
      role: Role.ADMIN,
    },
  });

   
  console.log(`✔ Admin: ${user.email} (rol: ${user.role})`);
  return user;
}

async function upsertWeatherThreshold() {
  // Preliminary values — to be confirmed with the pilot before launch.
  const threshold = await prisma.weatherThreshold.upsert({
    where: { id: FIXED_ID.gokovaWeatherThreshold },
    update: {
      locationName: 'Gökova Ören Alatepe',
      lat: 37.02,
      lng: 28.27,
      takeoffHeading: 200, // SSW ~ 200°
      windMaxGreen: 18,
      windMaxAmber: 25,
      gustDeltaMaxGreen: 8,
      gustDeltaMaxAmber: 15,
      precipMaxGreen: 0,
      precipMaxAmber: 1,
      visibilityMinGreen: 10,
      visibilityMinAmber: 5,
      // Sample sector — to be confirmed with the pilot.
      windSectorMin: 150,
      windSectorMax: 250,
      active: true,
    },
    create: {
      id: FIXED_ID.gokovaWeatherThreshold,
      locationName: 'Gökova Ören Alatepe',
      lat: 37.02,
      lng: 28.27,
      takeoffHeading: 200,
      windMaxGreen: 18,
      windMaxAmber: 25,
      gustDeltaMaxGreen: 8,
      gustDeltaMaxAmber: 15,
      precipMaxGreen: 0,
      precipMaxAmber: 1,
      visibilityMinGreen: 10,
      visibilityMinAmber: 5,
      windSectorMin: 150,
      windSectorMax: 250,
      active: true,
    },
  });

   
  console.log(`✔ HavaEsigi: ${threshold.locationName}`);
  return threshold;
}

async function upsertPackages() {
  const packages = [
    {
      key: PACKAGE_SLUG.standard,
      name: 'Standard Tandem',
      nameTr: 'Standart Tandem',
      description: 'A standard tandem flight with an experienced pilot.',
      descriptionTr: 'Deneyimli pilot eşliğinde standart tandem uçuşu.',
      content: [
        'Licensed tandem pilot',
        'Basic flight equipment',
        '10–25 min flight window',
        'Take-off and landing area briefing',
      ],
      contentTr: [
        'Lisanslı tandem pilotu',
        'Temel uçuş ekipmanı',
        '10–25 dk uçuş aralığı',
        'Kalkış/iniş alanı bilgilendirmesi',
      ],
      showPrice: false,
      sortOrder: 1,
    },
    {
      key: PACKAGE_SLUG.group,
      name: 'Group Booking',
      nameTr: 'Grup Rezervasyonu',
      description: 'Tailored planning for families and groups.',
      descriptionTr: 'Aile ve gruplar için özel planlama.',
      content: [
        'Dedicated group coordination',
        'Group discount option',
        'Transfer advice',
      ],
      contentTr: [
        'Özel grup koordinasyonu',
        'Grup indirim opsiyonu',
        'Transfer danışmanlığı',
      ],
      showPrice: false,
      sortOrder: 2,
    },
  ];

  for (const p of packages) {
    const created = await prisma.package.upsert({
      where: { id: p.key },
      update: {
        name: p.name,
        nameTr: p.nameTr,
        description: p.description,
        descriptionTr: p.descriptionTr,
        content: p.content,
        contentTr: p.contentTr,
        showPrice: p.showPrice,
        sortOrder: p.sortOrder,
        active: true,
      },
      create: {
        id: p.key,
        name: p.name,
        nameTr: p.nameTr,
        description: p.description,
        descriptionTr: p.descriptionTr,
        content: p.content,
        contentTr: p.contentTr,
        showPrice: p.showPrice,
        sortOrder: p.sortOrder,
        active: true,
      },
    });
     
    console.log(`✔ Paket: ${created.name}`);
  }
}

async function upsertPilots() {
  const pilots = [
    {
      key: PILOT_KEYS.first,
      name: 'Alex Carter',
      specialty: 'Tandem Pilot',
      specialtyTr: 'Tandem Pilotu',
      experienceYears: 12,
      licence: 'EHPU Tandem Licence (sample)',
      licenceTr: 'EHPU Tandem Lisansı (örnek)',
      languages: ['TR', 'EN'],
      bio:
        'Explains every stage of the flight calmly and clearly, and puts guests at ease first.',
      bioTr:
        'Uçuşun her aşamasını sakin ve anlaşılır şekilde anlatır; misafirlerin kendini rahat hissetmesini öncelikler.',
      active: true,
    },
    {
      key: PILOT_KEYS.second,
      name: 'Robin Ellis',
      specialty: 'Tandem Pilot & Instructor',
      specialtyTr: 'Tandem Pilotu & Eğitmen',
      experienceYears: 8,
      licence: 'EHPU Tandem Licence (sample)',
      licenceTr: 'EHPU Tandem Lisansı (örnek)',
      languages: ['TR', 'EN', 'DE'],
      bio:
        'Takes particular care of first-time flyers, building confidence well before take-off.',
      bioTr:
        'İlk kez uçacak misafirlerle özel ilgilienir; güven inşa etmeyi uçuş öncesi başlatır.',
      active: true,
    },
  ];

  for (const p of pilots) {
    const created = await prisma.pilot.upsert({
      where: { id: p.key },
      update: {
        name: p.name,
        specialty: p.specialty,
        specialtyTr: p.specialtyTr,
        experienceYears: p.experienceYears,
        licence: p.licence,
        licenceTr: p.licenceTr,
        languages: p.languages,
        bio: p.bio,
        bioTr: p.bioTr,
        active: p.active,
      },
      create: {
        id: p.key,
        name: p.name,
        specialty: p.specialty,
        specialtyTr: p.specialtyTr,
        experienceYears: p.experienceYears,
        licence: p.licence,
        licenceTr: p.licenceTr,
        languages: p.languages,
        bio: p.bio,
        bioTr: p.bioTr,
        active: p.active,
      },
    });
     
    console.log(`✔ Pilot: ${created.name}`);
  }
}

async function upsertContactSettings() {
  const existing = await prisma.contactSettings.findUnique({
    where: { id: FIXED_ID.globalContactSettings },
  });
  if (existing) {
    console.log(`✔ IletisimAyar korunuyor: ${existing.id}`);
    return existing;
  }

  const contact = await prisma.contactSettings.create({
    data: {
      id: FIXED_ID.globalContactSettings,
      // Contact details are personal data and are not stored in the repo. The seed
      // only opens an empty row — real values come from the environment or are
      // entered through `/admin/settings`. An existing row is never overwritten.
      phone: process.env.NEXT_PUBLIC_PHONE ?? null,
      whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? null,
      email: process.env.NEXT_PUBLIC_EMAIL ?? null,
      address: null,
      openingHours: 'Weekdays 09:00–18:00, weekends 08:00–19:00',
      openingHoursTr: 'Hafta içi 09:00–18:00, hafta sonu 08:00–19:00',
      mapEmbed: '',
      facebook: process.env.NEXT_PUBLIC_FACEBOOK ?? null,
      instagram: process.env.NEXT_PUBLIC_INSTAGRAM ?? null,
      youtube: process.env.NEXT_PUBLIC_YOUTUBE ?? null,
    },
  });

   
  console.log(`✔ IletisimAyar: ${contact.id}`);
}

async function upsertFaq() {
  // FAQ entries — fixed ids keep the ordering idempotent.
  const records = [
    {
      id: 'sss-1',
      question: 'Can I do this if it is my first time?',
      questionTr: 'Yamaş paraşütünü ilk kez yapabilir miyim?',
      answer:
        'Yes. On a tandem flight you fly with an experienced pilot and no previous experience is needed. Before the flight your pilot explains the process and the safety steps.',
      answerTr:
        'Evet. Tandem uçuş, deneyimli bir pilotla birlikte yapılır ve önceden uçuş deneyimi gerektirmez. Uçuş öncesinde süreç ve güvenlik adımları size anlatılır.',
      sortOrder: 1,
    },
    {
      id: 'sss-2',
      question: 'Is flying safe?',
      questionTr: 'Uçuş güvenli mi?',
      answer:
        'Safety depends on suitable weather, well-maintained equipment, a competent pilot and sound operational decisions — all applied together. If conditions are not suitable, the flight is postponed or cancelled. For your personal circumstances, please contact our team.',
      answerTr:
        'Güvenlik; uygun hava koşulları, bakımlı ekipman, yetkin pilot ve doğru operasyon kararlarının birlikte uygulanmasına bağlıdır. Koşullar uygun değilse uçuş ertelenir veya iptal edilir. Kişisel uygunluğunuz için ekibimizle iletişime geçin.',
      sortOrder: 2,
    },
    {
      id: 'sss-3',
      question: 'How long does the flight last?',
      questionTr: 'Uçuş ne kadar sürer?',
      answer:
        'Time in the air varies with the wind and thermal conditions. The durations given on the booking page are planning ranges; allow extra time for the whole activity.',
      answerTr:
        'Havadaki süre rüzgâr ve termik koşullara bağlı olarak değişir. Rezervasyon sayfasında belirtilen süreler planlama amaçlı aralıklardır; toplam aktivite için ek zaman ayırmanızı öneririz.',
      sortOrder: 3,
    },
    {
      id: 'sss-4',
      question: 'What should I wear?',
      questionTr: 'Ne giymeliyim?',
      answer:
        'Comfortable clothes and trainers that cover your feet. Depending on the season, a light jacket, sunglasses and sun protection are useful.',
      answerTr:
        'Rahat kıyafetler ve ayağı saran spor ayakkabı tercih edin. Mevsime göre ince bir üstlük, güneş gözlüğü ve güneş koruyucu da faydalı olabilir.',
      sortOrder: 4,
    },
    {
      id: 'sss-5',
      question: 'What happens if the weather is unsuitable?',
      questionTr: 'Hava kötü olursa ne olur?',
      answer:
        'The final call is made by the pilot on the day of the flight. If conditions are unsuitable, an alternative time or date is offered subject to availability; the terms are set out clearly in the booking agreement.',
      answerTr:
        'Nihai değerlendirme uçuş günü pilot tarafından yapılır. Uygun olmayan koşullarda, müsaitliğe göre alternatif saat veya tarih sunulur; işlem koşulları rezervasyon sözleşmesinde açıkça belirtilir.',
      sortOrder: 5,
    },
    {
      id: 'sss-6',
      question: 'Are photos and videos taken?',
      questionTr: 'Fotoğraf ve video çekiliyor mu?',
      answer:
        'A photo and video option may be available depending on the package. How the footage is delivered, how long it takes and any sharing permissions should be agreed before booking.',
      answerTr:
        'İşletmenin sunduğu pakete göre çekim seçeneği bulunabilir. İçeriğin teslim biçimi, süresi ve paylaşım izinleri rezervasyon öncesinde netleştirilmelidir.',
      sortOrder: 6,
    },
    {
      id: 'sss-7',
      question: 'Are there age, weight or health requirements?',
      questionTr: 'Yaş, kilo veya sağlık koşulları var mı?',
      answer:
        'Operational limits vary with the pilot, the equipment and the weather. Please talk to our team before booking for the current criteria, and consult your doctor if you have any health concerns.',
      answerTr:
        'Operasyonel sınırlar pilot, ekipman ve hava koşullarına göre değişebilir. Güncel uygunluk kriterleri için rezervasyon öncesi ekibimizle görüşün; sağlıkla ilgili tereddütlerde hekiminize danışın.',
      sortOrder: 7,
    },
  ];

  const ids = records.map((k) => k.id);

  await prisma.$transaction(async (tx) => {
    for (const k of records) {
      await tx.faq.upsert({
        where: { id: k.id },
        update: {
          question: k.question,
          questionTr: k.questionTr,
          answer: k.answer,
          answerTr: k.answerTr,
          sortOrder: k.sortOrder,
          active: true,
        },
        create: {
          id: k.id,
          question: k.question,
          questionTr: k.questionTr,
          answer: k.answer,
          answerTr: k.answerTr,
          sortOrder: k.sortOrder,
          active: true,
        },
      });
    }
  });

   
  console.log(`✔ FAQ: ${ids.length} record(s)`);
}

async function main() {
   
  console.log('Seeding…');
  await upsertAdmin();

  const seedSampleContent = process.env.SEED_SAMPLE_DATA === 'true';
  const seedTandemPackages = process.env.SEED_TANDEM_PACKAGES === 'true';
  const seedFaq = process.env.SEED_FAQ === 'true';
  const seedWeatherThreshold = process.env.SEED_WEATHER_THRESHOLD === 'true';

  // The weather module serves nothing without an active threshold. The
  // threshold can be loaded by an explicit production step, independently of
  if (seedSampleContent || seedWeatherThreshold) {
    await upsertWeatherThreshold();
  }

  // the sample content. Packages can likewise be promoted to production on
  // their own, so only the ones actually on sale go live.
  if (seedSampleContent || seedTandemPackages) {
    await upsertPackages();
  }

  // The FAQ text is also independent of the sample pilot/content data, so
  // only the approved information page goes live.
  if (seedSampleContent || seedFaq) {
    await upsertFaq();
  }

  // Sample content is never loaded automatically in production. Real business
  // data comes from the admin panel, or explicitly through SEED_SAMPLE_DATA=true
  // in a local environment.
  if (!seedSampleContent) {
    const added = [
      seedTandemPackages ? 'tandem packages' : null,
      seedFaq ? 'FAQ records' : null,
      seedWeatherThreshold ? 'the weather threshold' : null,
    ].filter(Boolean);

    console.log(
      added.length > 0
        ? `Added ${added.join(' and ')}; the rest of the sample content was skipped.`
        : 'Sample content skipped. Use SEED_SAMPLE_DATA=true for a local demo.'
    );
    return;
  }

  await upsertPilots();
  await upsertContactSettings();
   
  console.log('Seed complete.');
}

main()
  .catch((error) => {
     
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
