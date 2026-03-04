const API = window.API_ENDPOINTS;

/* =========================================
   GLOBAL CART COUNT FUNCTION
   (Accessible from any page)
========================================= */

window.updateCartCount = function () {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.length;

  const badge = document.querySelector("#cart-count");
  if (!badge) return;

  if (totalItems > 0) {
    badge.style.display = "inline-block";
    badge.textContent = totalItems;
  } else {
    badge.style.display = "none";
  }
};


/* =========================================
   LOAD HEADER
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  fetch("/html/header.html")
    .then(res => res.text())
    .then(html => {

      const headerPlaceholder =
        document.getElementById("header-placeholder");

      if (!headerPlaceholder) return;

      headerPlaceholder.innerHTML = html;

      /* ===== Update Cart Immediately ===== */
      window.updateCartCount();

      /* =====================================
         SIDEBAR / HAMBURGER
      ===================================== */

      const sidebar = document.getElementById("sidebar");
      const hamburger = document.getElementById("hamburger-icon");
      const categoryMenu = document.getElementById("category-menu");
      const header = document.querySelector("header.header-left");

      if (hamburger && sidebar) {
        hamburger.addEventListener("click", () => {
          sidebar.classList.toggle("active");
        });
      }

      if (sidebar) {
        sidebar.querySelectorAll("a").forEach(link => {
          link.addEventListener("click", () => {
            sidebar.classList.remove("active");
          });
        });
      }

      /* =====================================
         LOAD CATEGORIES
      ===================================== */

      if (categoryMenu && API?.CATEGORIES) {

        fetch(API.CATEGORIES)
          .then(res => res.json())
          .then(categories => {

            categoryMenu.innerHTML = "";

            categories.forEach(cat => {

              const a = document.createElement("a");
              a.href =
                `/html/category.html?cat=${encodeURIComponent(cat)}`;

              a.textContent = cat.toUpperCase();
              categoryMenu.appendChild(a);
            });
          })
          .catch(err =>
            console.error("❌ Category fetch failed:", err)
          );
      }

      /* =====================================
         HEADER SCROLL EFFECT
      ===================================== */

      window.addEventListener("scroll", () => {
        if (!header) return;

        if (window.scrollY > 8) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }
      });

    })
    .catch(err =>
      console.error("❌ Header fetch failed:", err)
    );
});