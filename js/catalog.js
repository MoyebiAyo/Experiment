import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where
} from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';
import { getDb, isFirebaseConfigured } from './firebase-app.js';
import { SEED_CONTENT, SEED_PRODUCTS, SEED_SERVICES } from './seed-data.js';
import { escapeHtml, formatDisplayDate } from './utils.js';

function sortByOrder(items) {
  return items.slice().sort(function (a, b) {
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });
}

export async function fetchProducts(includeHidden) {
  if (!isFirebaseConfigured()) {
    return sortByOrder(SEED_PRODUCTS.map(function (p) {
      return Object.assign({ docId: p.id }, p);
    }));
  }
  var db = getDb();
  if (!db) return sortByOrder(SEED_PRODUCTS);

  try {
    var q = includeHidden
      ? query(collection(db, 'products'), orderBy('sortOrder', 'asc'))
      : query(
          collection(db, 'products'),
          where('active', '==', true),
          orderBy('sortOrder', 'asc')
        );
    var snap = await getDocs(q);
    if (snap.empty) {
      return sortByOrder(SEED_PRODUCTS.map(function (p) {
        return Object.assign({ docId: p.id }, p);
      }));
    }
    return snap.docs.map(function (d) {
      return Object.assign({ docId: d.id }, d.data());
    });
  } catch (err) {
    console.warn('Firestore products fallback', err);
    return sortByOrder(SEED_PRODUCTS.map(function (p) {
      return Object.assign({ docId: p.id }, p);
    }));
  }
}

export async function fetchServices(includeHidden) {
  if (!isFirebaseConfigured()) {
    return sortByOrder(SEED_SERVICES.filter(function (s) {
      return includeHidden || s.active !== false;
    }).map(function (s) {
      return Object.assign({ docId: s.id }, s);
    }));
  }
  var db = getDb();
  if (!db) return sortByOrder(SEED_SERVICES);

  try {
    var q = includeHidden
      ? query(collection(db, 'services'), orderBy('sortOrder', 'asc'))
      : query(
          collection(db, 'services'),
          where('active', '==', true),
          orderBy('sortOrder', 'asc')
        );
    var snap = await getDocs(q);
    if (snap.empty) {
      return sortByOrder(SEED_SERVICES.map(function (s) {
        return Object.assign({ docId: s.id }, s);
      }));
    }
    return snap.docs.map(function (d) {
      return Object.assign({ docId: d.id }, d.data());
    });
  } catch (err) {
    console.warn('Firestore services fallback', err);
    return sortByOrder(SEED_SERVICES.map(function (s) {
      return Object.assign({ docId: s.id }, s);
    }));
  }
}

export async function fetchSiteContent() {
  if (!isFirebaseConfigured()) return SEED_CONTENT;
  var db = getDb();
  if (!db) return SEED_CONTENT;
  try {
    var snap = await getDoc(doc(db, 'content', 'site'));
    if (!snap.exists()) return SEED_CONTENT;
    return Object.assign({}, SEED_CONTENT, snap.data());
  } catch (err) {
    console.warn('Firestore content fallback', err);
    return SEED_CONTENT;
  }
}

export function renderProductCard(product, options) {
  var opts = options || {};
  var showOrderBtn = opts.showOrderButton !== false;
  var badgeHtml = product.badge
    ? '<span class="product-card__badge' +
      (product.badge === 'Popular' ? ' product-card__badge--custom' : '') +
      '">' + escapeHtml(product.badge) + '</span>'
    : '';
  var priceNote = product.priceNote
    ? '<span class="product-card__price-note">' + escapeHtml(product.priceNote) + '</span>'
    : '';

  return (
    '<article class="product-card" data-category="' + escapeHtml(product.category) + '" data-name="' + escapeHtml(product.name) + '">' +
      '<a href="#" class="product-card__link" data-whatsapp="product">' +
        '<div class="product-card__image">' +
          '<img src="' + escapeHtml(product.imageUrl) + '" alt="' + escapeHtml(product.name) + '" loading="lazy">' +
          badgeHtml +
        '</div>' +
        '<h3 class="product-card__name">' + escapeHtml(product.name) + '</h3>' +
        '<p class="product-card__meta">' + escapeHtml(product.description || '') + '</p>' +
        '<p class="product-card__price">' + escapeHtml(product.price || '') + priceNote + '</p>' +
      '</a>' +
      (showOrderBtn
        ? '<button type="button" class="btn btn--secondary btn--small" style="width:100%;margin-top:12px;" data-whatsapp="product">Order</button>'
        : '') +
    '</article>'
  );
}

