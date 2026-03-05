document.addEventListener("DOMContentLoaded", () => {

  const searchInput = document.getElementById("searchInput");
  const resultsGrid = document.getElementById("resultsGrid");
  const statusText = document.getElementById("statusText");

  if (!searchInput || !resultsGrid || !statusText) return;

  const params = new URLSearchParams(window.location.search);
  const categoryFilter = params.get("category") || "";

  let allProducts = [];
  let allProductsFromDB = [];

  function showSkeletons() {
    resultsGrid.innerHTML = "";
    const grid = document.createElement("div");
    grid.className = "category-products";
    for (let i = 0; i < 8; i++) {
      const skeleton = document.createElement("div");
      skeleton.className = "result-card skeleton-card";
      skeleton.innerHTML = `
        <div class="skeleton-image"></div>
        <div class="skeleton-info">
          <div class="skeleton-line skeleton-name"></div>
          <div class="skeleton-line skeleton-price"></div>
        </div>
      `;
      grid.appendChild(skeleton);
    }
    resultsGrid.appendChild(grid);
  }

  async function fetchProducts() {
    try {
      showSkeletons();
      statusText.textContent = "";

      const response = await fetch(window.API_ENDPOINTS.PRODUCTS);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);

      const data = await response.json();
      allProductsFromDB = Array.isArray(data) ? data : data.products || [];

      allProducts = categoryFilter
        ? allProductsFromDB.filter(p =>
            p.category?.toLowerCase() === categoryFilter.toLowerCase()
          )
        : [...allProductsFromDB];

      if (!allProducts.length) {
        resultsGrid.innerHTML = "";
        statusText.textContent = "No products available";
        return;
      }

      renderProducts(allProducts);
      statusText.textContent = categoryFilter
        ? categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)
        : "Browse or search products";

    } catch (error) {
      console.error("Fetch error:", error);
      resultsGrid.innerHTML = "";
      statusText.textContent = "Failed to load products";
    }
  }

  function renderProducts(products) {
    resultsGrid.innerHTML = "";

    const grid = document.createElement("div");
    grid.className = "category-products";

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
      card.className = "result-card";

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

      grid.appendChild(card);
    });

    resultsGrid.appendChild(grid);
  }

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();

    if (!query) {
      renderProducts(allProducts);
      statusText.textContent = categoryFilter
        ? categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)
        : "Browse or search products";
      return;
    }

    const filtered = allProductsFromDB.filter(product =>
      product.name?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query)
    );

    if (!filtered.length) {
      resultsGrid.innerHTML = "";
      statusText.textContent = "No results found";
      return;
    }

    renderProducts(filtered);
    statusText.textContent = `${filtered.length} result(s) found`;
  });

  fetchProducts();
});