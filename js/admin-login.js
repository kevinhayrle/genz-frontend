const API = window.API_ENDPOINTS;

document
  .getElementById('admin-login-form')
  .addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('error-msg');

    errorMsg.textContent = "";
    errorMsg.style.display = "block";

    try {
      const res = await fetch(API.ADMIN_LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.status !== 200 || !data.token) {
        errorMsg.textContent =
          data.message || "Invalid email or password";
        return;
      }

      localStorage.setItem('adminToken', data.token);
      window.location.href = 'admin-dashboard.html';

    } catch (err) {
      errorMsg.textContent = "Server error. Please try again.";
      console.error(err);
    }
  });
