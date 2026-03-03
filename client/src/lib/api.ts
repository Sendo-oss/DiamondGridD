const API = "http://localhost:4000/api";
export const API_BASE = "http://localhost:4000";


function authHeaders() {
  const token = localStorage.getItem("dg_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchComponents(type?: string) {
  const url = type ? `${API}/components?type=${encodeURIComponent(type)}` : `${API}/components`;
  const r = await fetch(url);
  return r.json();
}

// ✅ Create con imagen (FormData)
export async function createComponent(form: FormData) {
  const r = await fetch(`${API}/components`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: form,
  });
  return r.json();
}

// ✅ Update con imagen (FormData)
export async function updateComponent(id: string, form: FormData) {
  const r = await fetch(`${API}/components/${id}`, {
    method: "PUT",
    headers: { ...authHeaders() },
    body: form,
  });
  return r.json();
}

export async function deleteComponent(id: string) {
  const r = await fetch(`${API}/components/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  return r.json();
}

export async function recommendBuild(payload: {
  budget: number;
  purpose: "gaming" | "office" | "design" | "programming";
  preference?: "balanced" | "performance" | "cheap";
}) {
  const r = await fetch(`${API}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return r.json();
}

export async function authLogin(payload: { email: string; password: string }) {
  const r = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return r.json();
}

export async function authRegister(payload: { name: string; email: string; password: string }) {
  const r = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return r.json();
}

export async function fetchUsers() {
  const r = await fetch(`${API}/users`, { headers: { ...authHeaders() } });
  return r.json();
}

export async function updateUserRole(id: string, role: "admin" | "worker" | "user") {
  const r = await fetch(`${API}/users/${id}/role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ role }),
  });
  return r.json();
}

export async function adminSeed() {
  const r = await fetch(`${API}/seed`, { method: "POST", headers: { ...authHeaders() } });
  return r.json();
}

// (si no tienes la ruta reset en backend, puedes eliminar esta función o crear la ruta)
export async function adminResetComponents() {
  const r = await fetch(`${API}/admin/components/reset`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  return r.json();
}

export async function adminExportCSV() {
  const r = await fetch(`${API}/admin/components/export`, { headers: { ...authHeaders() } });
  const blob = await r.blob();
  return blob;
}
export async function updateComponentStock(id: string, delta: number) {
  const r = await fetch(`${API}/components/${id}/stock`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ delta }),
  });
  return r.json();
}

export async function updateComponentStatus(id: string, status: "active" | "inactive") {
  const r = await fetch(`${API}/components/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ status }),
  });
  return r.json();
}
export async function fetchComponentById(id: string) {
  const r = await fetch(`${API}/components/${id}`);
  return r.json();
}
export const patchStock = updateComponentStock;
export const patchStatus = updateComponentStatus;

export const changeComponentStock = updateComponentStock;
export const changeComponentStatus = updateComponentStatus;
export async function createOrder(payload: {
  method: "BANK_TRANSFER" | "DEPOSIT";
  bank: string;
  reference?: string;
  holderName?: string;
  notes?: string;
  items: Array<{ id: string; qty: number }>;
}) {
  const r = await fetch(`${API}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return r.json();
}

export async function uploadOrderReceipt(orderId: string, file: File) {
  const fd = new FormData();
  fd.append("receipt", file);
  const r = await fetch(`${API}/orders/${orderId}/receipt`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: fd,
  });
  return r.json();
}

export async function fetchMyOrders() {
  const r = await fetch(`${API}/orders/me`, { headers: { ...authHeaders() } });
  return r.json();
}
export async function authGoogle(idToken: string) {
  const r = await fetch(`${API}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  return r.json();
}
