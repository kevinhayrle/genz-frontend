window.addEventListener("load", () => {
  const loader = document.getElementById("preloader");
  setTimeout(() => {
    loader.style.opacity = "0";
    setTimeout(() => (loader.style.display = "none"), 600);
  }, 1000);
});

const cart = JSON.parse(localStorage.getItem("cart") || "[]");
const finalAmount = localStorage.getItem("finalAmount");

const cartItemsEl = document.getElementById("cart-items");
const totalAmountEl = document.getElementById("total-amount");
const form = document.getElementById("checkout-form");

cartItemsEl.innerHTML = "";

cart.forEach(item => {
  const li = document.createElement("li");

  li.innerHTML = `
    <strong>${item.name}</strong><br>
    ${item.color ? `
      <span style="
        display:inline-block;
        width:10px;
        height:10px;
        border-radius:50%;
        background:${item.color.hex};
        margin-right:6px;
      "></span><br>` : ""}
    ${item.quality ? `Quality: ${item.quality}<br>` : ""}
    Qty: ${item.quantity} ${item.unit}<br>
    ₹${item.price} × ${item.quantity}
  `;

  cartItemsEl.appendChild(li);
});

let total = finalAmount
  ? Number(finalAmount)
  : cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

totalAmountEl.textContent = total;

form.addEventListener("submit", async e => {
  e.preventDefault();

  if (!cart.length) {
    alert("Cart is empty");
    return;
  }

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();

  const totalInPaisa = Math.max(100, Math.round(total * 100));

  const orderRes = await fetch(
    `${window.BASE_API}/checkout/create-order`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ total_amount: totalInPaisa })
    }
  );

  const orderData = await orderRes.json();

  const options = {
    key: "rzp_live_ypzGdjBX41LSWB",
    amount: orderData.amount,
    currency: "INR",
    name: "Anis Boutique",
    description: "Order Payment",
    order_id: orderData.id,

    handler: async function (response) {
      const finalOrder = {
        customer: { name, email, phone, address },
        cart,
        payment_id: response.razorpay_payment_id,
        total_amount: totalInPaisa
      };

      const res = await fetch(
        `${window.BASE_API}/checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalOrder)
        }
      );

      if (res.ok) {
        localStorage.removeItem("cart");
        localStorage.removeItem("finalAmount");
        window.location.href = "/html/order-success.html";
      } else {
        alert("Payment done, but order saving failed.");
      }
    },

    prefill: { name, email, contact: phone },
    theme: { color: "#01381C" }
  };

  new Razorpay(options).open();
});
