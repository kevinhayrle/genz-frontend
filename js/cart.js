window.addEventListener("load", () => {
  const loader = document.getElementById("preloader");
  setTimeout(() => {
    loader.style.opacity = "0";
    setTimeout(() => (loader.style.display = "none"), 600);
  }, 1000);
});

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("cart-container");
  const grandTotalEl = document.getElementById("grand-total");
  const checkoutBtn = document.getElementById("checkout-btn");

  const couponInput = document.getElementById("coupon-input");
  const couponMessage = document.getElementById("coupon-message");
  const applyCouponBtn = document.getElementById("apply-coupon-btn");
  const availableCouponsEl = document.getElementById("available-coupons");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let originalTotal = 0;
  let finalTotal = 0;

  async function loadAvailableCoupons() {
    try {
      const res = await fetch(
        `${window.BASE_API}/coupons`
      );

      const coupons = await res.json();
      availableCouponsEl.innerHTML = "";

      if (!Array.isArray(coupons)) return;

      const today = new Date();

      coupons.forEach(c => {
        if (c.is_active === 0) return;
        if (c.expiry_date && new Date(c.expiry_date) < today) return;

        const chip = document.createElement("div");
        chip.className = "coupon-chip";
        chip.textContent = c.coupon_code;

        chip.onclick = () => {
          couponInput.value = c.coupon_code;
          applyCouponBtn.click();
        };

        availableCouponsEl.appendChild(chip);
      });
    } catch (err) {
      console.error("Coupon load failed", err);
    }
  }

  function updateCartUI() {
    container.innerHTML = "";
    originalTotal = 0;

    if (!cart.length) {
      container.innerHTML =
        "<p style='text-align:center'>Your cart is empty.</p>";
      checkoutBtn.style.display = "none";
      grandTotalEl.textContent = "";
      return;
    }

    cart.forEach((item, index) => {
      const lineTotal = Number(item.price) * Number(item.quantity);
      originalTotal += lineTotal;

      const div = document.createElement("div");
      div.className = "cart-item";

      div.innerHTML = `

        <div class="cart-details">
          <h3>${item.name}</h3>

      ${
  item.color
    ? `<div class="cart-color">
         <span class="color-dot" style="background:${item.color.hex}"></span>
         <span class="color-ref">${item.color.name}</span>
       </div>`
    : ""
}

          ${item.quality ? `<p>Quality: ${item.quality}</p>` : ""}

          <p>
            Quantity: ${item.quantity} ${item.unit}
          </p>

          <p class="price-line">
            ₹${item.price} × ${item.quantity}
            <strong>= ₹${lineTotal}</strong>
          </p>

          <button class="remove-btn" data-index="${index}">
            Remove
          </button>
        </div>
      `;

      container.appendChild(div);
    });

    finalTotal = originalTotal;
    grandTotalEl.textContent = `Grand Total: ₹${originalTotal}`;
    checkoutBtn.style.display = "block";
  }

container.addEventListener("click", e => {
  if (e.target.classList.contains("remove-btn")) {
    const index = e.target.dataset.index;
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartUI();
    updateCartCount(); 
  }
});

  applyCouponBtn.addEventListener("click", async () => {
    const code = couponInput.value.trim();
    if (!code) return;

    try {
      const res = await fetch(
        `${window.BASE_API}/coupons/apply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            coupon_code: code,
            cart_total: originalTotal
          })
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      finalTotal = data.final_total;
      couponMessage.style.color = "green";
      couponMessage.textContent = `Coupon applied! You saved ₹${data.discount}`;
      grandTotalEl.textContent = `Grand Total: ₹${finalTotal}`;

    } catch (err) {
      couponMessage.style.color = "red";
      couponMessage.textContent = err.message || "Invalid coupon";
    }
  });

  checkoutBtn.addEventListener("click", () => {
    localStorage.setItem("finalAmount", finalTotal);
    window.location.href = "checkout.html";
  });

  updateCartUI();
  loadAvailableCoupons();
});
