document.addEventListener("DOMContentLoaded", () => {

  const CAMERA_ENABLED_CATEGORIES = [
    "Lining",
    "Two by Two",
    "Suncrepe",
    "Falls"
  ];

  const params = new URLSearchParams(window.location.search);
  const rawCategory = params.get("cat");

  const selectedCategory = rawCategory
    ? rawCategory.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
    : null;

if (selectedCategory) {

  const newTitle = `${selectedCategory} Collection | Anis Boutique Chennai`;

  const newDescription =
    `Shop premium ${selectedCategory} materials at Anis Boutique Chennai. Explore our latest ${selectedCategory} collection.`;

  document.title = newTitle;

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute("content", newDescription);
  }

  const ogTitle = document.getElementById("ogTitle");
  const ogDescription = document.getElementById("ogDescription");
  const twitterTitle = document.getElementById("twitterTitle");
  const twitterDescription = document.getElementById("twitterDescription");
  const canonicalTag = document.getElementById("canonicalTag");

  if (ogTitle) ogTitle.setAttribute("content", newTitle);
  if (ogDescription) ogDescription.setAttribute("content", newDescription);
  if (twitterTitle) twitterTitle.setAttribute("content", newTitle);
  if (twitterDescription) twitterDescription.setAttribute("content", newDescription);

  if (canonicalTag) {
    canonicalTag.setAttribute(
      "href",
      `https://anisboutique.in/html/category.html?cat=${encodeURIComponent(selectedCategory)}`
    );
  }
}

  const titleEl = document.getElementById("categoryTitle");
  const gridEl = document.getElementById("productsGrid");
  const searchInput = document.getElementById("searchInput");
  const camIcon = document.getElementById("camIcon");

  if (!titleEl || !gridEl || !searchInput) {
    console.error("❌ Category DOM not found");
    return;
  }

  titleEl.textContent = selectedCategory
    ? selectedCategory.toUpperCase()
    : "NO CATEGORY";

  if (camIcon) {
    camIcon.style.display = CAMERA_ENABLED_CATEGORIES.includes(selectedCategory)
      ? "inline-flex"
      : "none";
  }

  let CATEGORY_PRODUCTS = [];

  async function loadCategoryProducts() {
    try {
      const res = await fetch(
        window.API_ENDPOINTS.PRODUCTS
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const products = Array.isArray(data) ? data : data.products || [];

      CATEGORY_PRODUCTS = products.filter(
        p => p.category?.toLowerCase() === selectedCategory?.toLowerCase()
      );

      renderProducts(CATEGORY_PRODUCTS);

    } catch (err) {
      console.error("Failed to load products:", err);
      gridEl.innerHTML =
        `<p class="no-results">Failed to load products</p>`;
    }
  }

  function renderProducts(products) {
    gridEl.innerHTML = "";

    if (!products.length) {
      gridEl.innerHTML =
        `<p class="no-results">No products found</p>`;
      return;
    }

    products.forEach(product => {
      const imageUrl =
        product.image_url?.trim() ||
        product.extra_images?.[0]?.trim() ||
        "/assets/placeholder.jpg";

      const originalPrice = Number(product.price);
      const discountedPrice =
        Number(product.discounted_price) < originalPrice
          ? Number(product.discounted_price)
          : null;

      const card = document.createElement("div");
      card.className = "product-card";

      card.innerHTML = `
        <a href="/html/product.html?id=${product.id}" class="product-link">

          <div class="product-image">
            <img src="${imageUrl}" alt="${product.name}">
          </div>

          <div class="product-info">
            <h3 class="product-name">${product.name}</h3>

            <div class="product-prices">
              ${
                discountedPrice
                  ? `<span class="price-old">₹${originalPrice}</span>
                     <span class="price-new">₹${discountedPrice}</span>`
                  : `<span class="price-new">₹${originalPrice}</span>`
              }
            </div>
          </div>

        </a>
      `;

      gridEl.appendChild(card);
    });
  }

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();

    renderProducts(
      CATEGORY_PRODUCTS.filter(p =>
        p.name?.toLowerCase().includes(query)
      )
    );
  });

  loadCategoryProducts();
});
