const API = window.API_ENDPOINTS;
const token = localStorage.getItem("adminToken");

const productForm = document.getElementById("productForm");
const productList = document.getElementById("productList");
const couponForm = document.getElementById("couponForm");
const couponList = document.getElementById("couponList");

const nameInput = document.getElementById("name");
const descriptionInput = document.getElementById("description");
const categoryInput = document.getElementById("category");
const unitInput = document.getElementById("quantity_unit");
const priceInput = document.getElementById("price");
const discountedPriceInput = document.getElementById("discounted_price");
const colorsInput = document.getElementById("colors");
const imageInput = document.getElementById("image_url");
const extraImagesInput = document.getElementById("extraImages");

let editingId = null;

async function fetchProducts() {
  const res = await fetch(API.ADMIN_PRODUCTS, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const products = await res.json();
  productList.innerHTML = "";

  products.forEach(p => {
    const div = document.createElement("div");
    div.className = "product";
    div.dataset.id = p.id;

    div.innerHTML = `
      <div>
        <b>${p.name}</b><br>
        ${
          p.discounted_price
            ? `<s>₹${p.price}</s> ₹${p.discounted_price}`
            : `₹${p.price}`
        }
      </div>
      <div>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </div>
    `;

    productList.appendChild(div);
  });
}

productList.addEventListener("click", e => {
  const productDiv = e.target.closest(".product");
  if (!productDiv) return;

  const id = Number(productDiv.dataset.id);

  if (e.target.classList.contains("edit-btn")) {
    editProduct(id);
  }

  if (e.target.classList.contains("delete-btn")) {
    deleteProduct(id);
  }
});

async function editProduct(id) {
  try {
    const res = await fetch(`${API.ADMIN_PRODUCTS}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      alert("Failed to load product for editing");
      return;
    }

    const p = await res.json();
    editingId = id;

    nameInput.value = p.name ?? "";
    descriptionInput.value = p.description ?? "";
    categoryInput.value = p.category ?? "";
    unitInput.value = p.quantity_unit ?? "";
    priceInput.value = p.price ?? "";
    discountedPriceInput.value = p.discounted_price ?? "";
    colorsInput.value = Array.isArray(p.colors) ? p.colors.join(", ") : "";
    imageInput.value = p.image_url ?? "";
    extraImagesInput.value = Array.isArray(p.extra_images)
      ? p.extra_images.join(", ")
      : "";

    window.scrollTo({ top: 0, behavior: "smooth" });

  } catch (err) {
    console.error("Edit fetch error:", err);
    alert("Error loading product");
  }
}

productForm.addEventListener("submit", async e => {
  e.preventDefault();

  const payload = {
    name: nameInput.value.trim(),
    description: descriptionInput.value || null,
    category: categoryInput.value,
    quantity_unit: unitInput.value,
    price: Number(priceInput.value),
    discounted_price: discountedPriceInput.value || null,
    image_url: imageInput.value.trim(),
    colors: colorsInput.value
      ? colorsInput.value.split(",").map(c => c.trim().toLowerCase())
      : [],
    extra_images: extraImagesInput.value
      ? extraImagesInput.value.split(",").map(i => i.trim())
      : []
  };

  if (
    !payload.name ||
    isNaN(payload.price) ||
    payload.price < 0 ||
    !payload.image_url ||
    !payload.category ||
    !payload.quantity_unit
  ) {
    alert("Please fill all required fields.");
    return;
  }

  const url = editingId
    ? `${API.ADMIN_PRODUCTS}/${editingId}`
    : API.ADMIN_PRODUCTS;

  const method = editingId ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    alert("Failed to save product");
    return;
  }

  productForm.reset();
  editingId = null;
  fetchProducts();
});

async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;

  await fetch(`${API.ADMIN_PRODUCTS}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  fetchProducts();
}

couponForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    coupon_code: document.getElementById("coupon_code").value.trim(),
    discount_type: document
      .getElementById("discount_type")
      .value
      .toLowerCase(),
    discount_value: Number(
      document.getElementById("discount_value").value
    ),
    min_cart_value: Number(
      document.getElementById("min_cart_value").value
    ) || 0,
    max_discount: document.getElementById("max_discount").value
      ? Number(document.getElementById("max_discount").value)
      : null,
    expiry_date: document.getElementById("expiry_date").value
  };

  if (!payload.coupon_code || !payload.discount_value || !payload.expiry_date) {
    alert("Coupon code, discount value and expiry date are required");
    return;
  }

  const res = await fetch(API.ADD_COUPON, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Failed to add coupon");
    return;
  }

  couponForm.reset();
  fetchCoupons();
});

async function fetchCoupons() {
  const res = await fetch(API.ADMIN_COUPONS, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const coupons = await res.json();
  couponList.innerHTML = "";

  coupons.forEach(c => {
    const div = document.createElement("div");
    div.className = "coupon-item";

    div.innerHTML = `
      <span class="coupon-text">
        <b>${c.coupon_code}</b>
        (${c.discount_type.toLowerCase() === "percentage"
          ? `${c.discount_value}% OFF`
          : `₹${c.discount_value} OFF`})
      </span>
      <button
        class="coupon-delete-btn"
        onclick="deleteCoupon(${c.id})">
        Delete
      </button>
    `;

    couponList.appendChild(div);
  });
}

async function deleteCoupon(id) {
  if (!confirm("Delete this coupon?")) return;

  await fetch(API.DELETE_COUPON(id), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  fetchCoupons();
}

function logout() {
  localStorage.removeItem("adminToken");
  window.location.href = "admin-login.html";
}

fetchProducts();
fetchCoupons();
