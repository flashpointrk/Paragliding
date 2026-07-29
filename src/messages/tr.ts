/**
 * Turkish copy (the source language).
 *
 * Structure: each surface has its own namespace. `en.ts` implements exactly the
 * same shape, so a missing key is a TypeScript error.
 */
export const tr = {
  common: {
    submitBooking: 'Rezervasyon Yap',
    liveStatus: 'Canlı Durum',
    seeDetails: 'Detayları gör',
    seeAllPackages: 'Tüm paketleri gör',
    tumSorulariGor: 'Tüm soruları gör',
    browseGallery: 'Galeriyi gez',
    writeToUs: 'Bize Yazın',
    dahaFazla: 'Daha fazla',
    back: 'Geri',
    forward: 'İleri',
    send: 'Gönder',
    loading: 'Yükleniyor…',
    dataUnavailable: 'Veri alınamadı',
    anaSayfayaDon: 'Anasayfaya dön',
    writeOnWhatsapp: "WhatsApp'tan yazın",
    search: 'Ara',
    opsiyonel: 'opsiyonel',
    step: 'Adım',
    toContinue: 'Devam etmek için bilgileri doldurun',
    lastCheck: 'Son kontrol ve onay',
    honeypot: 'Boş bırakın',
    menu: 'Menü',
    mobileMainMenu: 'Mobil ana menü',
    quickContact: 'Hızlı iletişim',
    adviser: 'Danışman',
    formSteps: 'Form adımları',
    securityCheck: 'Güvenlik doğrulaması (bot koruması)',
    packageChoice: 'Paket seçimi',
    noPackages:
      'Şu anda seçilebilir paket bulunmuyor. Lütfen daha sonra tekrar deneyin veya bizimle iletişime geçin.',
    start: 'Başlangıç',
    siteTitle: 'Bodrum Yamaç Paraşütü — Tandem Yamaç Paraşütü',
    siteDescription:
      'Bodrum’dan ücretsiz VIP transfer, Ören/Alatepe kalkışıyla Gökova Körfezi üzerinde tandem yamaç paraşütü. Deneyimli pilotlar, güvenlik önceliği ve ışıltılı yaz manzaraları.',
    ogImageAlt: 'Gökova Ören üzerinde tandem yamaç paraşütü uçuşu',
    keywords: [
      'Bodrum yamaç paraşütü',
      'Bodrum tandem paraşüt',
      'Gökova yamaç paraşütü',
      'Ören yamaç paraşütü',
      'Alatepe yamaç paraşütü',
      'Muğla yamaç paraşütü',
      'tandem uçuş',
      'paragliding',
      'Gökova paraşüt',
      'tandem paraşüt',
      'macera turizmi Muğla',
    ],
    pagePath: 'Sayfa yolu',
    weather: 'Hava durumu',
    serviceArea: 'Gökova Körfezi, Muğla, Türkiye',
    brandName: 'Bodrum Yamaç Paraşütü',
    lastUpdated: 'Son güncelleme',
  },

  header: {
    home: 'Anasayfa',
    about: 'Hakkımızda',
    explore: 'Keşfet',
    packages: 'Paketler',
    gallery: 'Galeri',
    contact: 'İletişim',
    menuAc: 'Menüyü aç',
    closeMenu: 'Menüyü kapat',
    anaMenu: 'Ana menü',
    homeLink: 'Gökova Ören Yamaç Paraşütü — Ana sayfa',
    pickLocale: 'Dil seçin',
    exploreSub: {
      tandemFlight: 'Tandem Uçuş',
      tandemFlightDescription: 'Deneyimli pilotla kalkıştan inişe deneyim',
      flightSite: 'Uçuş Noktası',
      takeOffSiteDescription: 'Alatepe / Gökova kalkış noktası',
      liveStatus: 'Canlı Durum',
      liveStatusDescription: 'Güncel hava ve uçuş uygunluğu',
      safety: 'Güvenlik',
      safetyDescription: 'Ekipman, prosedür ve sigorta',
      faq: 'S.S.S.',
      faqDescription: 'Sık sorulan sorular',
    },
    featured: {
      label: 'Hazır mısınız?',
      title: 'Gökova gökyüzünde yerinizi ayırtın',
    },
  },

  footer: {
    description:
      'Bodrum’dan ücretsiz VIP transfer, Ören/Alatepe kalkışıyla Gökova Körfezi üzerinde tandem yamaç paraşütü. Deneyimli pilotlar, güvenlik önceliği ve ışıltılı yaz manzaraları.',
    explore: 'Keşfet',
    company: 'Kurumsal',
    contact: 'İletişim',
    socialMedia: 'Sosyal Medya',
    tandemFlight: 'Tandem Uçuş',
    flightSite: 'Uçuş Noktası',
    packagesAndPrices: 'Paketler ve Fiyatlar',
    liveStatus: 'Canlı Durum',
    gallery: 'Galeri',
    about: 'Hakkımızda',
    safety: 'Güvenlik',
    faq: 'S.S.S.',
    booking: 'Booking',
    address: 'Alatepe Kalkış Noktası, Gökova Körfezi, Ula/Muğla',
    backedBy: '{isletme} güvencesiyle',
    allRightsReserved: 'Tüm hakları saklıdır.',
    privacy: 'Gizlilik',
    termsOfSale: 'Mesafeli Satış',
    cookiePolicy: 'Çerez Politikası',
    exploreSubmenu: 'Alt menü — keşfet',
    companySubmenu: 'Alt menü — kurumsal',
  },

  weather: {
    liveStatus: 'Canlı Durum',
    liveDataStream: 'Canlı veri akışı',
    dataPending: 'Veri akışı beklemede',
    wind: 'Rüzgâr',
    details: 'Detaylar',
    hourlyForecast: 'Saatlik Tahmin',
    readingTime: 'Ölçüm saati',
    staleData: '(eski veri)',
    pilotApproval: 'Pilot onayı olmadan uçuş yapılmaz',
    feelsLike: 'hissedilen',
    takeoffHeading: 'Kalkış yönü',
    direction: 'Yön',
    average: 'Ortalama',
    gust: 'Gust',
    gustDelta: 'Gust farkı',
    suitabilityAssessment: 'Uygunluk Değerlendirmesi',
    uvIndex: 'UV İndeks',
    pressure: 'Basınç',
    humidity: 'Nem',
    visibility: 'Görüş',
    sunrise: 'Gün doğumu',
    sunset: 'Gün batımı',
    dayLength: 'Gün uzunluğu',
    hour: 'Saat',
    temperature: 'Sıcaklık',
    precipitation: 'Yağış',
    seeDetails: 'Detaylar',
    assessmentNote: 'Bu değerlendirme otomatik eşiklere dayanır; mikroklima ve kalkış alanı koşullarını içermez.',
    directionAbbreviation: 'Rüzgâr yönü kısaltmaları: K=Kuzey, D=Doğu, G=Güney, B=Batı. «g» = gust (km/s).',
    speedUnit: 'km/s',
    uvLow: 'Düşük',
    uvLowAdvice: 'Korunma gerektirmez.',
    uvModerate: 'Orta',
    uvModerateAdvice: 'Güneş gözlüğü, şapka önerilir.',
    uvHigh: 'Yüksek',
    uvHighAdvice: 'SPF 30+ güneş kremi, gölge aralıkları.',
    uvVeryHigh: 'Çok yüksek',
    uvVeryHighAdvice: 'SPF 50+, öğle saatlerinden uzak durun.',
    uvExtreme: 'Aşırı',
    uvExtremeAdvice: 'Açıkta kalınmamalı; tam koruma şart.',
    pressureSteady: 'Sabit/bilinmiyor',
    pressureSteadyAlt: 'Sabit',
    pressureRising: 'Yükseliyor',
    pressureFalling: 'Düşüyor',
    humidityHigh: 'Yüksek nem',
    humidityModerate: 'Orta nem',
    humidityLow: 'Düşük nem',
    visibilityClear: 'Açık görüş',
    visibilityModerate: 'Orta görüş',
    visibilityLow: 'Düşük görüş',
    rozetUygun: 'Uçuşa uygun',
    rozetDikkat: 'Dikkat — sınırda',
    rozetElverissiz: 'Elverişsiz — uçuş yasak',
    staleBadgeSuffix: 'güncel veri alınamadı, gösterilen veri eski olabilir',
    currentDataUnavailable: 'Güncel veri alınamadı, gösterilen veri eski olabilir.',
    noData: 'Anlık veride yok.',
    weatherUnavailable: 'Hava verisi alınamadı',
    dataNotAvailable: 'Veri mevcut değil.',
    retry: 'Tekrar Dene',
    windDirectionLabel: 'Rüzgâr yönü',
    degrees: 'derece',
    serverError: 'Sunucu hatası',
    unknownError: 'Bilinmeyen hata',
    hourShort: 'sa',
    minuteShort: 'dk',
    noHourlyData: 'Saatlik tahmin verisi mevcut değil.',
  },
  home: {
    metaTitle: "Bodrum'dan Gökyüzüne — Tandem Yamaç Paraşütü",
    metaDescription:
      "Bodrum'dan ücretsiz VIP transfer, Ören/Alatepe kalkışıyla Gökova Körfezi üzerinde tandem yamaç paraşütü deneyimi. Deneyimli pilotlar, güvenlik önceliği. Rezervasyonunuzu hemen yapın.",
    ogDescription:
      "Bodrum'dan ücretsiz VIP transfer, Gökova Körfezi manzarasında tandem yamaç paraşütü deneyimi.",
    heroLocation: 'Gökova Ören / Alatepe · Muğla',
    heroTitle: "Gökyüzünü Gökova'nın en güzel manzarasında keşfedin.",
    heroText:
      'Tandem yamaç paraşütü ile deneyimli bir pilot eşliğinde kalkıştan inişe kadar güvenli ve keyifli bir uçuş deneyimi yaşayın. Manzara bize ait, hayranlık sizin.',
    heroImageAlt: 'Koy ve sahil manzarası üzerinde tandem yamaç paraşütü uçuşu',
    pilotBadge: 'Profesyonel pilot',
    equipmentBadge: 'Onaylı ekipman',
    experienceBadge: 'Önceden deneyim gerekmez',
    whyUsEyebrow: 'Neden biz',
    whyUsTitle: 'Neden bizimle uçmalısınız?',
    whyUsDescription:
      'Amacımız sizi sadece havalandırmak değil; güven, sakinlik ve gerçek bir deneyimle uğurlamak.',
    processEyebrow: 'Süreç',
    processTitle: 'Uçuş deneyimi akışı',
    processDescription: 'Karşılamadan inişe kadar süreç boyunca yanınızdayız.',
    packagesTitle: 'Tandem Paketlerimiz',
    packagesDescription:
      'Farklı deneyim seçenekleri için bir başlangıç. Detaylar ve dahil olanlar için paketler sayfasına bakın.',
    packagesComingSoon:
      'Paketler yakında listelenecek. Bu alanda örnek içerik görüntülenirken sunucu verisi hazır hale getiriliyor.',
    priceNote:
      'Fiyat gösterimi şu an kapalıdır. Güncel bilgi için bizimle iletişime geçin.',
    galleryTitle: 'Galeriden kareler',
    galleryDescription: "Kalkıştan inişe, havadan Ören'in manzarasına.",
    ctaTitle: 'Gökova gökyüzünde yerinizi ayırtın',
    ctaDescription:
      'Uygun tarih ve koşullarda uçmak için şimdiden rezervasyon yapın. Koşullar uygun olmadığında birlikte yeni bir tarih belirleriz.',
    ctaSecondary: 'Sorularınız mı var?',
    whyUs: [
      {
        title: 'Deneyimli pilotlar',
        text:
          'Tandem uçuşlarını lisanslı, yılların deneyimine sahip pilotlarımız gerçekleştirir. Sizin tek göreviniz manzaranın tadını çıkarmak.',
      },
      {
        title: 'Güvenlik önceliği',
        text:
          'Her uçuş öncesi ekipman kontrolü ve hava değerlendirmesi yaparız. Koşullar uygun değilse uçuşu erteleriz; bu bir taviz değil, kuralımızdır.',
      },
      {
        title: 'Size özel anılar',
        text:
          'Kalkıştan inişe kadar geçen deneyiminizi fotoğraf ve video seçenekleriyle kaydeder, Gökova manzarasıyla birlikte hatıra haline getiririz.',
      },
      {
        title: 'Kolay planlama',
        text:
          'Rezervasyonunuzu kolayca yapın, transfer talep edin, günü geldiğinde keyfinize bakın. Süreci sizin için sadeleştiririz.',
      },
    ],
    experienceFlow: [
      {
        title: 'Ücretsiz VIP transfer',
        text:
          "Bodrum'da bulunduğunuz konumdan lüks bir araçla ücretsiz alınırsınız; yolculuk boyunca soft içecek ve sandviç ikramı sunulur.",
      },
      {
        title: 'Karşılama ve güvenlik bilgilendirmesi',
        text:
          'Ören/Alatepe kalkış noktasında pilotunuzla tanışır, kalkış-uçuş-iniş için bilmeniz gerekenleri öğrenirsiniz. Takip etmeniz gereken hareketler kısa ve basittir.',
      },
      {
        title: 'Hazırlık',
        text:
          'Ekipmanlar (küvör, kask, harness) size uygun şekilde ayarlanır ve tüm bağlantılar pilot tarafından kontrol edilir.',
      },
      {
        title: 'Kalkış',
        text:
          'Alatepe kalkış noktasında pilotunuzla birlikte birkaç adımlık koşuyla havalandırız. Bu an genelde en heyecanlı kısımdır.',
      },
      {
        title: 'Uçuş',
        text:
          'Gökova Körfezi üzerinde sakin ve akıcı bir tandem uçuş başlar. Uçuş anınızın kamera çekimleri ücretsiz olarak yapılır.',
      },
      {
        title: "İniş ve Bodrum'a dönüş",
        text:
          "Ören plajı civarında yumuşak bir iniş yapılır; ardından ücretsiz VIP transferle Bodrum'a bırakılırsınız.",
      },
    ],
    includedServices: [
      {
        title: 'Ücretsiz VIP transfer',
        text: "Bodrum'da bulunduğunuz yerden lüks araçlarla ücretsiz alım ve dönüş.",
      },
      {
        title: 'Yolculuk ikramları',
        text: 'Transfer sırasında soft içecek ve sandviç ikramı ücretsizdir.',
      },
      {
        title: 'Kamera çekimleri',
        text: 'Uçuş anınızın kamera çekimleri ücretsiz olarak sizinle paylaşılır.',
      },
      {
        title: 'En iyi pilotlarla tandem',
        text: 'Uçuş öncesi tüm güvenlik ve ekipman bilgilendirmesi dahildir.',
      },
    ],
    galleryTiles: [
      { title: 'Havadan rota', alt: 'Gökova Ören üstünde havadan uçuş rotası manzarası' },
      { title: 'Kalkış', alt: 'Alatepe kalkış noktasından pilot ve misafirin kalkış anı' },
      { title: 'Uçuş deneyimi', alt: 'Tandem uçuş deneyimi sırasında Gökova manzarası' },
      { title: 'İniş', alt: 'Ören plajına yumuşak iniş anı' },
    ],
  },

  gallery: {
    metaTitle: 'Galeri',
    metaDescription:
      'Gökova Ören tandem yamaç paraşütü galerisi: kalkış, havada, iniş ve misafir kareleri. Kategoriye göre düzenlenmiş görseller.',
    ogDescription: 'Gökova Ören tandem yamaç paraşütü galerisinden kareler.',
    eyebrow: 'Galeri',
    title: 'Galeri',
    introText:
      "Kalkıştan inişe, havadan Ören'in manzarasına. Bir kareye tıklayarak tam ekran görüntüleyebilirsiniz.",
    category: {
      takeoff: 'Kalkış',
      inflight: 'Havada',
      landing: 'İniş',
      guest: 'Misafir',
    },
    placeholders: [
      { title: 'Kalkış', alt: 'Alatepe kalkış noktasından pilot ve misafirin kalkış anı' },
      { title: 'Havadan rota', alt: 'Gökova Ören üstünde havadan rota manzarası' },
      { title: 'Uçuş deneyimi', alt: 'Tandem uçuş deneyimi sırasında manzara' },
      { title: 'İniş', alt: 'Ören plajına yumuşak iniş anı' },
    ],
    sampleWarning:
      'Yukarıdaki görseller örnek/yaklaşık içeriklerdir. Galeri tamamlandıkça güncellenecektir. Tüm görseller için kullanım izinleri kayıt altındadır.',
    consentNote: 'Tüm görseller için kullanım izinleri kayıt altındadır.',
    ctaTitle: 'Bu manzaraların bir parçası olun',
    ctaDescription: 'Kendi uçuş karelerinizi oluşturmak için rezervasyonunuzu yapın.',
    ctaSecondary: 'Uçuş Noktasını Keşfet',
    zoomIn: 'Büyüt',
    lightboxClose: 'Kapat',
    lightboxPrevious: 'Önceki',
    lightboxNext: 'Sonraki',
    lightboxRegion: 'Galeri görüntüleyici',
    fallbackAlt: 'Gökova Ören yamaç paraşütü',
    // Infinite-scroll states.
    loadingMore: 'Daha fazla görsel yükleniyor…',
    allLoaded: 'Tüm görseller yüklendi.',
    uploadError: 'Görseller yüklenirken bir sorun oluştu.',
    tryAgain: 'Yeniden dene',
    // Small badge for video frames in the masonry feed.
    videoBadge: 'Video',
  },

  about: {
    metaTitle: 'Hakkımızda',
    eyebrow: 'Hakkımızda',
    title: 'Hakkımızda',
    introText:
      'Gökova Körfezi’nin üstünde, Ören ve Alatepe’nin yamaçlarında doğduk/büyüdük. Buradaki rüzgarı, dönüşleri ve en güzel manzara noktalarını yıllar içinde öğrendik. Amacımız, bu deneyimi misafirlerimizle güvenli ve sakin bir biçimde paylaşmak.',
    storyEyebrow: 'İşletme hikâyesi',
    storyTitle: 'Gökova rüzgarını yıllar içinde öğrendik',
    storyP1:
      'Gökova Ören, yıllardır yamaç paraşütü için elverişli koşullarıyla bilinen bir bölgedir. Alatepe yamacı, denize bakan konumu ve istikrarlı termik/hava akımlarıyla tandem uçuşu için uygun bir kalkış noktası sunar. İşletmemiz, bu bölgede doğal bir uçuş kültürü oluşturmak ve misafirleri güvenli biçimde havalandırmak amacıyla yola çıktı.',
    storyP2:
      'Küçük, sahaya yakın bir ekiple çalışıyoruz. Bu, her misafirle birebir ilgilenebilmemizi ve uçuş planını kişiye göre ayarlayabilmemizi sağlıyor.',
    pilotImageAlt: 'Alatepe kalkış noktasında pilot portresi',
    localSectionTitle: 'Yerel bağımız',
    localSectionText:
      'Bölgedeki işletmelerle, yerel yönetimle ve çevre kurumlarıyla iş birliği içindeyiz. Uçuşlarımızı bölgenin doğal dengesine saygıyı gözeterek planlıyoruz; iniş ve kalkış alanlarını temiz tutmaya özen gösteriyoruz.',
    teamSectionTitle: 'Ekibimizin yaklaşımı',
    teamSectionText:
      'Hız ve abartı değil; güven, sakinlik ve gerçek bir deneyim esasımız. Pilotlarımız lisanslı, ekipmanlarımız periyodik bakımlı. Koşullar uygun değilse "bugün uçmayalım" diyebiliyoruz; bu tavrı bir güç değil, sorumluluk olarak görüyoruz.',
    ctaTitle: 'Tanışmak ister misiniz?',
    ctaDescription:
      'İşletmemizi daha yakından tanımak veya bir uçuş planlamak için bizimle iletişime geçin.',
    ctaPrimary: 'İletişime Geç',
  },

  pilots: {
    metaTitle: 'Pilotlarımız',
    metaDescription:
      'Gökova Ören tandem uçuşlarında görev yapan lisanslı pilotlarımız. Uzmanlık alanları, deneyim yılları ve diller hakkında bilgi.',
    ogDescription: 'Gökova Ören tandem uçuşlarında görev yapan lisanslı pilotlarımız.',
    eyebrow: 'Pilotlarımız',
    title: 'Pilotlarımız',
    introText:
      'Tandem uçuşlarınızı, lisanslı ve deneyimli pilotlarımız gerçekleştirir. Her pilot, hava ve ekipman değerlendirmesini titizlikle yapar; uçuş sırasında güvenliği önceleyen sakin bir yaklaşım benimser.',
    experience: 'Deneyim',
    year: 'yıl',
    licence: 'Lisans',
    languages: 'Diller',
    listPreparingTitle: 'Pilot listesi hazırlanıyor',
    listPreparingText:
      'Pilot listesi yakında güncellenecek. Şu an örnek içerik görüntülenirken veri hazırlanıyor.',
    approachQuote:
      '“Hız ve abartı değil; güven, sakinlik ve gerçek bir deneyim esasımız. Koşullar uygun değilse ‘bugün uçmayalım’ diyebiliyoruz.”',
    ctaTitle: 'Pilotlarımızla tanışmak ister misiniz?',
    ctaDescription:
      'Bir uçuş planlamak veya ekibimiz hakkında daha fazla bilgi almak için bizimle iletişime geçin.',
  },

  faq: {
    metaTitle: 'Sık Sorulan Sorular',
    metaDescription:
      'Gökova Ören tandem yamaç paraşütü hakkında sık sorulan sorular: süre, kilo, yaş, hava, erteleme, giyim, fotoğraf ve daha fazlası.',
    ogDescription:
      'Gökova Ören tandem yamaç paraşütü hakkında sık sorulan sorular ve yanıtları.',
    eyebrow: 'Sık Sorulan Sorular',
    title: 'Sık sorulan sorular',
    introText: 'Tandem yamaç paraşütü ile ilgili en çok merak edilenler. Cevabını bulamadığınız bir sorunuz varsa',
    signInLink: 'bizimle iletişime geçin',
    emptyTitle: 'SSS içeriği hazırlanıyor',
    emptyText: 'SSS içeriği yakında eklenecek. Sorularınızı doğrudan bize iletebilirsiniz.',
    emptyAction: 'Bize İletebilirsiniz',
    footnote:
      'Buradaki yanıtlar genel bilgilendirme amaçlıdır. Uçuş günü koşullara göre ayrıntılar pilot tarafından paylaşılır.',
    ctaTitle: 'Cevabını bulamadınız mı?',
    ctaDescription: 'Ekibimiz tüm sorularınızı yanıtlamak için hazır. Bizimle iletişime geçin.',
    ctaPrimary: 'İletişime Geç',
  },
  liveStatus: {
    metaTitle: 'Canlı Uçuş Durumu',
    metaDescription:
      'Gökova Ören / Alatepe için canlı hava durumu ve tandem uçuş uygunluğu: rüzgâr, gust, yağış, görüş ve saatlik tahmin.',
    ogDescription: 'Gökova Ören / Alatepe canlı hava ve uçuş uygunluğu.',
    title: 'Canlı Uçuş Durumu',
    ctaTitle: 'Bugün İçin Soru mu Var?',
    ctaDescription:
      'Koşulların uçuşunuz için uygun olup olmadığını birlikte değerlendirelim.',
    ctaText: 'Hava koşulları hakkında canlı bilgi veya rezervasyon için bizimle iletişime geçin. Pilotlarımız güncel durumu değerlendirip dönüş yapacaktır.',
    ctaBooking: 'Rezervasyon Talebi Oluştur',
    ctaWhatsapp: "WhatsApp'tan Sor",
    whatsappMessage: 'Merhaba, bugünkü hava ve uçuş durumu hakkında bilgi almak istiyorum.',
    jsonLdName: 'Canlı Uçuş Durumu',
    jsonLdDescription:
      'Gökova Ören (Alatepe) kalkış noktası için canlı hava ve uçuş uygunluk durumu.',
    sourceNote: 'Veriler Open-Meteo sağlayıcısından alınır ve bilgilendirme amaçlıdır.',
  },
  safety: {
    metaTitle: 'Güvenlik',
    eyebrow: 'Güvenlik',
    title: 'Güvenlik önceliğimiz',
    metaDescription:
      'Tandem yamaç paraşütünde önceliğimiz güvenli ve bilinçli bir uçuş deneyimidir. Ekipman kontrolü, hava değerlendirmesi, brifing, erteleme, acil durum ve sigorta/izin süreçleri hakkında bilgi.',
    ogDescription:
      'Tandem yamaç paraşütünde güvenlik önceliği: ekipman, hava, brifing ve erteleme süreçleri.',
    heroTitle: 'Önceliğimiz: güvenli ve bilinçli bir uçuş deneyimi',
    introText:
      'Yamaç paraşütü, doğanın koşullarına bağlı bir etkinliktir. Bizim için güven; doğru ekipman, dikkatli hava değerlendirmesi ve her uçuşta uygulanan net kurallarla başlar. Bu sayfada, bu yaklaşımı nasıl hayata geçirdiğimizi paylaşıyoruz.',
    sectionTitle: 'Güvenlik uygulamalarımız',
    sectionDescription:
      'Her aşamada uyguladığımız titiz süreçler; bu, misafirlerimize verdiğimiz sözün temelidir.',
    sections: [
      {
        title: 'Ekipman kontrolü',
        text:
          'Her uçuş öncesi kanat, harness, kask ve yedek paraşüt dahil tüm ekipman pilot tarafından kontrol edilir. Periyodik bakımları takip edilen ekipmanlar, yalnızca uygun sertifikaya sahip parçalardan oluşur.',
      },
      {
        title: 'Hava değerlendirmesi',
        text:
          'Uçuş kararı, günün rüzgar yön/şiddeti, gust (ani rüzgar), yağış ve görüş değerlerine göre verilir. Koşullar eşik değerlerimizi aşarsa uçuş yapılmaz.',
      },
      {
        title: 'Bilgilendirme (brifing)',
        text:
          'Kalkış, uçuş ve inişte yapmanız gereken birkaç basit hareket pilot tarafından anlatılır. Sorularınız varsa, bu aşamada sormaktan çekinmeyin.',
      },
      {
        title: 'Erteleme',
        text:
          'Güvenlik nedeniyle uçuş ertelenebilir. Bu bir sorun değil, kuraldır. Erteleme durumunda birlikte yeni bir tarih belirleriz; ek ücret doğurmaz.',
      },
      {
        title: 'Acil durum',
        text:
          'Her pilot, acil durum prosedürleri ve yedek paraşüt kullanımı konusunda eğitimlidir. İniş alanı seçimi ve olası senaryolar uçuş öncesi değerlendirilir. Tıbbi destek için saha ile iletişim kanalları hazırdır.',
      },
      {
        title: 'Sigorta ve izinler',
        text:
          'Tandem uçuşlar, geçerli lisans ve izinlerle yürütülür. Katılımcıları kapsayan sigorta ve işletme izinleri ile ilgili ayrıntıları rezervasyon teyidinde paylaşırız.',
      },
    ],
    ctaTitle: 'Uçuşunuz güvenli olsun',
    ctaDescription:
      'Aklınıza takılan bir güvenlik konusu varsa, çekinmeden sorun. Açık iletişim, güvenli uçuşun parçasıdır.',
    ctaSecondary: 'Sıkça Sorulan Sorular',
  },

  contact: {
    metaTitle: 'İletişim',
    metaDescription:
      'İletişim: telefon, WhatsApp, e-posta, adres ve çalışma saatleri. Rezervasyon ve sorularınız için bize ulaşın.',
    ogDescription: 'İletişim bilgileri: telefon, WhatsApp, e-posta, adres.',
    eyebrow: 'İletişim',
    title: 'İletişim',
    introText:
      'Rezervasyon, ulaşım, transfer veya uçuş koşulları hakkında bir sorunuz mu var? Aşağıdaki kanallardan bize ulaşın.',
    advisers: 'Danışmanlarımız',
    details: 'İletişim bilgileri',
    writeToUsTitle: 'Bize yazın',
    writeToUsText: 'Sorularınız için formu doldurun; ekibimiz en kısa sürede dönüş yapsın.',
    email: 'E-posta',
    address: 'Adres',
    openingHours: 'Çalışma saatleri',
    form: {
      labelName: 'Adınız Soyadınız',
      emailLabel: 'E-posta',
      subjectLabel: 'Konu',
      messageLabel: 'Mesajınız',
      emailHint: 'ornek@email.com',
      subjectHint: 'Rezervasyon, ulaşım, uçuş koşulları…',
      messageHint: 'Sorunuzu kısaca yazın...',
      successTitle: 'Mesajınız Alındı',
      successText: 'Teşekkür ederiz. En kısa sürede sizinle iletişime geçeceğiz.',
      newMessage: 'Yeni Mesaj Gönder',
      submitting: 'Gönderiliyor…',
      awaitingVerification: 'Doğrulama bekleniyor…',
      completeVerification: 'Güvenlik doğrulamasını tamamlayın',
      generalError: 'Mesaj gönderilemedi. Lütfen tekrar deneyin.',
      errorConnection: 'Bağlantı sorunu. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.',
      formLabel: 'İletişim formu',
    },
  },

  packages: {
    metaTitle: 'Paketler ve Fiyatlar',
    metaDescription:
      "Tandem yamaç paraşütü paketleri. Bodrum'dan ücretsiz VIP transfer dahildir. Deneyim tipine göre farklı seçenekler; fiyat için bizimle iletişime geçin.",
    ogDescription:
      "Bodrum'dan ücretsiz VIP transfer dahil tandem yamaç paraşütü paket seçenekleri. Fiyat için iletişime geçin.",
    eyebrow: 'Paketler ve Fiyatlar',
    title: 'Paketler ve fiyatlar',
    introText:
      'Tandem yamaç paraşütü deneyimini farklı seçeneklerle sunuyoruz. Aşağıdaki paketler örnek içerikleri listeler; dahil olanlar ve süreler pakete göre değişebilir. Fiyat gösterimi şu an kapalıdır — güncel fiyat için bizimle iletişime geçin.',
    includedEyebrow: 'Fiyata dahil',
    includedTitle: 'Ücrete dahil hizmetler',
    includedDescription: 'Seçtiğiniz paketten bağımsız olarak, ekstra ücret ödemeden gelen hizmetler.',
    includedServices: [
      { title: 'Ücretsiz VIP transfer', text: "Bodrum'da bulunduğunuz yerden lüks araçlarla ücretsiz alım ve dönüş sağlanır." },
      { title: 'Yolculuk ikramları', text: 'Yolculuk esnasında soft içecek ve sandviç ikramı ücretsizdir.' },
      { title: 'Kamera çekimleri', text: 'Uçuş anınızın kamera çekimleri ücretsiz olarak sizinle paylaşılır.' },
      { title: 'Dünyanın en iyi pilotları ile tandem', text: 'Uçuş öncesi tüm güvenlik ve ekipman bilgilendirmesi dahildir.' },
    ],
    start: 'Başlangıç:',
    contactForPrice: 'Fiyat için iletişime geçin',
    forThisPackage: 'Bu paket için rezervasyon',
    emptyTitle: 'Paket listesi hazırlanıyor',
    emptyText:
      'Paket listesi yakında güncellenecek. Şu an örnek içerik görüntülenirken veri hazırlanıyor. Bilgi için bizimle iletişime geçin.',
    notesTitle: 'Önemli notlar',
    notesDescription: 'Rezervasyon öncesi bilmeniz gereken temel koşullar.',
    notes: [
      { title: 'Vergi', text: 'Fiyatlarımıza yasal yükümlülükler (KDV vb.) dahildir. Ayrıntılar teyit aşamasında paylaşılır.' },
      { title: 'İade', text: 'İade ve iptal koşulları için Mesafeli Satış ve İptal Koşulları sayfasına bakın.' },
      { title: 'Erteleme', text: 'Hava koşulları uygun olmadığında uçuş güvenlik nedeniyle ertelenir ve birlikte yeni bir tarih belirlenir. Bu durum ek ücret doğurmaz.' },
      { title: 'Garanti', text: 'Tüm uçuşlar hava koşullarına bağlıdır; belirli bir saatte uçma garantisi verilemez. Güvenlik her zaman önceliklidir.' },
    ],
    ctaTitle: 'Size uygun paketi seçemediniz mi?',
    ctaDescription: 'Özel ihtiyaçlarınız için bizimle iletişime geçin; birlikte planlayalım.',
    ctaPrimary: 'İletişime Geç',
  },

  booking: {
    metaTitle: 'Rezervasyon — Uçuş Talebi',
    metaDescription:
      'Yamaç paraşütü uçuşunuz için talebinizi bırakın. Tarih, saat ve koşulları birlikte netleştirelim. Ödeme yok; sadece talep kaydı.',
    ogDescription:
      'Yamaç paraşütü uçuşunuz için talebinizi bırakın. Ekibimiz en kısa sürede sizinle iletişime geçecek.',
    eyebrow: 'Booking',
    title: 'Uçuşunuzu planlayın',
    introText:
      'Talebinizi bırakın; uygun saat ve koşulları birlikte netleştirelim. Bu bir talep formudur — ödeme almıyoruz.',
    reasonTitle: 'Neden önceden talep?',
    reasons: [
      'Seferler günde iki kez kalkar: 09.00 ve 14.30 (yaklaşık 4 saat; hava koşuluna göre değişebilir).',
      'Hava koşullarına göre esnek tarih planlarız.',
      'Ödeme yapmadan, risk almadan yerinizi ayırtın.',
      "Bodrum'dan ücretsiz VIP transfer ve medya seçeneklerini önceden konuşun.",
    ],
    trustTitle: 'Güvenli & KVKK uyumlu',
    trustSsl: 'Bu sayfa SSL ile güvende.',
    trustPrivacy: 'Verileriniz KVKK aydınlatma metni’ne uygun işlenir.',
    trustUsage: 'Bilgileriniz yalnızca talebiniz için kullanılır.',
    quickTitle: 'Daha hızlı mı?',
    quickText: 'Form yerine doğrudan ulaşmak isterseniz:',
    steps: ['Paket Seçimi', 'Tarih & Saat', 'Katılımcı', 'İletişim', 'Onay'],
    step1Title: 'Hangi paketi tercih edersiniz?',
    step1Description: 'Deneyiminizi şekillendiren paketlerden birini seçin.',
    step2Title: 'Ne zaman uçmak istersiniz?',
    step2Description: 'Tercih ettiğiniz tarihi belirtin; hava koşullarına göre esneklik sağlıyoruz.',
    step3Title: 'Katılımcı bilgileri',
    step3Description: 'Uçuş güvenliği için kilo aralığı önemlidir.',
    step4Title: 'İletişim bilgileriniz',
    step4Description: 'Talebinizi değerlendirebilmemiz için gerekli.',
    step5Title: 'Son adım: Onaylar',
    step5Description: 'Bilgilerinizi onaylayın ve talebinizi gönderin.',
    date: 'Tarih',
    dateHint: 'Bugün ve sonrası seçilebilir',
    slotTime: 'Sefer saati',
    slotNote: 'Her sefer yaklaşık 4 saat sürer; kesin buluşma saati rezervasyon sırasında teyit edilir.',
    morning: 'Sabah',
    afternoon: 'Öğleden sonra',
    closed: 'kapandı',
    guestCount: 'Kişi sayısı',
    guestCountHint: '1–10 kişi. Daha fazlası için arayın.',
    important: 'Önemli:',
    importantNote:
      'Bu bir uçuş onayı değildir. Talebiniz alındıktan sonra ekibimiz hava koşulları ve uygunluğu doğrultusunda sizinle iletişime geçecektir.',
    weightOptions: [
      '50 kg altı',
      '50 – 80 kg',
      '80 – 100 kg',
      '100 – 110 kg',
      '110 kg üzeri',
    ],
    reachUsOnWhatsapp: 'WhatsApp’tan ulaşın →',
    honeypot: 'Web sitesi (boş bırakın)',
    weightRangeLabel: 'Kilo aralığı',
    weightSelect: 'Kilo aralığı seçin',
    weightHint: 'Uçuş güvenliği için önemlidir',
    fullName: 'Ad Soyad',
    fullNameHint: 'Adınız Soyadınız',
    phone: 'Telefon',
    phoneHint: '05XX XXX XX XX',
    email: 'E-posta',
    emailHint: 'ornek@email.com',
    localePreference: 'Tercih ettiğiniz dil',
    localeHint: 'İletişimde hangi dili tercih edersiniz?',
    turkish: 'Türkçe',
    english: 'İngilizce',
    privacyConsentText: 'KVKK Aydınlatma Metni',
    privacyConsentExtra: '’ni okudum, kişisel verilerimin işlenmesine ilişkin aydınlatıldım.',
    explicitConsentBefore: 'Kişisel verilerimin yamaç paraşütü talebi oluşturmak ve iletişim amacıyla işlenmesine',
    explicitConsentHighlight: 'açık rıza',
    explicitConsentAfter: 'veriyorum.',
    turnstileHint: 'Otomatik talep olmadığını doğrulamak için gereklidir.',
    consentNote:
      'Bu bir uçuş onayı değildir. Talebiniz alındıktan sonra ekibimiz tarih, saat ve hava koşullarını birlikte netleştirecektir. Mesafeli satış koşulları talep onaylanması aşamasında paylaşılır.',
    submitRequest: 'Talebi Gönder',
    submitting: 'Gönderiliyor…',
    awaitingVerification: 'Doğrulama bekleniyor…',
    completeVerification: 'Güvenlik doğrulamasını tamamlayın',
    successTitle: 'Talebiniz Alındı',
    successTextBefore: 'Talebiniz başarıyla kaydedildi.',
    successHighlight: 'Bu bir uçuş onayı değildir.',
    successTextAfter:
      'Ekibimiz en kısa sürede sizinle iletişime geçerek tarih, saat ve koşulları birlikte netleştirecek.',
    requestNumber: 'Talep numarası',
    newRequest: 'Yeni Talep Oluştur',
    generalError: 'Talep gönderilemedi. Lütfen tekrar deneyin veya WhatsApp’tan ulaşın.',
    errorConnection: 'Bağlantı sorunu. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.',
    whatsappMessage: 'Merhaba, yamaç paraşütü rezervasyonu hakkında bilgi almak istiyorum.',
    slotClosedNotice: 'Bugünkü seferler kapandı. En erken {tarih} için talep alıyoruz.',
    slotRecordNote: 'Kalkışa {dk} dakikadan az kaldı. Sefer {saat} olarak güncellendi.',
    dateRecordNote: 'Bugünkü seferler kapandı. Tarih {tarih} olarak güncellendi.',
  },

  tandem: {
    metaTitle: 'Tandem Yamaç Paraşütü Uçuşu',
    metaDescription:
      "Bodrum'dan ücretsiz VIP transfer, Ören/Alatepe kalkışıyla Gökova Körfezi üzerinde tandem uçuş. Sefer saatleri, dahil hizmetler ve güvenli uçuş deneyimi hakkında bilmeniz gereken her şey.",
    ogDescription:
      "Bodrum'dan ücretsiz VIP transfer, Gökova Körfezi üzerinde güvenli tandem uçuş deneyimi hakkında bilmeniz gereken her şey.",
    eyebrow: 'Tandem Uçuş',
    title: 'Tandem yamaç paraşütü nedir?',
    introText:
      'Tandem yamaç paraşütü, deneyimli bir pilotla aynı kanat altında uçtuğunuz bir deneyimdir. Pilot tüm teknik sorumluluğu üstlenir; sizin için tek gereken, pilotun verdiği birkaç basit hareketi takip etmek ve Gökova manzarasının tadını çıkarmaktır. Hiçbir ön deneyim gerekmez.',
    introCopy2:
      "Bodrum'daki konumunuzdan ücretsiz VIP transferle alınır, Ören/Alatepe kalkış noktasından havalanır, Gökova Körfezi üzerinde uçtuktan sonra tekrar Bodrum'a bırakılırsınız.",
    includedTitle: 'Ücrete dahil hizmetler',
    includedDescription: 'Ekstra ücret ödemeden, uçuşunuzla birlikte gelen hizmetler.',
    pendingTitle: 'Sizi neler bekliyor?',
    pendingDescription:
      'Kalkıştan inişe kadar geçen deneyimin her anı, sakin ve güvenli biçimde tasarlanır.',
    processTitle: 'Uçuş süreci, adım adım',
    processDescription:
      'Karşılamadan inişe kadar her aşama, sizin için sadeleştirilmiş bir akışla ilerler.',
    ctaTitle: 'İlk uçuşunuz için hazır mısınız?',
    ctaDescription: 'Aklınızdaki tarih için rezervasyon talebi oluşturun, birlikte planlayalım.',
    ctaSecondary: 'Daha fazla soru',
    jsonLdName: 'Tandem Yamaç Paraşütü Uçuşu',
    jsonLdDescription:
      'Gökova Ören (Alatepe) kalkış noktasında lisanslı pilot eşliğinde tandem yamaç paraşütü deneyimi.',
    jsonLdFaq: [
      {
        question: 'Tandem uçuşa kimler katılabilir?',
        answer:
          'Belirli sağlık kısıtları olmayan, önerilen kilo aralığında (yaklaşık 40–110 kg) hemen herkes katılabilir. Detaylar için sayfadaki "Kimler katılabilir?" bölümüne bakın.',
      },
      {
        question: 'Tandem uçuş ne kadar sürer?',
        answer:
          'Yaklaşık 15–30 dakika arası; hava ve rota koşullarına göre değişir. Bu süreler planlama amaçlıdır, uçuş günü doğrulanacaktır.',
      },
      {
        question: 'Daha önce deneyimim yoksa uçabilir miyim?',
        answer:
          'Evet. Tandem uçuşta pilot tüm teknik kısımları üstlenir; sizin için yapmanız gereken tek şey birkaç basit hareketi takip etmek ve manzaranın tadını çıkarmaktır.',
      },
    ],
    processSteps: [
      { title: 'Karşılama ve tanışma', text: 'Belirlenen buluşma noktasında pilotunuzla tanışırsınız. Günün programı, hava durumu ve uçuş planı hakkında kısa bir bilgilendirme yapılır.' },
      { title: 'Güvenlik brifingi', text: 'Pilotunuz kalkış, uçuş ve inişte yapmanız gereken birkaç basit hareketi anlatır. Endişeleriniz varsa bu aşamada paylaşabilirsiniz.' },
      { title: 'Ekipman hazırlığı', text: 'Kask, küvör ve harness (kuşam) size uygun şekilde ayarlanır. Pilot, tüm bağlantıları uçuştan önce tekrar kontrol eder.' },
      { title: 'Kalkış', text: 'Alatepe kalkış noktasında pilotunuzla birlikte kısa bir koşuyla havalandırırsınız. Kalkış saniyeler sürer ve doğru teknikle çok kolaydır.' },
      { title: 'Uçuş', text: 'Bir kez havalandıktan sonra kendinizi koltukta oturur gibi hissedersiniz. Pilot süreci yönetir, siz manzaranın tadını çıkarırsınız.' },
      { title: 'İniş', text: 'Ören plajı civarında yumuşak bir iniş yapılır. Pilotun verdiği son birkaç hareketle yere ayak basarsınız.' },
    ],
    pendingItems: [
      { title: 'Sakin bir başlangıç', text: 'Korkmanıza gerek yok; kalkış yumuşak ve kontrollüdür. Pilotunuz yanınızda, adım adım yönlendirir.' },
      { title: 'Bol hava ve manzara', text: 'Gökova Körfezi, plajlar ve ormanlık yamaçlar üstünde süzülürsünüz. Fotoğraf/video seçenekleriyle anılar kalıcı olur.' },
      { title: 'Yumuşak iniş', text: 'Ören plajı civarında, pilotunuzun kontrolünde rahat bir iniş yaparsınız. İniş sonrası kayıtlarınız teslim edilir.' },
    ],
    includedItems: [
      'Dünyanın en iyi pilotları ile lisanslı tandem uçuşu',
      'Tüm güvenlik ekipmanları (kask, küvör, harness)',
      'Uçuş öncesi güvenlik ve ekipman bilgilendirmesi',
      "Bodrum'dan ücretsiz VIP transfer (alım ve dönüş)",
    ],
    whatToBring: [
      'Kapalı, rüzgar geçirmeyen üst (mevsime göre mont)',
      'Spor ayakkabı (kalkış için kaymayan taban)',
      'Güneş gözlüğü ve şapka (mevsime göre)',
      'Kimlik belgesi (rezervasyon teyidi için)',
      'Su ve hafif atıştırmalık',
    ],
    details: {
      durationTitle: 'Uçuş süreleri',
      durationParagraph:
        'Tandem uçuş, hava ve rota koşullarına göre yaklaşık 15–30 dakika sürer. Karşılamadan inişe kadar toplam saha süresi 1–2 saattir; bu süre transfer, brifing ve hazırlığı içerir.',
      durationNote: 'Bu süreler planlama amaçlıdır; uçuş gününde pilot ve koşullara göre doğrulanacaktır.',
      whoTitle: 'Kimler katılabilir?',
      whoList: [
        'Önerilen kilo aralığı yaklaşık 40–110 kg (pilot ile değerlendirilir).',
        '18 yaş altı katılımcılar için veli onayı gerekir.',
        'Hamile katılımcılar için uygun değildir.',
        'Kalp, boyun/sırt problemi veya hareket kısıtlılığı olanlar önceden bildirmelidir.',
      ],
      whoNote: 'Kilo ve yaş değerleri planlama amaçlıdır; bireysel durum pilot ile birlikte değerlendirilir.',
      includedTitle: 'Neler dahil?',
      includedNote: 'Fotoğraf ve video seçenekleri pakete göre değişir; detaylar için paketler sayfasına bakın.',
      buildTitle: 'Ne getirmeliyim?',
      routeTitle: 'Rota',
      routeList: [
        "Bodrum'dan ücretsiz VIP transfer ile alım",
        'Ören / Alatepe kalkış noktasına ulaşım',
        'Gökova Körfezi üzerinde tandem uçuş',
        "Bodrum'a konforlu dönüş",
      ],
      scheduleTitle: 'Program ve sefer saatleri',
      scheduleParagraph:
        'Seferlerimiz her gün sabah 09.00 ve öğleden sonra 14.30 saatlerinde başlar; her sefer transfer, hazırlık ve uçuş dahil yaklaşık 4 saat sürer.',
      scheduleNote: 'Hava şartlarına göre saatler değişebilir; kesin buluşma saati rezervasyon esnasında sizinle teyit edilir.',
    },
    postponementTitle: 'Uçuş ertelenirse?',
    postponementText: 'Hava koşulları uygun olmadığında güvenlik nedeniyle uçuş ertelenir. Bu durumda birlikte yeni bir tarih belirleriz. Ayrıntılar için',
    postponementAnd: 've',
    postponementAfter: 'sayfalarına bakın.',
  },

  flightSite: {
    metaTitle: 'Gökova Ören / Alatepe Yamaç Paraşütü Kalkış Noktası',
    metaDescription:
      'Gökova Ören (Alatepe) yamaç paraşütü kalkış noktası: konum, koordinatlar, sezon, saatler, ulaşım ve transfer bilgileri. Muğla/Ula sınırlarında, Gökova Körfezi manzaralı tandem uçuş rotası.',
    ogDescription:
      'Gökova Körfezi manzaralı tandem yamaç paraşütü kalkış noktası hakkında konum, sezon, saatler ve ulaşım.',
    eyebrow: 'Uçuş Noktası',
    title: 'Gökova Ören / Alatepe yamaç paraşütü kalkış noktası',
    introText:
      'Muğla’nın Ula ilçesinde, Gökova Körfezi’ne bakan yamaçlarda yer alan Alatepe kalkış noktası, Gökova Ören üzerinde tandem uçuşlar için kullanılır. Tepeden denize doğru süzüldüğü bu rota, hem deneyimli gözler hem de ilk kez uçacak misafirler için eşsiz bir manzara sunar.',
    takeoffTitle: 'Kalkış noktası',
    takeoffText:
      'Kalkış, Alatepe yamacında, rüzgar yönüne göre belirlenen alandan yapılır. Pilot, günün koşullarına göre en uygun kalkış noktasını seçer. Yükseklik ve rüzgar bilgisi uçuş öncesi brifingde paylaşılır.',
    location: 'Konum:',
    coordinate: 'Koordinat (yaklaşık):',
    coordinateNote: 'Koordinatlar planlama amaçlıdır; yayın öncesi pilot ile doğrulanacaktır.',
    landingTitle: 'İniş noktası',
    landingText:
      'İniş, genellikle Ören plajı yakınındaki geniş ve düz alana yapılır. Bu alan, hem pilotun güvenli iniş gerçekleştirmesi için uygundur hem de misafirlerin uçuşu izleyebilmesi için rahat bir bekleme alanı sunar.',
    seasonInfo: [
      { title: 'Sezon', text: 'Uçuş sezonu genellikle Nisan–Ekim arasıdır. Bu dönemde hava koşulları tandem uçuşa en uygun zamanı sunar. Sezon dışı günlerde hava değerlendirmesiyle birlikte uçulabilir.' },
      { title: 'Saatler', text: 'Gerçek uçuş saatleri günün hava değerlendirmesiyle belirlenir; sabah ve öğleden sonra pencereleri tercih edilir.' },
      { title: 'Ulaşım / Transfer', text: 'Belirli paketlerde transfer hizmeti sunulur. Kendi aracınızla geliyorsanız Ören/Akyaka yönünden ulaşım mümkündür; detaylı yönlendirme rezervasyon onayında paylaşılır.' },
    ],
    weatherTitle: 'Lokasyona özel hava durumu',
    weatherDescription:
      'Bu bölgede canlı hava ve uçuş uygunluk tahmini entegre olana kadar bilgi için bizimle iletişime geçebilirsiniz.',
    tileNote:
      'Tüm görseller için kullanım izinleri kayıt altındadır; örnek/görseller tamamlandıkça eklenecektir.',
    tileAlt: [
      'Alatepe kalkış noktasından manzara',
      'Havadan Gökova Ören ve körfez',
      'Tandem uçuş deneyimi',
      'Ören plajına iniş',
    ],
    touristType: 'Macera turizmi, hava sporları',
    tileTitle: 'Lokasyondan kareler',
    tileDescription: 'Alatepe kalkışından Ören plajına inişe, bölgenin gökyüzü manzarasından kareler.',
    nearbyTitle: 'Yakındaki turistik noktalar',
    nearbyDescription: 'Uçuşunuzun yanı sıra bölgede keşfedebileceğiniz güzellikler.',
    nearbyPlaces: [
      { title: 'Ören Plajı', text: 'İniş noktasına yakın, uzun kumluğu ve sığ deniziyle bilinen sakin bir plaj. Uçuş sonrası dinlenmek için ideal.' },
      { title: 'Gökova Körfezi', text: 'Türkiye’nin en güzel koylarından biri. Tekne turları, kano ve deniz sporları için popüler bir bölge.' },
      { title: 'Akyaka', text: 'Sığırmata adıyla bilinen, doğal güzellikleri ve balık restoranlarıyla ünlü sahil beldesi.' },
      { title: 'Sedir Adası (Cleopatra Plajı)', text: 'Efsaneye göre Cleopatra için kumların getirildiği ünlü plaj. Tekne turu ile ulaşılır.' },
    ],
    ctaTitle: 'Bu manzarayı görmek için gelin',
    ctaDescription: 'Gökova Ören / Alatepe üzerinde uçmak için rezervasyonunuzu yapın.',
    ctaSecondary: 'Ulaşım ve transfer için iletişim',
  },

};

