/**
 * English copy.
 *
 * Mirrors `tr.ts` key-for-key; a missing key is a TypeScript error.
 * Wording is written for foreign visitors booking a tandem flight —
 * not a literal translation of the Turkish.
 */
import type { tr } from './tr';

export const en: typeof tr = {
  common: {
    submitBooking: 'Book a Flight',
    liveStatus: 'Live Conditions',
    seeDetails: 'See details',
    seeAllPackages: 'See all packages',
    tumSorulariGor: 'See all questions',
    browseGallery: 'Browse the gallery',
    writeToUs: 'Contact Us',
    dahaFazla: 'More',
    back: 'Back',
    forward: 'Next',
    send: 'Send',
    loading: 'Loading…',
    dataUnavailable: 'Data unavailable',
    anaSayfayaDon: 'Back to home',
    writeOnWhatsapp: 'Message us on WhatsApp',
    search: 'Call',
    opsiyonel: 'optional',
    step: 'Step',
    toContinue: 'Fill in the details to continue',
    lastCheck: 'Final check and confirmation',
    honeypot: 'Leave blank',
    menu: 'Menu',
    mobileMainMenu: 'Mobile main menu',
    quickContact: 'Quick contact',
    adviser: 'Contact',
    formSteps: 'Form steps',
    securityCheck: 'Security check (bot protection)',
    packageChoice: 'Package selection',
    noPackages:
      'There are no packages available right now. Please try again later or get in touch with us.',
    start: 'From',
    siteTitle: 'Bodrum Paragliding — Tandem Paragliding',
    siteDescription:
      'Free VIP transfer from Bodrum, launching from Ören/Alatepe for a tandem paragliding flight over the Gulf of Gökova. Experienced pilots, safety first and glittering summer views.',
    ogImageAlt: 'A tandem paragliding flight above Gökova Ören',
    keywords: [
      'Bodrum paragliding',
      'Bodrum tandem paragliding',
      'Gökova paragliding',
      'Ören paragliding',
      'Alatepe paragliding',
      'Muğla paragliding',
      'tandem flight',
      'paragliding Turkey',
      'Gökova tandem flight',
      'paragliding Bodrum',
      'adventure tourism Muğla',
    ],
    pagePath: 'Breadcrumb',
    weather: 'Weather',
    serviceArea: 'Gulf of Gökova, Muğla, Türkiye',
    brandName: 'Bodrum Paragliding',
    lastUpdated: 'Last updated',
  },

  header: {
    home: 'Home',
    about: 'About Us',
    explore: 'Explore',
    packages: 'Packages',
    gallery: 'Gallery',
    contact: 'Contact',
    menuAc: 'Open menu',
    closeMenu: 'Close menu',
    anaMenu: 'Main menu',
    homeLink: 'Gökova Ören Paragliding — Home',
    pickLocale: 'Select language',
    exploreSub: {
      tandemFlight: 'Tandem Flight',
      tandemFlightDescription: 'From take-off to landing with an experienced pilot',
      flightSite: 'Take-off Site',
      takeOffSiteDescription: 'Alatepe / Gökova launch point',
      liveStatus: 'Live Conditions',
      liveStatusDescription: 'Current weather and flight suitability',
      safety: 'Safety',
      safetyDescription: 'Equipment, procedures and insurance',
      faq: 'FAQ',
      faqDescription: 'Frequently asked questions',
    },
    featured: {
      label: 'Ready to fly?',
      title: 'Reserve your place in the Gökova sky',
    },
  },

  footer: {
    description:
      'Free VIP transfer from Bodrum, launching from Ören/Alatepe for a tandem paragliding flight over the Gulf of Gökova. Experienced pilots, safety first and glittering summer views.',
    explore: 'Explore',
    company: 'Company',
    contact: 'Contact',
    socialMedia: 'Social Media',
    tandemFlight: 'Tandem Flight',
    flightSite: 'Take-off Site',
    packagesAndPrices: 'Packages & Prices',
    liveStatus: 'Live Conditions',
    gallery: 'Gallery',
    about: 'About Us',
    safety: 'Safety',
    faq: 'FAQ',
    booking: 'Booking',
    address: 'Alatepe Take-off Site, Gulf of Gökova, Ula/Muğla, Türkiye',
    backedBy: 'Operated by {isletme}',
    allRightsReserved: 'All rights reserved.',
    privacy: 'Privacy',
    termsOfSale: 'Terms of Sale',
    cookiePolicy: 'Cookie Policy',
    exploreSubmenu: 'Footer menu — explore',
    companySubmenu: 'Footer menu — company',
  },

  weather: {
    liveStatus: 'Live Conditions',
    liveDataStream: 'Live data feed',
    dataPending: 'Data feed idle',
    wind: 'Wind',
    details: 'Details',
    hourlyForecast: 'Hourly Forecast',
    readingTime: 'Measured at',
    staleData: '(outdated)',
    pilotApproval: 'No flight takes place without pilot approval',
    feelsLike: 'feels like',
    takeoffHeading: 'Take-off direction',
    direction: 'Direction',
    average: 'Average',
    gust: 'Gusts',
    gustDelta: 'Gust spread',
    suitabilityAssessment: 'Suitability Assessment',
    uvIndex: 'UV Index',
    pressure: 'Pressure',
    humidity: 'Humidity',
    visibility: 'Visibility',
    sunrise: 'Sunrise',
    sunset: 'Sunset',
    dayLength: 'Day length',
    hour: 'Time',
    temperature: 'Temp.',
    precipitation: 'Precip.',
    seeDetails: 'Details',
    assessmentNote: 'This assessment is based on automatic thresholds; it does not account for microclimate or conditions at the take-off site.',
    directionAbbreviation: 'Wind direction abbreviations: N=North, E=East, S=South, W=West. «g» = gusts (km/h).',
    speedUnit: 'km/h',
    uvLow: 'Low',
    uvLowAdvice: 'No protection needed.',
    uvModerate: 'Moderate',
    uvModerateAdvice: 'Sunglasses and a hat recommended.',
    uvHigh: 'High',
    uvHighAdvice: 'SPF 30+ sunscreen, take breaks in the shade.',
    uvVeryHigh: 'Very high',
    uvVeryHighAdvice: 'SPF 50+, avoid the midday hours.',
    uvExtreme: 'Extreme',
    uvExtremeAdvice: 'Avoid being outdoors; full protection essential.',
    pressureSteady: 'Steady/unknown',
    pressureSteadyAlt: 'Steady',
    pressureRising: 'Rising',
    pressureFalling: 'Falling',
    humidityHigh: 'High humidity',
    humidityModerate: 'Moderate humidity',
    humidityLow: 'Low humidity',
    visibilityClear: 'Clear visibility',
    visibilityModerate: 'Moderate visibility',
    visibilityLow: 'Low visibility',
    rozetUygun: 'Suitable for flying',
    rozetDikkat: 'Caution — borderline',
    rozetElverissiz: 'Not suitable — no flying',
    staleBadgeSuffix: 'live data unavailable, the reading shown may be out of date',
    currentDataUnavailable: 'Live data could not be fetched; the reading shown may be out of date.',
    noData: 'Not in the live data.',
    weatherUnavailable: 'Weather data unavailable',
    dataNotAvailable: 'No data available.',
    retry: 'Try again',
    windDirectionLabel: 'Wind direction',
    degrees: 'degrees',
    serverError: 'Server error',
    unknownError: 'Unknown error',
    hourShort: 'h',
    minuteShort: 'min',
    noHourlyData: 'No hourly forecast data available.',
  },
  home: {
    metaTitle: 'From Bodrum to the Sky — Tandem Paragliding',
    metaDescription:
      'Tandem paragliding over the Gulf of Gökova, launching from Ören/Alatepe, with free VIP transfer from Bodrum. Experienced pilots, safety first. Book your flight today.',
    ogDescription:
      'Tandem paragliding over the Gulf of Gökova with free VIP transfer from Bodrum.',
    heroLocation: 'Gökova Ören / Alatepe · Muğla, Türkiye',
    heroTitle: 'Discover the sky above the finest view in Gökova.',
    heroText:
      'Fly tandem with an experienced pilot and enjoy a safe, easy experience from take-off to landing. The view is ours to share — the awe is all yours.',
    heroImageAlt: 'Tandem paraglider flying above the bay and coastline',
    pilotBadge: 'Professional pilot',
    equipmentBadge: 'Certified equipment',
    experienceBadge: 'No experience needed',
    whyUsEyebrow: 'Why us',
    whyUsTitle: 'Why fly with us?',
    whyUsDescription:
      'Our goal is not simply to get you airborne, but to send you off with confidence, calm and a genuine experience.',
    processEyebrow: 'How it works',
    processTitle: 'Your flight, step by step',
    processDescription: 'We are with you from pick-up all the way to landing.',
    packagesTitle: 'Our Tandem Packages',
    packagesDescription:
      'A starting point for different kinds of experience. See the packages page for details and what is included.',
    packagesComingSoon:
      'Packages will be listed shortly. Sample content is shown here while the server data is being prepared.',
    priceNote:
      'Prices are not displayed at the moment. Please contact us for current pricing.',
    galleryTitle: 'From the gallery',
    galleryDescription: 'From take-off to landing, and Ören seen from the air.',
    ctaTitle: 'Reserve your place in the Gökova sky',
    ctaDescription:
      'Book now to fly on a suitable date and in suitable conditions. If the weather does not cooperate, we simply agree on a new date together.',
    ctaSecondary: 'Have questions?',
    whyUs: [
      {
        title: 'Experienced pilots',
        text:
          'Every tandem flight is flown by a licensed pilot with years of experience. Your only job is to enjoy the view.',
      },
      {
        title: 'Safety first',
        text:
          'We check the equipment and assess the weather before every flight. If conditions are not right we postpone — that is a rule, not a compromise.',
      },
      {
        title: 'Memories to keep',
        text:
          'We capture your experience from take-off to landing with photo and video options, so the Gökova view stays with you.',
      },
      {
        title: 'Easy planning',
        text:
          'Book in a few steps, request your transfer, and simply enjoy the day when it comes. We keep the process simple.',
      },
    ],
    experienceFlow: [
      {
        title: 'Free VIP transfer',
        text:
          'We pick you up from your location in Bodrum in a comfortable vehicle at no charge, with soft drinks and sandwiches served on the way.',
      },
      {
        title: 'Welcome and safety briefing',
        text:
          'At the Ören/Alatepe take-off site you meet your pilot and learn what to expect during take-off, flight and landing. What you need to do is short and simple.',
      },
      {
        title: 'Getting ready',
        text:
          'The equipment (suit, helmet, harness) is fitted to you and every connection is checked by your pilot.',
      },
      {
        title: 'Take-off',
        text:
          'You launch together with your pilot after a few running steps. This is usually the most exciting moment.',
      },
      {
        title: 'The flight',
        text:
          'A calm, smooth tandem flight begins over the Gulf of Gökova. Video of your flight is filmed free of charge.',
      },
      {
        title: 'Landing and return to Bodrum',
        text:
          'You land gently near Ören beach, then we drive you back to Bodrum with the free VIP transfer.',
      },
    ],
    includedServices: [
      {
        title: 'Free VIP transfer',
        text: 'Free pick-up and drop-off from your location in Bodrum in a comfortable vehicle.',
      },
      {
        title: 'Refreshments on the way',
        text: 'Soft drinks and sandwiches are served during the transfer, free of charge.',
      },
      {
        title: 'Flight footage',
        text: 'Video of your flight is shared with you free of charge.',
      },
      {
        title: 'Tandem with top pilots',
        text: 'A full safety and equipment briefing before the flight is included.',
      },
    ],
    galleryTiles: [
      { title: 'Aerial route', alt: 'Aerial view of the flight route above Gökova Ören' },
      { title: 'Take-off', alt: 'Pilot and guest launching from the Alatepe take-off site' },
      { title: 'The flight', alt: 'Gökova scenery during a tandem flight' },
      { title: 'Landing', alt: 'A gentle landing on Ören beach' },
    ],
  },

  gallery: {
    metaTitle: 'Gallery',
    metaDescription:
      'Tandem paragliding gallery from Gökova Ören: take-off, in the air, landing and guest shots, organised by category.',
    ogDescription: 'Shots from our tandem paragliding gallery in Gökova Ören.',
    eyebrow: 'Gallery',
    title: 'Gallery',
    introText:
      'From take-off to landing, and Ören seen from the air. Click any shot to view it full screen.',
    category: {
      takeoff: 'Take-off',
      inflight: 'In the air',
      landing: 'Landing',
      guest: 'Guests',
    },
    placeholders: [
      { title: 'Take-off', alt: 'Pilot and guest launching from the Alatepe take-off site' },
      { title: 'Aerial route', alt: 'Aerial view of the route above Gökova Ören' },
      { title: 'The flight', alt: 'Scenery during a tandem flight' },
      { title: 'Landing', alt: 'A gentle landing on Ören beach' },
    ],
    sampleWarning:
      'The photos above are sample images. The gallery will be updated as new material is added. Usage rights for all images are on record.',
    consentNote: 'Usage rights for all images are on record.',
    ctaTitle: 'Become part of these views',
    ctaDescription: 'Book your flight and create your own shots.',
    ctaSecondary: 'Explore the take-off site',
    zoomIn: 'Enlarge',
    lightboxClose: 'Close',
    lightboxPrevious: 'Previous',
    lightboxNext: 'Next',
    lightboxRegion: 'Gallery viewer',
    fallbackAlt: 'Paragliding in Gökova Ören',
    // Infinite scroll states.
    loadingMore: 'Loading more photos…',
    allLoaded: 'All photos loaded.',
    uploadError: 'Something went wrong while loading photos.',
    tryAgain: 'Try again',
    // Small badge on video tiles in the masonry feed.
    videoBadge: 'Video',
  },

  about: {
    metaTitle: 'About Us',
    eyebrow: 'About us',
    title: 'About Us',
    introText:
      'We grew up on the slopes of Ören and Alatepe, above the Gulf of Gökova. Over the years we have learned this wind, its turns and the finest viewpoints here. Our aim is to share that experience with our guests, safely and calmly.',
    storyEyebrow: 'Our story',
    storyTitle: 'We learned the Gökova wind over many years',
    storyP1:
      'Gökova Ören has long been known for conditions well suited to paragliding. Facing the sea, with steady thermals and airflow, the Alatepe slope makes an excellent launch site for tandem flights. We started out to build a natural flying culture here and to get our guests airborne safely.',
    storyP2:
      'We work as a small team, close to the site. That lets us look after every guest personally and adjust the flight plan to the individual.',
    pilotImageAlt: 'Portrait of a pilot at the Alatepe take-off site',
    localSectionTitle: 'Our local ties',
    localSectionText:
      'We work together with local businesses, the municipality and environmental bodies. We plan our flights with respect for the natural balance of the area and take care to keep the take-off and landing sites clean.',
    teamSectionTitle: 'How our team works',
    teamSectionText:
      'Not speed and spectacle, but confidence, calm and a genuine experience. Our pilots are licensed and our equipment is serviced regularly. If conditions are not right we are able to say "let\'s not fly today" — we see that as responsibility, not weakness.',
    ctaTitle: 'Would you like to meet us?',
    ctaDescription:
      'Get in touch to learn more about us or to plan a flight.',
    ctaPrimary: 'Contact Us',
  },

  pilots: {
    metaTitle: 'Our Pilots',
    metaDescription:
      'The licensed pilots who fly our tandem flights in Gökova Ören: their specialities, years of experience and languages.',
    ogDescription: 'The licensed pilots who fly our tandem flights in Gökova Ören.',
    eyebrow: 'Our pilots',
    title: 'Our Pilots',
    introText:
      'Your tandem flight is flown by a licensed, experienced pilot. Every pilot assesses the weather and equipment carefully and takes a calm, safety-first approach in the air.',
    experience: 'Experience',
    year: 'years',
    licence: 'Licence',
    languages: 'Languages',
    listPreparingTitle: 'Pilot list coming soon',
    listPreparingText:
      'The pilot list will be updated shortly. Sample content is shown while the data is being prepared.',
    approachQuote:
      '“Not speed and spectacle, but confidence, calm and a genuine experience. If conditions are not right, we can say ‘let\'s not fly today’.”',
    ctaTitle: 'Would you like to meet our pilots?',
    ctaDescription:
      'Get in touch to plan a flight or to learn more about our team.',
  },

  faq: {
    metaTitle: 'Frequently Asked Questions',
    metaDescription:
      'Common questions about tandem paragliding in Gökova Ören: duration, weight, age, weather, postponement, what to wear, photos and more.',
    ogDescription: 'Common questions and answers about tandem paragliding in Gökova Ören.',
    eyebrow: 'FAQ',
    title: 'Frequently asked questions',
    introText: 'The questions we hear most often about tandem paragliding. If you cannot find your answer here,',
    signInLink: 'get in touch with us',
    emptyTitle: 'FAQ content is being prepared',
    emptyText: 'The FAQ will be published shortly. In the meantime you can ask us directly.',
    emptyAction: 'Ask us directly',
    footnote:
      'These answers are general information. On the day of your flight, your pilot will share the details that apply to the conditions.',
    ctaTitle: 'Did not find your answer?',
    ctaDescription: 'Our team is ready to answer any question. Just get in touch.',
    ctaPrimary: 'Contact Us',
  },
  liveStatus: {
    metaTitle: 'Live Flight Conditions',
    metaDescription:
      'Live weather and tandem flight suitability for Gökova Ören / Alatepe: wind, gusts, precipitation, visibility and the hourly forecast.',
    ogDescription: 'Live weather and flight suitability for Gökova Ören / Alatepe.',
    title: 'Live Flight Conditions',
    ctaTitle: 'Questions about today?',
    ctaDescription:
      'Let us look at the conditions together and decide whether they suit your flight.',
    ctaText: 'Get in touch for live information about the conditions or to book a flight. Our pilots will review the current situation and get back to you.',
    ctaBooking: 'Request a booking',
    ctaWhatsapp: 'Ask on WhatsApp',
    whatsappMessage: 'Hello, I would like information about today’s weather and flying conditions.',
    jsonLdName: 'Live Flight Conditions',
    jsonLdDescription:
      'Live weather and flight suitability for the Gökova Ören (Alatepe) take-off site.',
    sourceNote: 'Data is provided by Open-Meteo and is for information only.',
  },
  safety: {
    metaTitle: 'Safety',
    eyebrow: 'Safety',
    title: 'Safety comes first',
    metaDescription:
      'In tandem paragliding our priority is a safe, well-informed flight. Read about our equipment checks, weather assessment, briefing, postponement policy, emergency procedures and insurance.',
    ogDescription:
      'Safety first in tandem paragliding: equipment, weather, briefing and postponement.',
    heroTitle: 'Our priority: a safe, well-informed flight',
    introText:
      'Paragliding depends on the conditions nature gives us. For us safety starts with the right equipment, a careful weather assessment and clear rules applied on every single flight. This page explains how we put that into practice.',
    sectionTitle: 'How we work with safety',
    sectionDescription:
      'The careful processes we follow at every stage — the basis of the promise we make to our guests.',
    sections: [
      {
        title: 'Equipment checks',
        text:
          'Before every flight the pilot checks all equipment, including the wing, harness, helmet and reserve parachute. Servicing is tracked and only certified components are used.',
      },
      {
        title: 'Weather assessment',
        text:
          'The decision to fly is based on the day’s wind direction and strength, gusts, precipitation and visibility. If conditions exceed our thresholds, we do not fly.',
      },
      {
        title: 'Safety briefing',
        text:
          'Your pilot explains the few simple things you need to do at take-off, during the flight and on landing. If you have questions, this is the moment to ask them.',
      },
      {
        title: 'Postponement',
        text:
          'A flight may be postponed for safety reasons. That is not a problem — it is the rule. If it happens we agree a new date together, at no extra cost.',
      },
      {
        title: 'Emergencies',
        text:
          'Every pilot is trained in emergency procedures and reserve parachute use. Landing options and possible scenarios are assessed before the flight, and communication channels for medical support are in place.',
      },
      {
        title: 'Insurance and permits',
        text:
          'Tandem flights are operated with valid licences and permits. Details of participant insurance and operating permits are shared when your booking is confirmed.',
      },
    ],
    ctaTitle: 'Let your flight be a safe one',
    ctaDescription:
      'If anything about safety is on your mind, just ask. Open communication is part of a safe flight.',
    ctaSecondary: 'Frequently Asked Questions',
  },

  contact: {
    metaTitle: 'Contact',
    metaDescription:
      'Contact us: phone, WhatsApp, e-mail, address and opening hours. Get in touch for bookings and questions.',
    ogDescription: 'Contact details: phone, WhatsApp, e-mail, address.',
    eyebrow: 'Contact',
    title: 'Contact',
    introText:
      'Questions about booking, getting here, transfers or flying conditions? Reach us through any of the channels below.',
    advisers: 'Your contacts',
    details: 'Contact details',
    writeToUsTitle: 'Write to us',
    writeToUsText: 'Fill in the form with your question and our team will get back to you shortly.',
    email: 'E-mail',
    address: 'Address',
    openingHours: 'Opening hours',
    form: {
      labelName: 'Full name',
      emailLabel: 'E-mail',
      subjectLabel: 'Subject',
      messageLabel: 'Your message',
      emailHint: 'you@example.com',
      subjectHint: 'Booking, getting here, flying conditions…',
      messageHint: 'Briefly describe your question...',
      successTitle: 'Message received',
      successText: 'Thank you. We will get back to you as soon as possible.',
      newMessage: 'Send another message',
      submitting: 'Sending…',
      awaitingVerification: 'Waiting for verification…',
      completeVerification: 'Please complete the security check',
      generalError: 'The message could not be sent. Please try again.',
      errorConnection: 'Connection problem. Please check your internet connection and try again.',
      formLabel: 'Contact form',
    },
  },

  packages: {
    metaTitle: 'Packages & Prices',
    metaDescription:
      'Tandem paragliding packages, including free VIP transfer from Bodrum. Different options depending on the experience you want; contact us for prices.',
    ogDescription:
      'Tandem paragliding packages including free VIP transfer from Bodrum. Contact us for prices.',
    eyebrow: 'Packages & Prices',
    title: 'Packages and prices',
    introText:
      'We offer the tandem paragliding experience in a few different forms. The packages below list example contents; what is included and how long you fly can vary. Prices are not shown at the moment — please contact us for current pricing.',
    includedEyebrow: 'Included',
    includedTitle: 'Included in every package',
    includedDescription: 'Whichever package you choose, these come at no extra cost.',
    includedServices: [
      { title: 'Free VIP transfer', text: 'Free pick-up and drop-off from your location in Bodrum in a comfortable vehicle.' },
      { title: 'Refreshments on the way', text: 'Soft drinks and sandwiches are served during the transfer, free of charge.' },
      { title: 'Flight footage', text: 'Video of your flight is shared with you free of charge.' },
      { title: 'Tandem with top pilots', text: 'A full safety and equipment briefing before the flight is included.' },
    ],
    start: 'From:',
    contactForPrice: 'Contact us for pricing',
    forThisPackage: 'Book this package',
    emptyTitle: 'Package list coming soon',
    emptyText:
      'The package list will be updated shortly. Sample content is shown while the data is being prepared. Please contact us for details.',
    notesTitle: 'Important notes',
    notesDescription: 'The key terms to know before booking.',
    notes: [
      { title: 'Tax', text: 'Statutory charges (VAT etc.) are included in our prices. Details are shared when your booking is confirmed.' },
      { title: 'Refunds', text: 'For refund and cancellation terms, see the Terms of Sale and Cancellation page.' },
      { title: 'Postponement', text: 'If the weather is unsuitable the flight is postponed for safety reasons and we agree a new date together, at no extra cost.' },
      { title: 'Guarantees', text: 'All flights depend on the weather; we cannot guarantee flying at a specific time. Safety always comes first.' },
    ],
    ctaTitle: 'Not sure which package suits you?',
    ctaDescription: 'Tell us what you need and we will plan it together.',
    ctaPrimary: 'Contact Us',
  },

  booking: {
    metaTitle: 'Booking — Flight Request',
    metaDescription:
      'Send us your flight request. We will settle the date, time and conditions together. No payment — this is a request only.',
    ogDescription:
      'Send us your paragliding flight request and our team will get back to you shortly.',
    eyebrow: 'Booking',
    title: 'Plan your flight',
    introText:
      'Leave your request and we will settle a suitable time and conditions together. This is a request form — we take no payment here.',
    reasonTitle: 'Why request in advance?',
    reasons: [
      'There are two departures a day: 09.00 and 14.30 (about 4 hours; may change with the weather).',
      'We plan flexible dates around the weather.',
      'Reserve your place without paying and without risk.',
      'Arrange your free VIP transfer from Bodrum and media options in advance.',
    ],
    trustTitle: 'Secure & GDPR/KVKK compliant',
    trustSsl: 'This page is secured with SSL.',
    trustPrivacy: 'Your data is processed in line with our privacy notice.',
    trustUsage: 'Your details are used only for your request.',
    quickTitle: 'In a hurry?',
    quickText: 'If you would rather reach us directly:',
    steps: ['Package', 'Date & Time', 'Passengers', 'Contact', 'Confirm'],
    step1Title: 'Which package would you like?',
    step1Description: 'Choose the package that shapes your experience.',
    step2Title: 'When would you like to fly?',
    step2Description: 'Tell us your preferred date; we stay flexible around the weather.',
    step3Title: 'Passenger details',
    step3Description: 'The weight range matters for flight safety.',
    step4Title: 'Your contact details',
    step4Description: 'We need these to be able to handle your request.',
    step5Title: 'Last step: confirmations',
    step5Description: 'Confirm your details and send your request.',
    date: 'Date',
    dateHint: 'Today or later',
    slotTime: 'Departure',
    slotNote: 'Each departure takes about 4 hours; the exact meeting time is confirmed when we get in touch.',
    morning: 'Morning',
    afternoon: 'Afternoon',
    closed: 'closed',
    guestCount: 'Number of people',
    guestCountHint: '1–10 people. For larger groups, please call us.',
    important: 'Important:',
    importantNote:
      'This is not a flight confirmation. Once we receive your request, our team will contact you based on the weather and availability.',
    weightOptions: [
      'Under 50 kg',
      '50 – 80 kg',
      '80 – 100 kg',
      '100 – 110 kg',
      'Over 110 kg',
    ],
    reachUsOnWhatsapp: 'Message us on WhatsApp →',
    honeypot: 'Website (leave blank)',
    weightRangeLabel: 'Weight range',
    weightSelect: 'Select a weight range',
    weightHint: 'Important for flight safety',
    fullName: 'Full name',
    fullNameHint: 'Your full name',
    phone: 'Phone',
    phoneHint: '+90 5XX XXX XX XX',
    email: 'E-mail',
    emailHint: 'you@example.com',
    localePreference: 'Preferred language',
    localeHint: 'Which language would you like us to use?',
    turkish: 'Turkish',
    english: 'English',
    privacyConsentText: 'Privacy Notice',
    privacyConsentExtra: ' — I have read it and understand how my personal data is processed.',
    explicitConsentBefore: 'I give my',
    explicitConsentHighlight: 'explicit consent',
    explicitConsentAfter: 'for my personal data to be processed in order to create this paragliding request and to contact me.',
    turnstileHint: 'Required to confirm this is not an automated request.',
    consentNote:
      'This is not a flight confirmation. Once we receive your request, our team will settle the date, time and weather conditions with you. The terms of sale are shared when the request is confirmed.',
    submitRequest: 'Send request',
    submitting: 'Sending…',
    awaitingVerification: 'Waiting for verification…',
    completeVerification: 'Please complete the security check',
    successTitle: 'Request received',
    successTextBefore: 'Your request has been saved.',
    successHighlight: 'This is not a flight confirmation.',
    successTextAfter:
      'Our team will contact you shortly to settle the date, time and conditions together.',
    requestNumber: 'Request number',
    newRequest: 'Make another request',
    generalError: 'The request could not be sent. Please try again or reach us on WhatsApp.',
    errorConnection: 'Connection problem. Please check your internet connection and try again.',
    whatsappMessage: 'Hello, I would like information about booking a paragliding flight.',
    slotClosedNotice: 'Today’s departures are closed. The earliest we can take a request for is {tarih}.',
    slotRecordNote: 'Less than {dk} minutes to departure. The departure has been changed to {saat}.',
    dateRecordNote: 'Today’s departures are closed. The date has been changed to {tarih}.',
  },

  tandem: {
    metaTitle: 'Tandem Paragliding Flight',
    metaDescription:
      'Tandem paragliding over the Gulf of Gökova, launching from Ören/Alatepe, with free VIP transfer from Bodrum. Departure times, what is included and everything you need to know.',
    ogDescription:
      'Everything you need to know about a safe tandem flight over the Gulf of Gökova, with free VIP transfer from Bodrum.',
    eyebrow: 'Tandem Flight',
    title: 'What is tandem paragliding?',
    introText:
      'In a tandem flight you fly under the same wing as an experienced pilot. The pilot takes on all the technical responsibility; all you need to do is follow a few simple instructions and enjoy the Gökova view. No previous experience is required.',
    introCopy2:
      'We pick you up from your location in Bodrum with a free VIP transfer, launch from the Ören/Alatepe take-off site, fly over the Gulf of Gökova and bring you back to Bodrum afterwards.',
    includedTitle: 'Included in the price',
    includedDescription: 'What comes with your flight at no extra cost.',
    pendingTitle: 'What to expect',
    pendingDescription:
      'Every moment from take-off to landing is designed to be calm and safe.',
    processTitle: 'Your flight, step by step',
    processDescription:
      'From the welcome to the landing, each stage follows a simple, clear flow.',
    ctaTitle: 'Ready for your first flight?',
    ctaDescription: 'Send a request for the date you have in mind and we will plan it together.',
    ctaSecondary: 'More questions',
    jsonLdName: 'Tandem Paragliding Flight',
    jsonLdDescription:
      'A tandem paragliding experience with a licensed pilot, launching from the Gökova Ören (Alatepe) take-off site.',
    jsonLdFaq: [
      {
        question: 'Who can take a tandem flight?',
        answer:
          'Almost anyone without specific health restrictions and within the recommended weight range (roughly 40–110 kg). See the "Who can fly?" section on this page for details.',
      },
      {
        question: 'How long does a tandem flight last?',
        answer:
          'Roughly 15–30 minutes, depending on the weather and the route. These times are for planning and are confirmed on the day of the flight.',
      },
      {
        question: 'Can I fly if I have no previous experience?',
        answer:
          'Yes. On a tandem flight the pilot handles all the technical work; all you need to do is follow a few simple movements and enjoy the view.',
      },
    ],
    processSteps: [
      { title: 'Welcome and introductions', text: 'You meet your pilot at the agreed meeting point. We briefly go through the plan for the day, the weather and the flight.' },
      { title: 'Safety briefing', text: 'Your pilot explains the few simple things you need to do at take-off, in the air and on landing. If anything worries you, this is the time to say so.' },
      { title: 'Getting the gear ready', text: 'Helmet, suit and harness are adjusted to fit you. Your pilot checks every connection again before the flight.' },
      { title: 'Take-off', text: 'You launch from the Alatepe take-off site with a short run alongside your pilot. It takes only seconds and is easy with the right technique.' },
      { title: 'The flight', text: 'Once airborne, it feels like sitting in a chair. Your pilot handles everything while you enjoy the view.' },
      { title: 'Landing', text: 'You land gently near Ören beach, following your pilot’s last few instructions.' },
    ],
    pendingItems: [
      { title: 'A calm start', text: 'There is nothing to fear; the launch is smooth and controlled, with your pilot guiding you step by step.' },
      { title: 'Open air and views', text: 'You glide above the Gulf of Gökova, its beaches and forested slopes. Photo and video options keep the memory.' },
      { title: 'A soft landing', text: 'You land comfortably near Ören beach under your pilot’s control, and your footage is handed over afterwards.' },
    ],
    includedItems: [
      'A licensed tandem flight with top pilots',
      'All safety equipment (helmet, suit, harness)',
      'Pre-flight safety and equipment briefing',
      'Free VIP transfer from Bodrum (pick-up and return)',
    ],
    whatToBring: [
      'A closed, wind-proof top (a jacket depending on the season)',
      'Trainers with good grip for the take-off run',
      'Sunglasses and a hat (depending on the season)',
      'ID document (to confirm your booking)',
      'Water and a light snack',
    ],
    details: {
      durationTitle: 'Flight duration',
      durationParagraph:
        'A tandem flight lasts roughly 15–30 minutes depending on the weather and route. From welcome to landing, expect to spend 1–2 hours on site, including transfer, briefing and preparation.',
      durationNote: 'These times are for planning; they are confirmed on the day by your pilot and the conditions.',
      whoTitle: 'Who can fly?',
      whoList: [
        'Recommended weight range is roughly 40–110 kg (assessed with your pilot).',
        'Participants under 18 need parental consent.',
        'Not suitable for pregnant participants.',
        'Please tell us in advance about heart, neck/back problems or limited mobility.',
      ],
      whoNote: 'Weight and age figures are for planning; individual cases are assessed together with your pilot.',
      includedTitle: 'What is included?',
      includedNote: 'Photo and video options vary by package; see the packages page for details.',
      buildTitle: 'What should I bring?',
      routeTitle: 'The route',
      routeList: [
        'Free VIP transfer pick-up in Bodrum',
        'Transfer to the Ören / Alatepe take-off site',
        'Tandem flight over the Gulf of Gökova',
        'Comfortable return to Bodrum',
      ],
      scheduleTitle: 'Schedule and departure times',
      scheduleParagraph:
        'Departures start every day at 09.00 in the morning and 14.30 in the afternoon; each one takes about 4 hours including transfer, preparation and the flight.',
      scheduleNote: 'Times may change with the weather; the exact meeting time is confirmed with you when you book.',
    },
    postponementTitle: 'What if the flight is postponed?',
    postponementText: 'If the weather is unsuitable, the flight is postponed for safety reasons and we agree a new date together. For details, see',
    postponementAnd: 'and',
    postponementAfter: '.',
  },

  flightSite: {
    metaTitle: 'Gökova Ören / Alatepe Paragliding Take-off Site',
    metaDescription:
      'The Gökova Ören (Alatepe) paragliding take-off site: location, coordinates, season, hours, access and transfer information. In Ula, Muğla, with tandem routes over the Gulf of Gökova.',
    ogDescription:
      'Location, season, hours and access for our tandem paragliding take-off site overlooking the Gulf of Gökova.',
    eyebrow: 'Take-off site',
    title: 'The Gökova Ören / Alatepe paragliding take-off site',
    introText:
      'The Alatepe take-off site sits on the slopes overlooking the Gulf of Gökova, in the Ula district of Muğla, and is used for tandem flights above Gökova Ören. Gliding from the hilltop down towards the sea, the route offers a remarkable view for seasoned eyes and first-time flyers alike.',
    takeoffTitle: 'Take-off point',
    takeoffText:
      'Take-off happens on the Alatepe slope, from the spot chosen for the wind direction of the day. Your pilot selects the most suitable launch point for the conditions, and shares altitude and wind details in the pre-flight briefing.',
    location: 'Location:',
    coordinate: 'Coordinates (approx.):',
    coordinateNote: 'Coordinates are for planning; they will be confirmed with the pilot before launch.',
    landingTitle: 'Landing area',
    landingText:
      'Landings are usually made on the wide, flat area near Ören beach. It is suitable for a safe landing and gives friends and family a comfortable place to watch from.',
    seasonInfo: [
      { title: 'Season', text: 'The flying season usually runs from April to October, when conditions suit tandem flights best. Outside the season we can still fly after assessing the weather.' },
      { title: 'Hours', text: 'Actual flying times are set by the weather assessment on the day; morning and afternoon windows are preferred.' },
      { title: 'Access / Transfer', text: 'Transfer is included in certain packages. If you drive yourself, access is via Ören/Akyaka; detailed directions are shared when your booking is confirmed.' },
    ],
    weatherTitle: 'Weather at this location',
    weatherDescription:
      'Until live weather and flight suitability are integrated for this area, please contact us for information.',
    tileNote:
      'Usage rights for all images are on record; further shots will be added as they are completed.',
    tileAlt: [
      'The view from the Alatepe take-off site',
      'Gökova Ören and the gulf from the air',
      'The tandem flight experience',
      'Landing on Ören beach',
    ],
    touristType: 'Adventure tourism, air sports',
    tileTitle: 'Photos from the site',
    tileDescription: 'From the Alatepe launch to the landing at Ören beach — the skies of this region.',
    nearbyTitle: 'Nearby places to visit',
    nearbyDescription: 'Alongside your flight, there is plenty to discover in the area.',
    nearbyPlaces: [
      { title: 'Ören Beach', text: 'A quiet beach near the landing area, known for its long sand and shallow water. Ideal for relaxing after your flight.' },
      { title: 'Gulf of Gökova', text: 'One of the most beautiful bays in Türkiye, popular for boat trips, kayaking and water sports.' },
      { title: 'Akyaka', text: 'A coastal town famous for its natural beauty and fish restaurants.' },
      { title: 'Cedar Island (Cleopatra Beach)', text: 'The famous beach where, according to legend, sand was brought for Cleopatra. Reached by boat trip.' },
    ],
    ctaTitle: 'Come and see this view',
    ctaDescription: 'Book your flight over Gökova Ören / Alatepe.',
    ctaSecondary: 'Contact us about access and transfer',
  },

};
