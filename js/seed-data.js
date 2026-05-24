/**
 * Default catalog and site copy extracted from static HTML (seed / offline fallback).
 */
export const SEED_PRODUCTS = [
  {
    id: 'silk-evening-gown',
    name: 'Silk Evening Gown',
    description: 'Custom fit · 2–3 weeks',
    price: 'From $890',
    priceNote: 'Consultation included',
    category: 'dresses',
    imageUrl: 'images/product-silk-dress.jpg',
    badge: 'Bespoke',
    active: true,
    sortOrder: 1
  },
  {
    id: 'structured-couture-blazer',
    name: 'Structured Couture Blazer',
    description: 'Tailored · Premium wool',
    price: 'From $650',
    priceNote: '',
    category: 'outerwear',
    imageUrl: 'images/product-blazer.jpg',
    badge: '',
    active: true,
    sortOrder: 2
  },
  {
    id: 'handcrafted-ankle-boots',
    name: 'Handcrafted Ankle Boots',
    description: 'Italian leather',
    price: 'From $420',
    priceNote: '',
    category: 'footwear',
    imageUrl: 'images/product-boots.jpg',
    badge: '',
    active: true,
    sortOrder: 3
  },
  {
    id: 'gold-statement-earrings',
    name: 'Gold Statement Earrings',
    description: '14k gold plated',
    price: 'From $185',
    priceNote: '',
    category: 'accessories',
    imageUrl: 'images/product-earrings.jpg',
    badge: '',
    active: true,
    sortOrder: 4
  },
  {
    id: 'linen-couture-skirt',
    name: 'Linen Couture Skirt',
    description: 'Made to measure',
    price: 'From $320',
    priceNote: '',
    category: 'dresses',
    imageUrl: 'images/product-skirt.jpg',
    badge: 'Popular',
    active: true,
    sortOrder: 5
  },
  {
    id: 'structured-designer-handbag',
    name: 'Structured Designer Handbag',
    description: 'Limited edition',
    price: 'From $540',
    priceNote: '',
    category: 'accessories',
    imageUrl: 'images/product-handbag.jpg',
    badge: '',
    active: true,
    sortOrder: 6
  }
];

export const SEED_SERVICES = [
  {
    id: 'consultation',
    title: 'Consultation',
    description: 'Style assessment, collection walkthrough, starting price quotes — no obligation.',
    icon: '01',
    price: '$0',
    period: 'First visit · 30 minutes',
    features: ['Style assessment', 'Collection walkthrough', 'Starting price quotes', 'No obligation'],
    ctaLabel: 'Book Free Consult',
    ctaHref: 'appointment.html',
    whatsappPackage: 'Free Consultation',
    featured: false,
    active: true,
    sortOrder: 1
  },
  {
    id: 'bespoke-design',
    title: 'Bespoke Design',
    description: '1-on-1 designer sessions, fabric selection, fittings — custom fit per garment.',
    icon: '02',
    price: 'From $650',
    period: 'Per garment · custom fit',
    features: ['1-on-1 designer sessions', 'Fabric selection included', '2 fitting appointments', '50% deposit to begin', 'Balance due at pickup'],
    ctaLabel: 'Start Your Design',
    ctaHref: 'appointment.html',
    whatsappPackage: 'Bespoke Design',
    featured: true,
    active: true,
    sortOrder: 2
  },
  {
    id: 'alterations',
    title: 'Alterations',
    description: 'Hemming, tailoring, size adjustments — quote at fitting.',
    icon: '03',
    price: 'From $85',
    period: 'Per item · 5–7 day turnaround',
    features: ['Hemming & tailoring', 'Size adjustments', 'Rush service available', 'Quote at fitting'],
    ctaLabel: 'Request Alterations',
    ctaHref: 'chat.html',
    whatsappPackage: 'Alterations',
    featured: false,
    active: true,
    sortOrder: 3
  },
  {
    id: 'browse-collections',
    title: 'Browse Collections',
    description: 'Explore our fashion gallery, view outfit details, and check transparent starting prices.',
    icon: '01',
    price: '',
    period: '',
    features: [],
    ctaLabel: 'View Gallery',
    ctaHref: 'collections.html',
    whatsappPackage: '',
    featured: false,
    active: true,
    sortOrder: 10
  },
  {
    id: 'chat-designer',
    title: 'Chat with Designer',
    description: 'Share your vision, ask about fabrics and timelines, and receive personalized guidance.',
    icon: '02',
    price: '',
    period: '',
    features: [],
    ctaLabel: 'Start Chat',
    ctaHref: 'chat.html',
    whatsappPackage: '',
    featured: false,
    active: true,
    sortOrder: 11
  },
  {
    id: 'book-appointment',
    title: 'Book Appointment',
    description: 'Schedule fittings and consultations. Our designer confirms every booking personally.',
    icon: '03',
    price: '',
    period: '',
    features: [],
    ctaLabel: 'Book Now',
    ctaHref: 'appointment.html',
    whatsappPackage: 'booking',
    featured: false,
    active: true,
    sortOrder: 12
  }
];

