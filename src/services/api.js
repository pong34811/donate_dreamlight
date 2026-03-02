/**
 * API Service — เชื่อมต่อ Google Apps Script Backend
 */

const GAS_URL = import.meta.env.VITE_GAS_URL;
const TIMEOUT_MS = 30000; // 30 วินาที

// ✅ Abort controller สำหรับ timeout
function fetchWithTimeout(url, options = {}, timeout = TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  );
}

// ✅ Core fetch function
async function fetchGAS(action, options = {}) {
  const { method = "GET", body = null, params = {} } = options;

  try {
    let url = GAS_URL;
    let fetchOptions = {};

    if (method === "GET") {
      // ✅ รองรับ query params เพิ่มเติมนอกจาก action
      const queryParams = new URLSearchParams({ action, ...params });
      url += `?${queryParams.toString()}`;
      fetchOptions = { method: "GET" };
    } else {
      // ✅ POST ส่ง JSON พร้อม action รวมกัน
      fetchOptions = {
        method: "POST",
        headers: { "Content-Type": "text/plain" }, // GAS ต้องการ text/plain เพื่อหลีกเลี่ยง CORS preflight
        body: JSON.stringify({ action, ...body }),
      };
    }

    const response = await fetchWithTimeout(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("หมดเวลาการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
    }
    console.error(`API Error [${action}]:`, error);
    throw error;
  }
}

// === Auth ===
export const apiLogin = (username, password) =>
  fetchGAS("login", { method: "POST", body: { username, password } });

// === Donations ===
export const apiGetDonations = (params = {}) =>
  fetchGAS("getDonations", { params }); // ✅ รองรับ filter เช่น { search, page }

export const apiAddDonation = (data) =>
  fetchGAS("addDonation", { method: "POST", body: { data } });

export const apiImportDonations = (data) =>
  fetchGAS("importDonations", { method: "POST", body: { data } });

// === Dashboard ===
export const apiGetDashboard = () => fetchGAS("getDashboard");

// === Users ===
export const apiGetUsers = () => fetchGAS("getUsers");

export const apiAddUser = (data) =>
  fetchGAS("addUser", { method: "POST", body: { data } });

export const apiDeleteUser = (username) =>
  fetchGAS("deleteUser", { method: "POST", body: { username } });

export const apiChangePassword = (username, currentPassword, newPassword) =>
  fetchGAS("changePassword", {
    method: "POST",
    body: { username, currentPassword, newPassword },
  });

// === Utilities ===
export const formatCurrency = (amount) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount ?? 0);

export const formatNumber = (num) =>
  new Intl.NumberFormat("th-TH").format(num ?? 0);
