/* =========================================
   MATERIAL DEFINITIONS
========================================= */

const MATERIAL_CATEGORIES = [
  "Lining",
  "Two by Two",
  "Silk Cotton",
  "Plain Net",
  "Poplin",
  "Suncrepe",
  "Falls",
  "Satin"
];

const MATERIAL_IMAGES = {
  "Lining":      "/assets/shirts.webp",
  "Two by Two":  "/assets/2by2.webp",
  "Silk Cotton": "/assets/silkcotton.webp",
  "Plain Net":   "/assets/plainnet.webp",
  "Poplin":      "/assets/poplin.webp",
  "Suncrepe":    "/assets/suncrepe.webp",
  "Falls":       "/assets/falls.webp",
  "Satin":       "/assets/satin.webp"
};

const OTHER_MATERIAL_IMAGES = {
  "Inskirts":        "/assets/inskirt.webp",
  "Aari Materials":  "/assets/aari.webp",
  "Stitching Items": "/assets/stitchingitems.webp",
  "Laces":           "/assets/lace.webp",
  "Knots":           "/assets/knot.webp",
  "Others":          "/assets/other.webp"
};

/* =========================================
   LOAD CATEGORIES
========================================= */

async function loadCategories() {
  try {
    const res = await fetch(API_ENDPOINTS.CATEGORIES);
    const categories = await res.json();

    const materialsGrid  = document.getElementById("materialsGrid");
    const otherMaterials = document.getElementById("otherMaterials");

    materialsGrid.innerHTML  = "";
    otherMaterials.innerHTML = "";

    /* ================================
       MATERIALS (FIXED ORDER)
    ================================= */

    MATERIAL_CATEGORIES.forEach(category => {
      if (categories.includes(category)) {

        const materialUrl =
          `/html/product.html?material=${encodeURIComponent(category)}`;

        const card = document.createElement("a");
        card.href      = materialUrl;
        card.className = "material-card";

        card.innerHTML = `
          <img src="${MATERIAL_IMAGES[category]}" alt="${category}" loading="lazy">
          <div class="material-label">${category}</div>
        `;

        materialsGrid.appendChild(card);
      }
    });

    /* ================================
       OTHER MATERIALS (SORTED)
       "Others" ALWAYS LAST
    ================================= */

    const otherCategories = categories
      .filter(cat => OTHER_MATERIAL_IMAGES[cat])
      .sort((a, b) => {
        if (a === "Others") return 1;
        if (b === "Others") return -1;
        return a.localeCompare(b);
      });

    otherCategories.forEach(category => {

      const categoryUrl =
        `/html/category.html?cat=${encodeURIComponent(category)}`;

      const card = document.createElement("a");
      card.href      = categoryUrl;
      card.className = "material-card";

      card.innerHTML = `
        <img src="${OTHER_MATERIAL_IMAGES[category]}" alt="${category}" loading="lazy">
        <div class="material-label">${category}</div>
      `;

      otherMaterials.appendChild(card);
    });

  } catch (error) {
    console.error("Failed to load categories:", error);
  }
}

/* =========================================
   NEW ARRIVALS
========================================= */

async function loadNewArrivals() {
  try {
    const res      = await fetch(API_ENDPOINTS.PRODUCTS);
    const products = await res.json();

    const grid = document.getElementById("newArrivalsGrid");
    if (!grid) return;

    grid.innerHTML = "";

    // Sort by latest createdAt, show top 8
    const sorted = [...products]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);

    if (sorted.length === 0) {
      grid.innerHTML = `<p style="color:var(--silver);text-align:center;grid-column:1/-1;">No products yet.</p>`;
      return;
    }

    sorted.forEach(product => {
      const card = document.createElement("a");
      card.href = `/html/product-detail.html?id=${product.id}`;  // _id → id
      card.className = "material-card";

      const image = product.image_url || "";   // was product.images?.[0]
const name  = product.name || "Product"; // this was correct

      card.innerHTML = `
        <img src="${image}" alt="${name}" loading="lazy">
        <div class="material-label">${name}</div>
        <div class="card-badge">NEW</div>
      `;

      grid.appendChild(card);
    });

  } catch (error) {
    console.error("Failed to load new arrivals:", error);
  }
}

/* =========================================
   DOM READY
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  loadCategories();
  loadNewArrivals();

  /* ================================
     HOME SEARCH REDIRECT
  ================================= */

  const homeSearch       = document.getElementById("homeSearch");
  const homeSearchMobile = document.getElementById("homeSearchMobile");

  function bindSearch(el) {
    if (!el) return;
    el.addEventListener("mousedown", e => {
      e.preventDefault();
      window.location.href = "/html/search.html";
    });
    el.addEventListener("touchstart", e => {
      e.preventDefault();
      window.location.href = "/html/search.html";
    });
  }

  bindSearch(homeSearch);
  bindSearch(homeSearchMobile);

  /* ================================
     MOBILE SLIDER
  ================================= */

  const mTrack   = document.getElementById('mobileTrack');
  const mCards   = document.querySelectorAll('.mobile-card');
  const mSlogans = document.querySelectorAll('.mobile-slogan-item');
  const mPrevBtn = document.getElementById('mPrev');
  const mNextBtn = document.getElementById('mNext');
  let mCurrent   = 0;
  const mTotal   = mCards.length;
  const sTotal   = mSlogans.length;

  function mGoTo(index) {
    const prevSlogan = mCurrent % sTotal;
    mCurrent = (index + mTotal) % mTotal;
    mTrack.style.transform = `translateX(-${mCurrent * 100}%)`;
    const nextSlogan = mCurrent % sTotal;
    mSlogans[prevSlogan].classList.remove('active');
    const item = mSlogans[nextSlogan];
    item.classList.remove('active');
    void item.offsetWidth;
    item.classList.add('active');
  }

  if (mPrevBtn && mNextBtn && mTrack) {
    mNextBtn.addEventListener('click', () => mGoTo(mCurrent + 1));
    mPrevBtn.addEventListener('click', () => mGoTo(mCurrent - 1));
    setInterval(() => mGoTo(mCurrent + 1), 5000);
  }

  /* ================================
     DESKTOP SLOGANS
  ================================= */

  const dSlogans = document.querySelectorAll('.desktop-slogan-item');
  let dCurrent   = 0;

  function dCycle() {
    dSlogans[dCurrent].classList.remove('active');
    dCurrent = (dCurrent + 1) % dSlogans.length;
    const item = dSlogans[dCurrent];
    item.classList.remove('active');
    void item.offsetWidth;
    item.classList.add('active');
  }

  if (dSlogans.length) {
    setInterval(dCycle, 5000);
  }

});