/**
 * Turkish URL slugs, keyed by the English source path used in the route
 * folders. Keeping them next to the rest of the Turkish copy means
 * `src/lib/i18n` stays free of localized strings.
 */
export const trSlugs: Record<string, string> = {
  '/about-us': '/hakkimizda',
  '/tandem-flight': '/tandem-ucus',
  '/take-off-site/gokova-oren-alatepe-paragliding':
    '/ucus-noktasi/gokova-oren-alatepe-yamac-parasutu',
  '/live-conditions': '/canli-ucus-durumu',
  '/safety': '/guvenlik',
  '/faq': '/sik-sorulan-sorular',
  '/packages-and-prices': '/paketler-ve-fiyatlar',
  '/gallery': '/galeri',
  '/contact': '/iletisim',
  '/booking': '/rezervasyon',
  '/our-pilots': '/pilotlarimiz',
  '/privacy-policy': '/gizlilik-politikasi',
  '/terms-of-sale': '/mesafeli-satis-ve-iptal-kosullari',
  '/cookie-policy': '/cerez-politikasi',
};


/**
 * Turkish wording for the server and schema error messages.
 *
 * The application writes those messages in English at source; this table is
 * consulted just before one is shown to a Turkish visitor. A message with no
 * entry here falls through unchanged, so nothing breaks when a new one is
 * added.
 *
 * The two slot-closing messages are built at runtime from CLOSING_MINUTES and
 * therefore live in `trSlotMessages` below rather than in this table.
 */