export function renderProductsGrid(container, products, options) {
  if (!container) return;
  var active = products.filter(function (p) {
    return p.active !== false;
  });
  if (!active.length) {
    container.innerHTML = '<p class="section__subtitle" style="text-align:center;grid-column:1/-1;">No outfits available yet.</p>';
    return;
  }
  container.innerHTML = active.map(function (p) {
    return renderProductCard(p, options);
  }).join('');
}

function applyUtilityBar(content) {
  var bar = document.querySelector('.utility-bar__message');
  if (!bar || !content.utilityBar) return;
  var u = content.utilityBar;
  var wa = u.linkWhatsapp ? ' data-whatsapp="' + escapeHtml(u.linkWhatsapp) + '"' : '';
  bar.innerHTML = '<a href="' + escapeHtml(u.linkHref || '#') + '"' + wa + ' style="color:inherit;text-decoration:none;">' +
    escapeHtml(u.message) + '</a>';
}

function applyHeroSlides(content) {
  var carousel = document.getElementById('hero-carousel');
  if (!carousel || !content.heroSlides || !content.heroSlides.length) return;
  carousel.innerHTML = content.heroSlides.map(function (slide, i) {
    var cta1 = slide.ctaPrimary || {};
    var cta2 = slide.ctaSecondary || {};
    var wa1 = cta1.whatsapp ? ' data-whatsapp="' + escapeHtml(cta1.whatsapp) + '"' : '';
    var wa2 = cta2.whatsapp ? ' data-whatsapp="' + escapeHtml(cta2.whatsapp) + '"' : '';
    return (
      '<article class="hero__slide' + (i === 0 ? ' active' : '') + '" data-slide="' + i + '">' +
        '<div class="hero__content">' +
          '<p class="hero__eyebrow">' + escapeHtml(slide.eyebrow) + '</p>' +
          '<h1 class="hero__title">' + escapeHtml(slide.title) + '</h1>' +
          '<p class="hero__subtitle">' + escapeHtml(slide.subtitle) + '</p>' +
          '<div class="hero__actions">' +
            '<a href="' + escapeHtml(cta1.href || '#') + '" class="btn btn--primary"' + wa1 + '>' + escapeHtml(cta1.label || '') + '</a>' +
            '<a href="' + escapeHtml(cta2.href || '#') + '" class="btn btn--secondary"' + wa2 + '>' + escapeHtml(cta2.label || '') + '</a>' +
          '</div>' +
        '</div>' +
        '<div class="hero__image-wrap">' +
          '<img src="' + escapeHtml(slide.imageUrl) + '" alt="' + escapeHtml(slide.imageAlt || slide.title) + '" width="600" height="750" loading="' + (i === 0 ? 'eager' : 'lazy') + '">' +
        '</div>' +
      '</article>'
    );
  }).join('');

  var dotsWrap = document.querySelector('.hero__dots');
  if (dotsWrap) {
    dotsWrap.innerHTML = content.heroSlides.map(function (_, i) {
      return '<button class="hero__dot' + (i === 0 ? ' active' : '') + '" role="tab" aria-selected="' + (i === 0 ? 'true' : 'false') + '" aria-label="Slide ' + (i + 1) + '" data-index="' + i + '"></button>';
    }).join('');
  }
  window.dispatchEvent(new CustomEvent('kansy:hero-updated'));
}

