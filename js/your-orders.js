const ordersDiv = document.getElementById("orders");
const phoneInput = document.getElementById("phone");
const searchBtn = document.getElementById("searchBtn");

const ORDERS_API = `${window.BASE_API}/orders`;

searchBtn.addEventListener("click", async () => {
  const phone = phoneInput.value.trim();

  if (!phone || phone.length < 10) {
    alert("Please enter a valid phone number");
    return;
  }

  ordersDiv.innerHTML = "<p>Loading your orders...</p>";

  try {
    const res = await fetch(`${ORDERS_API}/${phone}`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      ordersDiv.innerHTML =
        '<p class="no-orders">No orders found for this number.</p>';
      return;
    }

    ordersDiv.innerHTML = "";

    data.forEach(order => {
      const orderCard = document.createElement("div");
      orderCard.className = "order-card";

      const formattedDate = new Date(order.created_at).toLocaleDateString();

      let itemsHTML = "";

      order.items.forEach(item => {
        itemsHTML += `
          <div class="item">
            <img
              src="${item.image_url}"
              alt="${item.name}"
              class="product-img"
            />
            <div class="item-details">
              <strong>${item.name}</strong>
              Price: ₹${item.price}<br/>
              Purchased on: ${formattedDate}
            </div>
          </div>
        `;
      });

      orderCard.innerHTML = `
        <div class="order-items">${itemsHTML}</div>
      `;

      ordersDiv.appendChild(orderCard);
    });

  } catch (err) {
    console.error(err);
    ordersDiv.innerHTML =
      '<p class="no-orders">Something went wrong. Please try again later.</p>';
  }
});
