document.addEventListener("DOMContentLoaded", () => {

  const params = new URLSearchParams(window.location.search);
  const rawCategory = params.get("cat");

  const selectedCategory = rawCategory
    ? rawCategory.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
    : null;

  if (selectedCategory) {
    document.title = `${selectedCategory} | Genz`;
  }

  const titleEl = document.getElementById("categoryTitle");
  const gridEl = document.getElementById("productsGrid");
  const searchInput = document.getElementById("searchInput");

  if (!titleEl || !gridEl || !searchInput) {
    console.error("❌ Category DOM not found");
    return;
  }

  titleEl.textContent = selectedCategory
    ? selectedCategory.toUpperCase()
    : "ALL PRODUCTS";

  let categoryProducts = [];
  let allProductsFromDB = [];

  function showSkeletons() {
    gridEl.innerHTML = "";
    for (let i = 0; i < 8; i++) {
      const skeleton = document.createElement("div");
      skeleton.className = "product-card skeleton-card";
      skeleton.innerHTML = `
        <div class="skeleton-image"></div>
        <div class="skeleton-info">
          <div class="skeleton-line skeleton-name"></div>
          <div class="skeleton-line skeleton-price"></div>
        </div>
      `;
      gridEl.appendChild(skeleton);
    }
  }

  async function loadCategoryProducts() {
    showSkeletons();
    try {
      const res = await fetch(window.API_ENDPOINTS.PRODUCTS);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      allProductsFromDB = Array.isArray(data) ? data : data.products || [];

      categoryProducts = selectedCategory
        ? allProductsFromDB.filter(
            p => p.category?.toLowerCase() === selectedCategory.toLowerCase()
          )
        : [...allProductsFromDB];

      renderProducts(categoryProducts);

    } catch (err) {
      console.error("Failed to load products:", err);
      gridEl.innerHTML = `<p class="no-results">Failed to load products</p>`;
    }
  }

  function renderProducts(products) {
    gridEl.innerHTML = "";

    if (!products.length) {
      gridEl.innerHTML = `<p class="no-results">No products found</p>`;
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
              ${discountedPrice
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

    if (!query) {
      renderProducts(categoryProducts);
      return;
    }

    const filtered = allProductsFromDB.filter(p =>
      p.name?.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query)
    );

    renderProducts(filtered);
  });

  loadCategoryProducts();
});