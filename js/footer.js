document.addEventListener("DOMContentLoaded", () => {
  fetch("/html/footer.html")
    .then(res => {
      if (!res.ok) {
        throw new Error("Footer fetch failed");
      }
      return res.text();
    })
    .then(html => {
      const footerPlaceholder = document.getElementById("footer-placeholder");
      if (!footerPlaceholder) return;

      footerPlaceholder.innerHTML = html;
    })
    .catch(err => {
      console.error("❌ Footer error:", err);
    });
});
