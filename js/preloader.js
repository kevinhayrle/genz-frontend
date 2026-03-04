window.addEventListener("load", function () {
  const preloader = document.getElementById("preloader");

  setTimeout(() => {
    preloader.style.opacity = "0";
    preloader.style.transition = "opacity 0.4s ease";

    setTimeout(() => {
      preloader.style.display = "none";
    }, 400);

  }, 300);
});