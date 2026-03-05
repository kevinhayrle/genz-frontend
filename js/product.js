/* =========================================
   GET PRODUCT ID
========================================= */

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

let selectedSize = null;
let uploadedImageUrl = null;

/* =========================================
   LOAD PRODUCT
========================================= */

async function loadProduct() {

  if (!productId) return;
  document.getElementById("product-name").textContent = "Loading...";
  try {

    const res = await fetch(`${window.BASE_API}/products/${productId}`);
    const product = await res.json();

    renderProduct(product);

  } catch (err) {
    console.error("Failed to load product:", err);
   document.getElementById("product-name").textContent = "Failed to load product";
  }

}

loadProduct();

/* =========================================
   RENDER PRODUCT
========================================= */

function renderProduct(product) {

  document.title = `Genz | ${product.name}`;

  document.getElementById("product-name").textContent = product.name;
  document.getElementById("product-description").textContent =
    product.description || "";

  updatePrice(product.price, product.discounted_price);

  renderImages(product);

  renderSizes(product.sizes);

  setupAddToCart(product);
}

/* =========================================
   PRICE UI
========================================= */

function updatePrice(price, discounted) {

  const priceEl = document.getElementById("product-price");

  if (discounted) {

    priceEl.innerHTML = `
      <span class="old-price">₹${price}</span>
      <span class="new-price">₹${discounted}</span>
    `;

  } else {

    priceEl.innerHTML = `<span class="new-price">₹${price}</span>`;

  }

}

/* =========================================
   IMAGE GALLERY
========================================= */

function renderImages(product) {
  const mainImage = document.getElementById("product-image");
  const extraImages = document.getElementById("extra-images");

  mainImage.src = product.image_url;
  extraImages.innerHTML = "";

  // ✅ Only extra images, not the main one
  const images = product.extra_images || [];

  images.forEach(url => {
    const img = document.createElement("img");
    img.src = url;
    img.className = "extra-image";
    img.onclick = () => { mainImage.src = url; };
    extraImages.appendChild(img);
  });
}

/* =========================================
   SIZE OPTIONS
========================================= */

function renderSizes(sizes) {

  const container = document.getElementById("size-options");

  if (!sizes || sizes.length === 0) {
    container.innerHTML = "<p>No sizes available</p>";
    return;
  }

  container.innerHTML = "";

  sizes.forEach(size => {

    const btn = document.createElement("button");
    btn.className = "size-btn";
    btn.textContent = size;

    btn.onclick = () => {

      document.querySelectorAll(".size-btn")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");

      selectedSize = size;

      document.getElementById("size-error").style.display = "none";
    };

    container.appendChild(btn);

  });

}

/* =========================================
   CUSTOM FIT IMAGE UPLOAD
========================================= */

const customImageInput = document.getElementById("custom-fit-image");
const statusText = document.getElementById("custom-fit-status");
const loader = document.getElementById("upload-loader");

customImageInput?.addEventListener("change", async function () {

  const file = this.files[0];

  if (!file) return;

  loader.style.display = "block";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "genz_upload");

  try {

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await res.json();

    uploadedImageUrl = data.secure_url;

    statusText.textContent = "Image uploaded successfully";

  } catch (err) {

    console.error("Upload failed", err);
    statusText.textContent = "Upload failed";

  }

  loader.style.display = "none";

});

/* =========================================
   ADD TO CART
========================================= */

function setupAddToCart(product) {

  const btn = document.querySelector(".add-to-cart");

  btn.onclick = () => {

    if (!selectedSize) {

      document.getElementById("size-error").style.display = "block";
      return;

    }

    const customNote = document.getElementById("custom-fit-text").value;

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.push({

      product_id: product.id,
      name: product.name,
      price: product.discounted_price || product.price,
      image: product.image_url,
      size: selectedSize,
      custom_fit_note: customNote,
      custom_fit_image: uploadedImageUrl,
      quantity: 1

    });

    localStorage.setItem("cart", JSON.stringify(cart));

    if (window.updateCartCount) {
      window.updateCartCount();
    }

    alert("Product added to cart");

  };

}