export const trErrorMessages: Record<string, string> = {
  'The URL must start with http:// or https://, or be a site-relative path beginning with "/".':
    'URL http:// veya https:// ile başlamalı ya da site-içi göreli bir yol ("/" ile başlayan) olmalı.',
  "This record already exists.":
    "Bu kayıt zaten mevcut.",
  "The record was not found.":
    "İlgili kayıt bulunamadı.",
  "This cannot be done while related records exist.":
    "Bu işlem, ilişkili kayıtlar nedeniyle yapılamıyor.",
  "The database operation failed.":
    "Veritabanı işleminde bir sorun oluştu.",
  "A media URL is required.":
    "Medya URL gerekli.",
  "The alternate date must differ from the preferred date":
    "Alternatif tarih, tercih edilen tarihten farklı olmalı",
  "Time preference is too long":
    "Saat tercihi çok uzun",
  "Time must be in HH:MM format (e.g. 10:30)":
    "Saat biçimi HH:MM olmalı (ör. 10:30)",
  "Invalid date":
    "Geçersiz tarih",
  "Please choose a date":
    "Tarih zorunlu",
  "Phone number is required":
    "Telefon zorunlu",
  "E-mail address is required":
    "E-posta zorunlu",
  "You cannot choose a date in the past":
    "Geçmiş bir tarih seçilemez",
  "Please choose a package":
    "Paket seçimi zorunlu",
  "Invalid alternative date":
    "Geçersiz alternatif tarih",
  "The alternative date must be after today":
    "Alternatif tarih bugünden sonraki bir gün olmalı",
  "The alternative date must differ from your preferred date":
    "Alternatif tarih, tercih tarihinden farklı olmalı",
  "Number of people is required":
    "Kişi sayısı zorunlu",
  "Number of people must be a whole number":
    "Kişi sayısı tam sayı olmalı",
  "At least 1 person":
    "En az 1 kişi",
  "Up to 10 people (please call us for larger groups)":
    "En fazla 10 kişi (daha fazlası için arayın)",
  "Please choose a weight range":
    "Kilo aralığı seçin",
  "Your full name must be at least 3 characters":
    "Ad soyad en az 3 karakter olmalı",
  "Your full name must be at least 2 characters":
    "Ad soyad en az 2 karakter olmalı",
  "Your full name is too long":
    "Ad soyad çok uzun",
  "Please enter a valid mobile number (e.g. 05XX XXX XX XX)":
    "Geçerli bir cep telefonu girin (ör. 05XX XXX XX XX)",
  "Please enter a valid e-mail address":
    "Geçerli bir e-posta adresi girin",
  "E-mail address is too long":
    "E-posta çok uzun",
  "Please choose a language":
    "Dil tercihi seçin",
  "Please choose a photo/video option":
    "Medya tercihi seçin",
  "Your note can be at most 500 characters":
    "Not en fazla 500 karakter olmalı",
  "You must accept the privacy notice":
    "KVKK aydınlatma metnini kabul etmelisiniz",
  "You must accept the explicit consent statement":
    "Açık rıza metnini kabul etmelisiniz",
  "Turnstile token is too long":
    "Turnstile token çok uzun",
  "The subject must be at least 2 characters":
    "Konu en az 2 karakter olmalı",
  "The subject is too long":
    "Konu çok uzun",
  "Your message must be at least 10 characters":
    "Mesaj en az 10 karakter olmalı",
  "Your message can be at most 5000 characters":
    "Mesaj en fazla 5000 karakter olmalı",
  "The request could not be verified.":
    "İstek doğrulanamadı.",
  "Invalid request body.":
    "Geçersiz istek gövdesi.",
  "The request body is empty.":
    "İstek gövdesi boş.",
  "Invalid JSON format.":
    "Geçersiz JSON formatı.",
  "Method not supported.":
    "Yöntem desteklenmiyor.",
  "Please check the form.":
    "Lütfen formu kontrol edin.",
  "Security verification is required.":
    "Güvenlik doğrulaması gerekiyor.",
  "Security verification failed.":
    "Güvenlik doğrulaması başarısız.",
  "The selected package was not found or is not active.":
    "Seçilen paket bulunamadı veya aktif değil.",
  "The package selection is not valid.":
    "Paket seçimi geçersiz.",
  "Something went wrong. Please try again.":
    "Bir hata oluştu. Lütfen tekrar deneyin.",
  "You have sent too many requests. Please wait a moment and try again.":
    "Çok fazla talep gönderdiniz. Lütfen biraz bekleyip tekrar deneyin.",
  "You have sent too many messages. Please wait a moment and try again.":
    "Çok fazla mesaj gönderdiniz. Lütfen biraz bekleyip tekrar deneyin.",
  "The submitted data is too large. Please send a smaller payload.":
    "Gönderilen veri çok büyük. Lütfen daha küçük bir içerik gönderin.",
  "We have received your request. Our team will contact you shortly.":
    "Talebiniz alındı. Ekibimiz en kısa sürede sizinle iletişime geçecek.",
  "We have received your message. We will get back to you shortly.":
    "Mesajınız alındı. En kısa sürede dönüş yapacağız.",
  "No weather thresholds are defined for this location. Please contact the administrator.":
    "Bu lokasyon için hava eşiği tanımlı değil. Lütfen yönetici ile iletişime geçin.",
  "You need to sign in.":
    "Oturum açmanız gerekiyor.",
  "You do not have permission for this action.":
    "Bu işlem için yetkiniz yok.",
  "This action requires the ADMIN role.":
    "Bu işlem için ADMIN yetkisi gerekiyor.",
};

