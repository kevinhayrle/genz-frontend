document.addEventListener("DOMContentLoaded", () => {

  const searchInput = document.getElementById("searchInput");
  const resultsGrid = document.getElementById("resultsGrid");
  const statusText = document.getElementById("statusText");

  if (!searchInput || !resultsGrid || !statusText) {
    console.error("❌ Search DOM not found");
    return;
  }

  let allProducts = [];

  /* =========================================
     EXCLUDED CATEGORIES (NOT SEARCHABLE)
  ========================================= */

  const EXCLUDED_CATEGORIES = [
    "Lining",
    "Two by Two",
    "Silk Cotton",
    "Plain Net",
    "Poplin",
    "Suncrepe",
    "Falls",
    "Satin",
    "Inskirts"
  ];

  /* =========================================
     FETCH PRODUCTS
  ========================================= */

  async function fetchProducts() {
    try {
      statusText.textContent = "Loading products...";

      const response = await fetch(
        window.API_ENDPOINTS.PRODUCTS
      );

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      allProducts = Array.isArray(data) ? data : data.products || [];

      // 🔥 REMOVE MATERIALS + INSKIRTS
      allProducts = allProducts.filter(product =>
        !EXCLUDED_CATEGORIES.includes(product.category)
      );

      if (!allProducts.length) {
        statusText.textContent = "No products available";
        return;
      }

      renderProducts(allProducts);
      statusText.textContent = "Browse or search products";

    } catch (error) {
      console.error("Fetch error:", error);
      statusText.textContent = "Failed to load products";
    }
  }

  /* =========================================
     RENDER PRODUCTS
  ========================================= */

  function renderProducts(products) {
    resultsGrid.innerHTML = "";

    const grouped = {};
    products.forEach(product => {
      const category = product.category || "Others";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(product);
    });

    const sortedCategories = Object.keys(grouped).sort((a, b) => {
      if (a.toLowerCase() === "others") return 1;
      if (b.toLowerCase() === "others") return -1;
      return a.localeCompare(b);
    });

    sortedCategories.forEach(category => {
      const section = document.createElement("section");
      section.className = "category-section";

      section.innerHTML = `
        <h2 class="category-title">${category}</h2>
        <div class="category-products"></div>
      `;

      const grid = section.querySelector(".category-products");

      grouped[category].forEach(product => {
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

        grid.appendChild(card);
      });

      resultsGrid.appendChild(section);
    });
  }

  /* =========================================
     SEARCH FILTER
  ========================================= */

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();

    if (!query) {
      renderProducts(allProducts);
      statusText.textContent = "Browse or search products";
      return;
    }

    const filtered = allProducts.filter(product =>
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