export const SEED_CONTENT = {
  utilityBar: {
    message: 'Book your private fitting — complimentary consultation for new clients',
    linkHref: 'appointment.html',
    linkWhatsapp: 'booking'
  },
  heroSlides: [
    {
      eyebrow: 'Custom Fashion Design',
      title: 'Where Elegance Meets Your Vision',
      subtitle: 'Explore bespoke collections, connect with your designer, and book private fittings — all in one premium experience.',
      imageUrl: 'images/hero-1.jpg',
      imageAlt: 'Model in bespoke Kansy Couture evening wear',
      ctaPrimary: { label: 'Explore Collections', href: 'collections.html', whatsapp: 'general' },
      ctaSecondary: { label: 'Book a Fitting', href: 'appointment.html', whatsapp: 'booking' }
    },
    {
      eyebrow: 'Designer Consultation',
      title: 'Crafted Exclusively for You',
      subtitle: 'From concept to final stitch — collaborate directly with our lead designer on your dream ensemble.',
      imageUrl: 'images/hero-2.jpg',
      imageAlt: 'Designer consultation at Kansy Couture studio',
      ctaPrimary: { label: 'Chat with Designer', href: 'chat.html', whatsapp: '' },
      ctaSecondary: { label: 'View Pricing', href: 'pricing.html', whatsapp: '' }
    },
    {
      eyebrow: 'Private Appointments',
      title: 'Your Style, Perfectly Tailored',
      subtitle: 'Schedule fittings and consultations at your convenience. Transparent pricing, seamless booking.',
      imageUrl: 'images/hero-3.jpg',
      imageAlt: 'Tailored urban chic fashion by Kansy Couture',
      ctaPrimary: { label: 'Schedule Now', href: 'appointment.html', whatsapp: 'booking' },
      ctaSecondary: { label: 'View Outfits', href: 'collections.html', whatsapp: 'general' }
    }
  ],
  promo: {
    label: 'New Client Offer',
    title: 'Complimentary Style Consultation',
    text: 'Book your first appointment and receive a free 30-minute consultation with our lead designer. Discover pricing packages tailored to your needs.',
    imageUrl: 'images/promo-autumn.jpg',
    imageAlt: 'Kansy Couture seasonal collection showcase',
    ctaLabel: 'Book Your Appointment',
    ctaHref: 'appointment.html',
    ctaWhatsapp: 'booking'
  },
  stories: [
    {
      date: '2026-05-15',
      title: 'The Art of Couture Layering',
      excerpt: 'How our designer combines textures and silhouettes for unforgettable ensembles.',
      imageUrl: 'images/story-layering.jpg',
      imageAlt: 'The art of couture layering'
    },
    {
      date: '2026-05-08',
      title: 'Building Your Bespoke Wardrobe',
      excerpt: 'Essential pieces every client should consider for a timeless, custom collection.',
      imageUrl: 'images/story-capsule.jpg',
      imageAlt: 'Building a bespoke wardrobe'
    },
    {
      date: '2026-04-28',
      title: 'Sustainable Couture Practices',
      excerpt: 'Our commitment to ethical sourcing without compromising luxury craftsmanship.',
      imageUrl: 'images/story-sustainable.jpg',
      imageAlt: 'Sustainable couture practices'
    }
  ],
  features: [
    { title: 'Collections', text: 'Browse curated fashion collections with transparent outfit pricing.' },
    { title: 'Designer Chat', text: 'Communicate directly with your designer for custom requests.' },
    { title: 'Appointments', text: 'Book fittings and consultations online — fast and convenient.' },
    { title: 'Premium Care', text: 'Luxury service from first sketch to final fitting.' }
  ],
  about: {
    title: 'Kansy Couture',
    text: 'A premium digital fashion experience connecting you with custom design services, transparent pricing, and seamless appointment booking.'
  },
  paymentInfo: {
    title: 'Payment Information',
    body: 'We accept major credit cards, debit cards, and bank transfers. A 50% deposit is required to commence bespoke orders; the remaining balance is due upon final fitting approval.',
    bullets: [
      'Consultations for new clients are complimentary',
      'Payment plans available for orders over $2,000',
      'Online payment integration coming soon — appointments can be confirmed in-studio',
      'Cancellations within 48 hours may incur a $50 rescheduling fee'
    ]
  }
};