/** Slot-closing wording, built from the same minute threshold as the source. */
export function trSlotMessages(closingMinutes: number): Record<string, string> {
  return {
    [`This departure closes ${closingMinutes} minutes before take-off; please choose the next one`]:
      `Bu sefer için son ${closingMinutes} dakikaya girildi; lütfen sonraki seferi seçin`,
    [`Less than ${closingMinutes} minutes remain before this departure; please choose the next one`]:
      `Bu sefere ${closingMinutes} dakikadan az kaldı; sonraki seferi seçin`,
  };
}


/** Turkish labels for the WMO weather codes (see `src/lib/weather/open-meteo.ts`). */
export const trWeatherLabels: Record<number, string> = {
  0: 'Açık',
  1: 'Az bulutlu',
  2: 'Parçalı bulutlu',
  3: 'Çok bulutlu',
  45: 'Sisli',
  48: 'Buz sisi',
  51: 'Hafif çiseleme',
  53: 'Çiseleme',
  55: 'Yoğun çiseleme',
  56: 'Hafif donan çiseleme',
  57: 'Yoğun donan çiseleme',
  61: 'Hafif yağmur',
  63: 'Yağmur',
  65: 'Şiddetli yağmur',
  66: 'Hafif donan yağmur',
  67: 'Yoğun donan yağmur',
  71: 'Hafif kar',
  73: 'Kar',
  75: 'Yoğun kar',
  77: 'Kar taneleri',
  80: 'Hafif sağanak',
  81: 'Sağanak',
  82: 'Şiddetli sağanak',
  85: 'Hafif kar sağanağı',
  86: 'Yoğun kar sağanağı',
  95: 'Gök gürültülü fırtına',
  96: 'Dolulu fırtına',
  99: 'Şiddetli dolulu fırtına',
};


