/* =========================================
   CATEGORY DEFINITIONS
========================================= */

const MAIN_CATEGORIES = ["shirts","trousers","tshirts","jeans","cargos","jackets"];
const OTHER_CATEGORIES = ["shoes","chains"];

const CATEGORY_IMAGES = {
  shirts: "/assets/shirts.webp",
  trousers: "/assets/trousers.webp",
  tshirts: "/assets/tshirts.webp",
  jeans: "/assets/jeans.webp",
  cargos: "/assets/cargos.webp",
  jackets: "/assets/jackets.webp",
  shoes: "/assets/shoes.webp",
  chains: "/assets/chains.webp"
};

const CATEGORY_LABELS = {
  shirts: "Shirts",
  trousers: "Trousers",
  tshirts: "T-Shirts",
  jeans: "Jeans",
  cargos: "Cargos",
  jackets: "Jackets",
  shoes: "Shoes",
  chains: "Chains"
};

/* =========================================
   PRODUCT CARD (NEW ARRIVALS)
   → redirects to product.html
========================================= */

function buildProductCard(product) {

  const card = document.createElement("a");

  card.href = `/html/product.html?id=${product.id}`;
  card.className = "material-card";

  const image = product.image_url || "";
  const name  = product.name || "Product";
  const price = product.price || 0;
  const disc  = product.discounted_price;

  const priceHTML = disc
    ? `<span class="card-price"><s>₹${price}</s> <span class="card-disc">₹${disc}</span></span>`
    : `<span class="card-price">₹${price}</span>`;

  card.innerHTML = `
    <img src="${image}" alt="${name}" loading="lazy">
    <div class="card-info">
      <div class="material-label">${name}</div>
      ${priceHTML}
    </div>
  `;

  return card;
}

/* =========================================
   CATEGORY CARD
   → redirects to search.html
========================================= */

function buildCategoryCard(category, url) {

  const card = document.createElement("a");
  card.href = url;
  card.className = "material-card category-card";

  const image = CATEGORY_IMAGES[category] || "";
  const label = CATEGORY_LABELS[category] || category;

  card.innerHTML = `
    <img src="${image}" alt="${label}" loading="lazy">
    <div class="card-info">
      <div class="material-label">${label}</div>
    </div>
  `;

  return card;
}

/* =========================================
   LOAD CATEGORIES
========================================= */

async function loadCategories() {

  try {

    const res = await fetch(API_ENDPOINTS.CATEGORIES);
    const categories = await res.json();

    const materialsGrid = document.getElementById("materialsGrid");
    const otherMaterials = document.getElementById("otherMaterials");

    if (materialsGrid) materialsGrid.innerHTML = "";
    if (otherMaterials) otherMaterials.innerHTML = "";

    /* MAIN CATEGORIES */

MAIN_CATEGORIES.forEach(cat => {

  if (!categories.includes(cat)) return;

  const url  = `/html/search.html?category=${encodeURIComponent(cat)}`;

  const card = buildCategoryCard(cat, url);

  materialsGrid.appendChild(card);

});
    /* ACCESSORIES */

    OTHER_CATEGORIES.forEach(cat => {

      if (!categories.includes(cat)) return;

const url = `/html/search.html?category=${encodeURIComponent(cat)}`;
const card = buildCategoryCard(cat, url); // ✅

      otherMaterials.appendChild(card);

    });

  } catch (err) {

    console.error("Failed loading categories:", err);

  }

}

/* =========================================
   NEW ARRIVALS
========================================= */

async function loadNewArrivals() {

  try {

    const res = await fetch(API_ENDPOINTS.PRODUCTS);
    const products = await res.json();

    const grid = document.getElementById("newArrivalsGrid");

    if (!grid) return;

    grid.innerHTML = "";

    const sorted = [...products]
      .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0,8);

    if (!sorted.length) {

      grid.innerHTML =
        `<p style="color:var(--silver);text-align:center;grid-column:1/-1;padding:2rem;">
          No products yet.
        </p>`;

      return;

    }

    sorted.forEach(product => {

      const card = buildProductCard(product);

      grid.appendChild(card);

    });

  } catch (err) {

    console.error("Failed loading new arrivals:", err);

  }

}

/* =========================================
   DOM READY
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  loadCategories();
  loadNewArrivals();

  /* HOME SEARCH */

  const homeSearch = document.getElementById("homeSearch");
  const homeSearchMobile = document.getElementById("homeSearchMobile");

  function bindSearch(el){

    if(!el) return;

    el.addEventListener("click", () => {
      window.location.href = "/html/search.html";
    });

  }

  bindSearch(homeSearch);
  bindSearch(homeSearchMobile);

});

/* =========================================
   MOBILE SLIDER
========================================= */

(function () {
  const track = document.getElementById("mobileTrack");
  const prevBtn = document.getElementById("mPrev");
  const nextBtn = document.getElementById("mNext");

  if (!track || !prevBtn || !nextBtn) return;

  const cards = track.querySelectorAll(".mobile-card");
  const total = cards.length;
  let current = 0;
  let autoPlay;

  const slogans = document.querySelectorAll(".mobile-slogan-item");

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;

    slogans.forEach((s, i) => {
      s.classList.toggle("active", i === current);
    });
  }

  function startAutoPlay() {
    autoPlay = setInterval(() => goTo(current + 1), 3500);
  }

  function resetAutoPlay() {
    clearInterval(autoPlay);
    startAutoPlay();
  }

  prevBtn.addEventListener("click", () => { goTo(current - 1); resetAutoPlay(); });
  nextBtn.addEventListener("click", () => { goTo(current + 1); resetAutoPlay(); });

  // Touch swipe support
  let touchStartX = 0;

  track.addEventListener("touchstart", e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener("touchend", e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goTo(current + 1) : goTo(current - 1);
      resetAutoPlay();
    }
  }, { passive: true });

  goTo(0);
  startAutoPlay();
})();