function applyPromo(content) {
  var section = document.getElementById('promo');
  if (!section || !content.promo) return;
  var p = content.promo;
  var wa = p.ctaWhatsapp ? ' data-whatsapp="' + escapeHtml(p.ctaWhatsapp) + '"' : '';
  section.innerHTML =
    '<div class="promo__inner container">' +
      '<div class="promo__content">' +
        '<span class="promo__label">' + escapeHtml(p.label) + '</span>' +
        '<h2 class="promo__title">' + escapeHtml(p.title) + '</h2>' +
        '<p class="promo__text">' + escapeHtml(p.text) + '</p>' +
        '<a href="' + escapeHtml(p.ctaHref || '#') + '" class="btn btn--light"' + wa + '>' + escapeHtml(p.ctaLabel) + '</a>' +
      '</div>' +
      '<div class="promo__image">' +
        '<img src="' + escapeHtml(p.imageUrl) + '" alt="' + escapeHtml(p.imageAlt || p.title) + '" width="500" height="400" loading="lazy">' +
      '</div>' +
    '</div>';
}

function applyStories(content) {
  var grid = document.querySelector('.stories__grid');
  if (!grid || !content.stories) return;
  grid.innerHTML = content.stories.map(function (story) {
    return (
      '<article class="story-card">' +
        '<a href="#stories" class="story-card__link">' +
          '<div class="story-card__image">' +
            '<img src="' + escapeHtml(story.imageUrl) + '" alt="' + escapeHtml(story.imageAlt || story.title) + '" width="400" height="260" loading="lazy">' +
          '</div>' +
          '<div class="story-card__body">' +
            '<time class="story-card__date" datetime="' + escapeHtml(story.date) + '">' + escapeHtml(formatDisplayDate(story.date)) + '</time>' +
            '<h3 class="story-card__title">' + escapeHtml(story.title) + '</h3>' +
            '<p class="story-card__excerpt">' + escapeHtml(story.excerpt) + '</p>' +
          '</div>' +
        '</a>' +
      '</article>'
    );
  }).join('');
}

function applyFeatures(content) {
  var grid = document.querySelector('.features-strip__grid');
  if (!grid || !content.features) return;
  grid.innerHTML = content.features.map(function (f) {
    return (
      '<div class="features-strip__item">' +
        '<h3>' + escapeHtml(f.title) + '</h3>' +
        '<p>' + escapeHtml(f.text) + '</p>' +
      '</div>'
    );
  }).join('');
}

function applyHomeServices(container, services) {
  if (!container) return;
  var portal = services.filter(function (s) {
    return ['browse-collections', 'chat-designer', 'book-appointment'].indexOf(s.docId || s.id) !== -1;
  });
  var list = portal.length ? portal : services.slice(0, 3);
  container.innerHTML = list.map(function (s, i) {
    var wa = s.whatsappPackage === 'booking' ? ' data-whatsapp="booking"' : (s.whatsappPackage ? ' data-whatsapp="package" data-package="' + escapeHtml(s.whatsappPackage) + '"' : '');
    var btnClass = s.docId === 'book-appointment' || s.id === 'book-appointment' ? 'btn btn--gold btn--small' : 'btn btn--secondary btn--small';
    return (
      '<article class="service-card">' +
        '<div class="service-card__icon" aria-hidden="true">' + escapeHtml(s.icon || String(i + 1).padStart(2, '0')) + '</div>' +
        '<h3 class="service-card__title">' + escapeHtml(s.title) + '</h3>' +
        '<p class="service-card__text">' + escapeHtml(s.description) + '</p>' +
        '<a href="' + escapeHtml(s.ctaHref || '#') + '" class="' + btnClass + '"' + wa + '>' + escapeHtml(s.ctaLabel) + '</a>' +
      '</article>'
    );
  }).join('');
}