/** Turkish compass points, in the order used by `directionLabel`. */
export const trCompassPoints = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB'];

/** Turkish phrasing for the flight-suitability explanations. */
export const trSuitabilityText = {
  wind: (v: string, y: number, sr: number) =>
    `Rüzgâr ${v} km/s (sınır yeşil ${y}, sarı ${sr} km/s)`,
  gust: (delta: string, gust: string, average: string) =>
    `Gust farkı ${delta} km/s (gust ${gust} − ortalama ${average})`,
  precipitation: (v: string, y: number, sr: number) =>
    `Yağış ${v} mm (sınır yeşil ${y}, sarı ${sr} mm)`,
  visibility: (v: string, y: number, sr: number) =>
    `Görüş ${v} km (alt sınır yeşil ${y}, sarı ${sr} km)`,
  directionInside: (direction: string, min: number, max: number) =>
    `Rüzgâr yönü ${direction}, uygun sektörde (${min}–${max}°)`,
  directionEdge: (direction: string, min: number, max: number) =>
    `Rüzgâr yönü ${direction}, sektör sınırına yakın (${min}–${max}°)`,
  directionOutside: (direction: string, min: number, max: number) =>
    `Rüzgâr yönü ${direction}, uçuş sektörü dışında (${min}–${max}°)`,
  storm: (code: number) =>
    `Gök gürültülü/fırtına koşulu (WMO code ${code}) → uçuş yasak`,
  staleWarning: 'Güncel veri alınamadı, gösterilen veri eski olabilir.',
  green: (wind: string, direction: string, gust: string, sector: boolean) =>
    `${sector ? `Rüzgâr ${wind} ${direction}, suitable sektörde. ` : `Rüzgâr ${wind} ${direction}. `}Gust ${gust}. Koşullar elverişli görünüyor.`,
  amber: (wind: string, direction: string, gust: string, extra: string, issue: string) =>
    `Rüzgâr ${wind} ${direction}, gust ${gust}.${extra} ${issue} Dikkatli olunmalı; pilot değerlendirmesi şart.`,
  red: (wind: string, direction: string, gust: string, extra: string, issue: string) =>
    `Rüzgâr ${wind} ${direction}, gust ${gust}.${extra} ${issue} Uçuş uygun değil.`,
  status: { green: 'Uygun', amber: 'Dikkat', red: 'Elverişsiz' },
  parameterName: {
    wind: 'rüzgâr hızı',
    gust: 'gust farkı',
    precipitation: 'yağış',
    visibility: 'görüş',
    direction: 'rüzgâr yönü',
    storm: 'fırtına',
  } as Record<string, string>,
  issuePrefix: (critical: boolean) => (critical ? 'Kritik: ' : 'Sınırda: '),
  conjunction: ' ve ',
};


