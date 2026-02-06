/**
 * Google Sheets API Service with OAuth2
 * ใช้สำหรับเชื่อมต่อและจัดการข้อมูลจาก Google Sheets
 */

// Configuration
const SPREADSHEET_ID = '1w5rrv96QXCj4LxjUzq4VkpJ98D_KyoNbBxdeujvwwCA';
const SHEET_NAME = 'Donate';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';

// API Endpoints
const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

// Token storage
let accessToken = null;
let tokenClient = null;
let gapiInited = false;
let g_isInited = false;

// Local Storage Keys
const STORAGE_KEY_TOKEN = 'donate_app_token';
const STORAGE_KEY_EXPIRY = 'donate_app_token_expiry';

// --- Local Storage Helpers ---
const saveToken = (tokenResponse) => {
    const expiresIn = tokenResponse.expires_in; // seconds
    const expiryTime = new Date().getTime() + (expiresIn * 1000);
    localStorage.setItem(STORAGE_KEY_TOKEN, tokenResponse.access_token);
    localStorage.setItem(STORAGE_KEY_EXPIRY, expiryTime.toString());
    accessToken = tokenResponse.access_token;
};

const loadToken = () => {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const expiry = localStorage.getItem(STORAGE_KEY_EXPIRY);

    if (token && expiry) {
        if (new Date().getTime() < parseInt(expiry)) {
            accessToken = token;
            return true;
        } else {
            // Token expired
            clearToken();
        }
    }
    return false;
};

const clearToken = () => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_EXPIRY);
    accessToken = null;
};

/**
 * Initialize Google Identity Services
 * @returns {Promise<void>}
 */
export const initGoogleAuth = () => {
    return new Promise((resolve, reject) => {
        // Load Google Identity Services script
        if (window.google?.accounts?.oauth2) {
            g_isInited = true;
            // Initialize Token Client
            tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: (response) => {
                    if (response.error !== undefined) {
                        console.error('Error requesting token:', response);
                        return; // Do not throw here, let the specific request handle it
                    }
                    // Save token to local storage
                    if (response.access_token) {
                        saveToken(response);
                    }
                },
            });

            // Try to load existing token
            loadToken();
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            g_isInited = true;

            // Initialize Token Client
            tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: (response) => {
                    if (response.error !== undefined) {
                        console.error('Error requesting token:', response);
                        return; // Do not throw here, let the specific request handle it
                    }
                    // Save token to local storage
                    if (response.access_token) {
                        saveToken(response);
                    }
                },
            });

            // Try to load existing token
            loadToken();

            resolve();
        };
        script.onerror = (err) => reject(err);
        document.head.appendChild(script);
    });
};

/**
 * Request access token (will show Google sign-in popup)
 * @returns {Promise<string>} Access token
 */
export const requestAccessToken = () => {
    return new Promise((resolve, reject) => {
        if (!tokenClient) {
            reject(new Error('Google Auth not initialized'));
            return;
        }

        // Check if we already have a valid token
        if (loadToken()) {
            resolve(accessToken);
            return;
        }

        // Update callback to resolve promise and save token
        tokenClient.callback = (response) => {
            if (response.error !== undefined) {
                reject(response);
                return;
            }
            if (response.access_token) {
                saveToken(response);
                resolve(response.access_token);
            } else {
                reject(new Error('No access token received'));
            }
        };

        // Request token
        tokenClient.requestAccessToken({ prompt: 'consent' });
    });
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
    return loadToken();
};

/**
 * Sign out
 */
export const signOut = () => {
    const currentAccessToken = accessToken; // Store current token before clearing
    clearToken();
    if (window.google && currentAccessToken) {
        window.google.accounts.oauth2.revoke(currentAccessToken, () => {
            console.log('Access token revoked');
        });
    }
};

/**
 * Get current access token
 * @returns {string|null}
 */
export const getAccessToken = () => accessToken;

/**
 * ดึงข้อมูลโดเนททั้งหมดจาก Google Sheets
 * @returns {Promise<Array>} รายการโดเนท
 */
export const fetchDonations = async () => {
    try {
        const range = `${SHEET_NAME}!A2:E`; // A=Talent, B=Date, C=Name, D=Amount, E=Note
        const url = `${SHEETS_API_BASE}/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}`;

        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to fetch donations');
        }

        const data = await response.json();
        const values = data.values || [];

        // แปลงข้อมูลเป็น object array และเรียงจากล่าสุดไปเก่าสุด
        const donations = values.map((row, index) => ({
            id: index + 2, // Row number ใน Sheet (เริ่มจาก 2)
            talent: row[0] || '',
            date: row[1] || '',
            name: row[2] || '',
            amount: parseFloat(row[3]) || 0,
            note: row[4] || ''
        }));

        // เรียงจากล่าสุดไปเก่าสุด (reverse order)
        return donations.reverse();
    } catch (error) {
        console.error('Error fetching donations:', error);
        throw error;
    }
};

/**
 * เพิ่มข้อมูลโดเนทใหม่ลง Google Sheets (ต้อง authenticate ก่อน)
 * @param {Object} donation - ข้อมูลโดเนท
 * @param {string} donation.talent - ชื่อทาเลน
 * @param {string} donation.date - วันที่
 * @param {string} donation.name - ชื่อผู้โดเนท
 * @param {number} donation.amount - จำนวนเงิน
 * @param {string} donation.note - หมายเหตุ
 * @returns {Promise<Object>} ผลลัพธ์การบันทึก
 */
export const appendDonation = async (donation) => {
    try {
        // ตรวจสอบว่ามี access token หรือไม่
        if (!accessToken) {
            // ถ้ายังไม่มี ให้ request token ใหม่
            await requestAccessToken();
        }

        const range = `${SHEET_NAME}!A:E`;
        const url = `${SHEETS_API_BASE}/${SPREADSHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

        const values = [[
            donation.talent,
            donation.date,
            donation.name,
            donation.amount.toString(),
            donation.note
        ]];

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                values: values
            })
        });

        if (!response.ok) {
            const errorData = await response.json();

            // ถ้า token หมดอายุ ให้ request ใหม่
            if (response.status === 401) {
                accessToken = null;
                throw new Error('กรุณาเข้าสู่ระบบใหม่');
            }

            throw new Error(errorData.error?.message || 'Failed to append donation');
        }

        return await response.json();
    } catch (error) {
        console.error('Error appending donation:', error);
        throw error;
    }
};

/**
 * คำนวณยอดเงินรวมจากรายการโดเนท
 * @param {Array} donations - รายการโดเนท
 * @returns {number} ยอดเงินรวม
 */
export const calculateTotalAmount = (donations) => {
    return donations.reduce((total, donation) => total + (donation.amount || 0), 0);
};

/**
 * Format ตัวเลขเป็นสกุลเงินบาท
 * @param {number} amount - จำนวนเงิน
 * @returns {string} ตัวเลขที่ format แล้ว
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
};

/**
 * Format วันที่เป็น YYYY-MM-DD
 * @param {Date} date - วันที่
 * @returns {string} วันที่ในรูปแบบ YYYY-MM-DD
 */
export const formatDate = (date = new Date()) => {
    return date.toISOString().split('T')[0];
};

/**
 * Format วันที่แบบไทย
 * @param {string} dateString - วันที่ในรูปแบบ YYYY-MM-DD
 * @returns {string} วันที่ในรูปแบบไทย
 */
export const formatThaiDate = (dateString) => {
    if (!dateString) return '-';

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return dateString;
    }
};
