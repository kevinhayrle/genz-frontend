window.BASE_API = "https://anisboutique-backend-v97w.onrender.com/api";

window.API_ENDPOINTS = {
  PRODUCTS: `${window.BASE_API}/products`,
  CATEGORIES: `${window.BASE_API}/products/categories`,

  ADMIN_PRODUCTS: `${window.BASE_API}/admin/products`,
  ADMIN_COUPONS: `${window.BASE_API}/admin/coupons`,
  ADD_COUPON: `${window.BASE_API}/admin/coupons/add`,
  DELETE_COUPON: (id) => `${window.BASE_API}/admin/coupons/delete/${id}`,

  ADMIN_LOGIN: `${window.BASE_API}/admin/login`
};