/** Turkish copy for the booking e-mails. */
export const trBookingMail = {
  htmlLang: 'tr',
  tagline: 'Yamaç Paraşütü Deneyimi',
  footer: 'Bu e-posta otomatik olarak oluşturulmuştur. Lütfen yanıtlamayın.',
  title: 'Talebiniz Alındı',
  subject: 'Uçuş Talebiniz Alındı',
  greetingBefore: (name: string) => `Sayın <strong>${name}</strong>, uçuş talebinizi aldık.`,
  emphasis: 'Bu bir uçuş onayı değildir.',
  greetingAfter:
    'Ekibimiz en kısa sürede sizinle iletişime geçerek tarih, saat ve koşulları birlikte netleştirecek.',
  summaryTitle: 'Talep Özeti',
  pkg: 'Package',
  preferredDateValue: 'Tarih tercihi',
  alternateDate: 'Alternatif tarih',
  guestCount: 'Kişi sayısı',
  transfer: 'Transfer',
  transferYes: 'Evet, talep edildi',
  mediaPreference: 'Medya tercihi',
  closing:
    'Sorularınız için bize WhatsApp veya telefon ile ulaşabilirsiniz. En kısa sürede dönüş yapacağız.',
  media: { photo: 'Fotoğraf çekimi', photoVideo: 'Fotoğraf + Video', none: 'Yok' },
};

