import axios from "axios";

// baseURL sin slash final
const BASE = (import.meta.env.VITE_API_BASE || "http://localhost:9494").replace(
  /\/$/,
  ""
);

const api = axios.create({ baseURL: BASE, timeout: 15000 });

// ➜ Adjunta token a cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ➜ Si el token expira, vuelve al login
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      if (location.pathname !== "/login") location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ───────────── Endpoints ─────────────
export const Auth = {
  login: (data) => api.post("/api/auth/login", data).then((r) => r.data),
};

export const Vehicles = {
  list: (showAll = false) =>
    api.get("/api/vehicles", { params: { showAll } }).then((r) => r.data),

  // 👇 crear con FormData (multipart)
  create: (dataOrFormData) => {
    if (dataOrFormData instanceof FormData) {
      return api
        .post("/api/vehicles", dataOrFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data);
    }
    // fallback JSON (sin imagen)
    return api.post("/api/vehicles", dataOrFormData).then((r) => r.data);
  },

  // reemplazar imagen
  uploadImage: (id, file) => {
    const fd = new FormData();
    fd.append("image", file);
    return api
      .patch(`/api/vehicles/${id}/image`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  markSold: (id, data) =>
    api.patch(`/api/vehicles/${id}/sell`, data).then((r) => r.data),
};

export const Expenses = {
  list: (vehicleId) =>
    api.get("/api/expenses", { params: { vehicleId } }).then((r) => r.data),
  create: (data) => api.post("/api/expenses", data).then((r) => r.data),
  remove: (id) => api.delete(`/api/expenses/${id}`).then((r) => r.data),
  summary: () => api.get("/api/expenses/summary").then((r) => r.data),
};

export const Metrics = {
  get: (params = {}) => api.get("/api/metrics", { params }).then((r) => r.data),
};

export default api;