function applyPricingPage(services, content) {
  var grid = document.querySelector('.pricing-grid');
  if (!grid) return;
  var packages = services.filter(function (s) {
    return s.price && ['consultation', 'bespoke-design', 'alterations'].indexOf(s.docId || s.id) !== -1;
  });
  if (!packages.length) {
    packages = services.filter(function (s) { return s.price; }).slice(0, 3);
  }
  grid.innerHTML = packages.map(function (s) {
    var featured = s.featured ? ' pricing-card--featured' : '';
    var badge = s.featured ? '<span class="pricing-card__badge">Most Popular</span>' : '';
    var wa = s.whatsappPackage ? ' data-whatsapp="package" data-package="' + escapeHtml(s.whatsappPackage) + '"' : '';
    var btnClass = s.featured ? 'btn btn--gold' : 'btn btn--secondary';
    var features = (s.features || []).map(function (f) {
      return '<li>' + escapeHtml(f) + '</li>';
    }).join('');
    return (
      '<article class="pricing-card' + featured + '">' +
        badge +
        '<h3 class="pricing-card__name">' + escapeHtml(s.title) + '</h3>' +
        '<p class="pricing-card__price">' + escapeHtml(s.price) + '</p>' +
        '<p class="pricing-card__period">' + escapeHtml(s.period || '') + '</p>' +
        '<ul class="pricing-card__features">' + features + '</ul>' +
        '<a href="' + escapeHtml(s.ctaHref || 'appointment.html') + '" class="' + btnClass + '" style="width:100%;"' + wa + '>' + escapeHtml(s.ctaLabel) + '</a>' +
      '</article>'
    );
  }).join('');

  var pay = document.querySelector('.payment-info');
  if (pay && content.paymentInfo) {
    var pi = content.paymentInfo;
    var bullets = (pi.bullets || []).map(function (b) {
      return '<li>' + escapeHtml(b) + '</li>';
    }).join('');
    pay.innerHTML =
      '<h3>' + escapeHtml(pi.title) + '</h3>' +
      '<p>' + escapeHtml(pi.body) + '</p>' +
      '<ul>' + bullets + '</ul>';
  }
}

function showCatalogLoading(container) {
  if (!container) return;
  container.setAttribute('aria-busy', 'true');
  container.innerHTML = '<p class="catalog-loading" style="text-align:center;grid-column:1/-1;color:var(--color-muted);">Loading collections…</p>';
}

async function initCollectionsPage() {
  var grid = document.getElementById('collections-grid');
  if (!grid) return;
  showCatalogLoading(grid);
  var products = await fetchProducts(false);
  renderProductsGrid(grid, products, { showOrderButton: true });
  grid.removeAttribute('aria-busy');
  if (typeof window.applyCollectionFilters === 'function') {
    window.applyCollectionFilters();
  }
}

async function initHomePage() {
  var content = await fetchSiteContent();
  applyUtilityBar(content);
  applyHeroSlides(content);
  applyFeatures(content);
  applyPromo(content);
  applyStories(content);

  var homeGrid = document.getElementById('home-products');
  if (homeGrid) {
    showCatalogLoading(homeGrid);
    var products = await fetchProducts(false);
    renderProductsGrid(homeGrid, products, { showOrderButton: false });
    homeGrid.removeAttribute('aria-busy');
  }

  var servicesGrid = document.querySelector('.services__grid');
  if (servicesGrid) {
    var services = await fetchServices(false);
    applyHomeServices(servicesGrid, services);
  }

  var statCollections = document.getElementById('stat-active-collections');
  if (statCollections) {
    var all = await fetchProducts(false);
    statCollections.textContent = String(all.length);
  }
}

async function initPricingPage() {
  var services = await fetchServices(false);
  var content = await fetchSiteContent();
  applyPricingPage(services, content);
}

var page = document.body.getAttribute('data-page');
if (page === 'collections') {
  initCollectionsPage();
} else if (page === 'home' || document.getElementById('home-products')) {
  document.body.setAttribute('data-page', 'home');
  initHomePage();
} else if (page === 'pricing') {
  initPricingPage();
}