/**
 * Turkish translation of the legal pages. The default-locale source lives in
 * `src/lib/admin/page-content.ts`; only the translation belongs here.
 */
export const trLegalContent = {

  privacyPolicy: {
    metaTitle: 'Gizlilik Politikası',
    metaDescription:
      'Kişisel verilerin toplanması, kullanılması, saklanması ve KVKK kapsamında haklarınız.',
    title: 'Gizlilik Politikası',
    lastUpdated: '2026-07-24',
    login:
      'Ziyaretçilerimizin ve misafirlerimizin gizliliğini korumaya önem veriyoruz. Bu politika, web sitemiz üzerinden toplanan kişisel verilerin nasıl işlendiğini açıklar.',
    sections: [
      { title: '1. Toplanan veriler', text: 'İletişim ve rezervasyon formları aracılığıyla ad, soyad, telefon, e-posta, uçuş tercihleri ve benzeri bilgiler toplanır. Site ziyaretinde IP adresi, tarayıcı tipi ve kullanım verileri kaydedilebilir.' },
      { title: '2. Verilerin kullanım amacı', text: 'Toplanan veriler rezervasyon süreçlerinin yürütülmesi, hizmetin sunulması, iletişim, güvenlik ve yasal yükümlülüklerin yerine getirilmesi amacıyla kullanılır.' },
      { title: '3. Verilerin saklanması', text: 'Kişisel veriler, ilgili mevzuatta öngörülen veya işlemenin amacını gerektiren süre boyunca saklanır. Süre dolduğunda güvenli biçimde silinir veya anonim hale getirilir.' },
      { title: '4. Verilerin paylaşılması', text: 'Veriler açık rıza olmadan üçüncü taraflarla paylaşılmaz. Hizmetin sunulması için gerekli olduğunda yalnızca zorunlu bilgiler aktarılabilir. Yasal mercilerden gelen taleplerde ilgili mevzuata uyulur.' },
      { title: '5. Haklarınız', text: 'KVKK kapsamında verilerinize erişme, düzeltme, silme, işlemeye itiraz etme ve veri taşınabilirliği haklarına sahipsiniz. Bu haklar için iletişim kanallarımızdan bize başvurabilirsiniz.' },
      { title: '6. Çerezler', text: 'Sitede çerezler kullanılabilir. Çerezlerin türü ve kullanım amacı için Çerez Politikası sayfasına bakabilirsiniz.' },
      { title: '7. İletişim', text: 'Bu politika ile ilgili sorularınız için iletişim kanallarımızdan bize ulaşabilirsiniz.' },
    ],
  },
  cookiePolicy: {
    metaTitle: 'Çerez Politikası',
    metaDescription:
      'Kullanılan çerez türleri, amaçları ve çerez tercihlerinizi nasıl yöneteceğiniz.',
    title: 'Çerez Politikası',
    lastUpdated: '2026-07-24',
    login:
      'Bu çerez politikası, web sitesinde çerezlerin ve benzer teknolojilerin nasıl kullanıldığını açıklar.',
    sections: [
      { title: '1. Çerez nedir?', text: 'Çerezler, web sitemizi ziyaret ettiğinizde tarayıcınıza kaydedilen küçük metin dosyalarıdır. Siteyi daha verimli çalıştırmamıza ve deneyiminizi iyileştirmemize yardımcı olur.' },
      { title: '2. Kullandığımız çerez türleri', text: 'Zorunlu çerezler temel işlevler için gereklidir. Performans ve analitik çerezleri ziyaretçi davranışını anonim olarak anlamak için, işlevsel çerezler ise tercihleri hatırlamak için kullanılabilir.' },
      { title: '3. Üçüncü taraflar', text: 'Harita, video veya analitik gibi üçüncü taraf hizmetleri kullanıldığında bu hizmetler kendi çerezlerini bırakabilir. Her hizmetin kendi gizlilik politikası geçerlidir.' },
      { title: '4. Tercihlerinizi yönetme', text: 'Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz. Zorunlu olmayan çerezler için rıza yönetimi tercih paneli üzerinden sağlanabilir.' },
      { title: '5. İletişim', text: 'Çerez politikası ile ilgili sorularınız için iletişim kanallarımızdan bize ulaşabilirsiniz.' },
    ],
  },
  termsOfSale: {
    metaTitle: 'Mesafeli Satış ve İptal Koşulları',
    metaDescription:
      'Tandem uçuş rezervasyonlarında ödeme, iptal, hava nedeniyle erteleme ve iade koşulları.',
    title: 'Mesafeli Satış ve İptal Koşulları',
    lastUpdated: '2026-07-24',
    login:
      'Bu metin, tandem yamaç paraşütü rezervasyonlarında ön bilgilendirme, ödeme, iptal, erteleme ve iade koşullarını açıklar.',
    sections: [
      { title: '1. Ön bilgilendirme', text: 'Hizmet; pilot onayı, hava koşulları, operasyon uygunluğu ve güvenlik değerlendirmesine bağlı tandem uçuş deneyimidir.' },
      { title: '2. Ödeme', text: 'Ödeme ve kapora koşulları rezervasyon sırasında bildirilebilir. Fiyat ve kapsam, seçilen paket ve operasyon planına göre değişebilir.' },
      { title: '3. Cayma hakkı', text: 'Belirli tarih veya dönemde sunulan eğlence/rekreasyon hizmetlerinde cayma hakkı mevzuat kapsamında sınırlı olabilir. Her talep ayrıca değerlendirilir.' },
      { title: '4. İptal koşulları', text: 'Misafir kaynaklı iptallerde operasyon takvimi, bildirim zamanı ve hazırlık maliyetleri dikkate alınır. İşletme kaynaklı iptallerde yeniden planlama veya uygun iade seçenekleri sunulur.' },
      { title: '5. Erteleme', text: 'Hava, güvenlik veya pilot değerlendirmesi nedeniyle uçuş ertelenebilir. Uçuş onayı yalnızca operasyon/pilot değerlendirmesiyle verilir.' },
      { title: '6. İade süreci', text: 'İade gerekiyorsa, ödeme yöntemi ve sağlayıcı süreçlerine bağlı olarak makul süre içinde işleme alınır.' },
      { title: '7. Değişiklikler', text: 'Operasyon koşulları, fiyatlar ve paket kapsamları güncellenebilir. Güncel koşullar rezervasyon öncesinde paylaşılır.' },
      { title: '8. İletişim', text: 'Satış ve iptal koşullarıyla ilgili sorularınız için iletişim kanallarımızdan bize ulaşabilirsiniz.' },
    ],
  },
};

/** Turkish phrases for the unsuitable-flight parameters (see `src/lib/weather/suitability.ts`). */
export const trIssueLabels: Record<string, string> = {
  wind: 'rüzgâr yüksek',
  gust: 'gust farkı fazla',
  precipitation: 'yağış var',
  visibility: 'görüş düşük',
  direction: 'rüzgâr yönü elverişsiz',
  storm: 'fırtına bekleniyor',
};
