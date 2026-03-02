/**
 * Google Apps Script — Donate Tracker Backend
 *
 * วิธี Deploy:
 * 1. ไปที่ Google Sheet: https://docs.google.com/spreadsheets/d/1Zo3Os3F53-EKJ0_4SrMxJxa9nY8baz3yBcl-yrY2oXo/edit
 * 2. เมนู ส่วนขยาย > Apps Script
 * 3. ลบโค้ดเดิมทั้งหมด แล้ววางโค้ดนี้
 * 4. กด Deploy > New deployment
 * 5. เลือก Type: Web app
 * 6. Execute as: Me (ตัวคุณเอง)
 * 7. Who has access: Anyone
 * 8. กด Deploy
 * 9. Copy URL มาใส่ใน .env → VITE_GAS_URL=<URL>
 */

const SPREADSHEET_ID = "1Zo3Os3F53-EKJ0_4SrMxJxa9nY8baz3yBcl-yrY2oXo";

function getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheetByName(name);
}

// === CORS Helper ===
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

// === GET Handler ===
function doGet(e) {
  const action = e.parameter.action;

  try {
    switch (action) {
      case "getDonations":
        return createJsonResponse(getDonations());
      case "getDashboard":
        return createJsonResponse(getDashboard());
      case "getUsers":
        return createJsonResponse(getUsers());
      default:
        return createJsonResponse({
          success: false,
          error: "Unknown action: " + action,
        });
    }
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  }
}

// === POST Handler ===
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    switch (action) {
      case "login":
        return createJsonResponse(login(body.username, body.password));
      case "addDonation":
        return createJsonResponse(addDonation(body.data));
      case "importDonations":
        return createJsonResponse(importDonations(body.data));
      case "addUser":
        return createJsonResponse(addUser(body.data));
      case "deleteUser":
        return createJsonResponse(deleteUser(body.username));
      case "changePassword":
        return createJsonResponse(
          changePassword(body.username, body.currentPassword, body.newPassword),
        );
      default:
        return createJsonResponse({
          success: false,
          error: "Unknown action: " + action,
        });
    }
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  }
}

// === Auth ===
function login(username, password) {
  if (!username || !password) {
    return { success: false, error: "กรุณากรอก username และ password" };
  }

  const sheet = getSheet("User");
  if (!sheet) {
    return {
      success: false,
      error: "ไม่พบ Sheet 'User' กรุณาตรวจสอบ Google Sheet",
    };
  }

  const data = sheet.getDataRange().getValues();

  // ✅ trim() ป้องกัน whitespace แอบซ่อน
  const inputUser = String(username).trim();
  const inputPass = String(password).trim();

  for (let i = 1; i < data.length; i++) {
    const sheetUser = String(data[i][0] || "").trim();
    const sheetPass = String(data[i][1] || "").trim();

    if (sheetUser === inputUser && sheetPass === inputPass) {
      const now = new Date().toISOString();
      sheet.getRange(i + 1, 3).setValue(now); // update last_login
      return {
        success: true,
        user: {
          username: sheetUser,
          lastLogin: now,
          created: data[i][3] || "",
        },
      };
    }
  }

  return { success: false, error: "Username หรือ Password ไม่ถูกต้อง" };
}

// === Debug Helper (รันใน GAS Editor เพื่อทดสอบ) ===
function testLogin() {
  const result = login("pong34811@gmail.com", "1234");
  Logger.log("Login result: " + JSON.stringify(result));

  const sheet = getSheet("User");
  if (!sheet) {
    Logger.log("❌ ไม่พบ Sheet 'User'");
    return;
  }
  const data = sheet.getDataRange().getValues();
  Logger.log("Sheet rows: " + data.length);
  Logger.log("Sheet data: " + JSON.stringify(data));
}

// === Seed User (รันครั้งเดียวเพื่อสร้าง user แรก) ===
function createFirstUser() {
  const sheet = getSheet("User");
  if (!sheet) {
    Logger.log("❌ ไม่พบ Sheet 'User'");
    return;
  }

  // เพิ่ม header ถ้ายังไม่มี
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["username", "password", "last_login", "created"]);
  }

  sheet.appendRow([
    "pong34811@gmail.com",
    "1234",
    "",
    Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyy-MM-dd HH:mm:ss"),
  ]);

  Logger.log("✅ สร้าง user สำเร็จ");
}

// === Date Helper ===
// ✅ รองรับทั้ง Date object (จาก Google Sheets) และ string หลายรูปแบบ
function formatDateSafe(raw) {
  if (!raw) return "";
  // ถ้าเป็น Date object จาก Google Sheets ให้ใช้ตรงๆ ได้เลย
  if (raw instanceof Date) {
    return Utilities.formatDate(raw, "Asia/Bangkok", "yyyy-MM-dd");
  }
  var str = String(raw).trim();
  // ถ้าเป็น YYYY-MM-DD อยู่แล้ว — return ตรงๆ
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.substring(0, 10);
  }
  // ถ้าเป็น DD/MM/YYYY (Thai format) — แปลงเองก่อน
  var dmy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dmy) {
    var d = parseInt(dmy[1]),
      m = parseInt(dmy[2]),
      y = parseInt(dmy[3]);
    return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d);
  }
  // fallback
  try {
    return Utilities.formatDate(new Date(str), "Asia/Bangkok", "yyyy-MM-dd");
  } catch (e) {
    return str;
  }
}

// === Donations ===
function getDonations() {
  const sheet = getSheet("Donate");
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return { success: true, data: [] };
  }

  const donations = [];
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0] && !data[i][2]) continue; // skip empty rows
    donations.push({
      id: i + 1,
      talent: data[i][0] || "",
      date: formatDateSafe(data[i][1]), // ✅ ใช้ helper
      name: data[i][2] || "",
      amount: parseFloat(data[i][3]) || 0,
      note: data[i][4] || "",
    });
  }

  return { success: true, data: donations.reverse() };
}

function addDonation(donation) {
  if (!donation) {
    return { success: false, error: "ไม่มีข้อมูล" };
  }

  const sheet = getSheet("Donate");
  sheet.appendRow([
    donation.talent || "",
    donation.date ||
      Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyy-MM-dd"),
    donation.name || "",
    parseFloat(donation.amount) || 0,
    donation.note || "",
  ]);

  return { success: true, message: "บันทึกสำเร็จ" };
}

function importDonations(items) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return { success: false, error: "ไม่มีข้อมูลสำหรับ import" };
  }

  const sheet = getSheet("Donate");
  let count = 0;

  for (const item of items) {
    sheet.appendRow([
      item.talent || "",
      item.date ||
        Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyy-MM-dd"),
      item.name || "",
      parseFloat(item.amount) || 0,
      item.note || "",
    ]);
    count++;
  }

  return {
    success: true,
    message: "นำเข้าสำเร็จ " + count + " รายการ",
    count: count,
  };
}

// === Dashboard ===
function getDashboard() {
  const sheet = getSheet("Donate");
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return {
      success: true,
      data: {
        totalAmount: 0,
        totalCount: 0,
        avgAmount: 0,
        todayAmount: 0,
        todayCount: 0,
        dailyStats: [],
        topDonors: [],
        recentDonations: [],
      },
    };
  }

  const today = Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyy-MM-dd");
  let totalAmount = 0;
  let todayAmount = 0;
  let todayCount = 0;
  const donorMap = {};
  const dailyMap = {};
  const allDonations = [];

  for (let i = 1; i < data.length; i++) {
    if (!data[i][0] && !data[i][2]) continue;

    const amount = parseFloat(data[i][3]) || 0;
    const dateStr = data[i][1]
      ? Utilities.formatDate(new Date(data[i][1]), "Asia/Bangkok", "yyyy-MM-dd")
      : "";
    const name = data[i][2] || "Anonymous";

    totalAmount += amount;

    // Today stats
    if (dateStr === today) {
      todayAmount += amount;
      todayCount++;
    }

    // Donor ranking
    if (!donorMap[name]) donorMap[name] = { name: name, total: 0, count: 0 };
    donorMap[name].total += amount;
    donorMap[name].count++;

    // Daily stats
    if (dateStr) {
      if (!dailyMap[dateStr])
        dailyMap[dateStr] = { date: dateStr, amount: 0, count: 0 };
      dailyMap[dateStr].amount += amount;
      dailyMap[dateStr].count++;
    }

    allDonations.push({
      talent: data[i][0] || "",
      date: dateStr,
      name: name,
      amount: amount,
      note: data[i][4] || "",
    });
  }

  const totalCount = allDonations.length;
  const avgAmount = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;

  // Top donors (sort by total desc, top 10)
  const topDonors = Object.values(donorMap)
    .sort(function (a, b) {
      return b.total - a.total;
    })
    .slice(0, 10);

  // Daily stats (sort by date)
  const dailyStats = Object.values(dailyMap).sort(function (a, b) {
    return a.date.localeCompare(b.date);
  });

  // Recent donations (latest 10)
  const recentDonations = allDonations.reverse().slice(0, 10);

  return {
    success: true,
    data: {
      totalAmount: totalAmount,
      totalCount: totalCount,
      avgAmount: avgAmount,
      todayAmount: todayAmount,
      todayCount: todayCount,
      dailyStats: dailyStats,
      topDonors: topDonors,
      recentDonations: recentDonations,
    },
  };
}

// === Users ===
function getUsers() {
  const sheet = getSheet("User");
  const data = sheet.getDataRange().getValues();

  const users = [];
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    users.push({
      username: data[i][0],
      lastLogin: data[i][2] || "",
      created: data[i][3] || "",
    });
  }

  return { success: true, data: users };
}

function addUser(userData) {
  if (!userData || !userData.username || !userData.password) {
    return { success: false, error: "กรุณากรอก username และ password" };
  }

  const sheet = getSheet("User");
  const data = sheet.getDataRange().getValues();

  // Check duplicate
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userData.username) {
      return { success: false, error: "Username นี้มีอยู่แล้ว" };
    }
  }

  sheet.appendRow([
    userData.username,
    userData.password,
    "",
    Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyy-MM-dd HH:mm:ss"),
  ]);

  return { success: true, message: "สร้างผู้ใช้สำเร็จ" };
}

function deleteUser(username) {
  if (!username) {
    return { success: false, error: "กรุณาระบุ username" };
  }

  const sheet = getSheet("User");
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === username) {
      sheet.deleteRow(i + 1);
      return { success: true, message: "ลบผู้ใช้สำเร็จ" };
    }
  }

  return { success: false, error: "ไม่พบผู้ใช้นี้" };
}

function changePassword(username, currentPassword, newPassword) {
  if (!username || !currentPassword || !newPassword) {
    return { success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  }

  const sheet = getSheet("User");
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const sheetUser = String(data[i][0] || "").trim();
    const sheetPass = String(data[i][1] || "").trim();

    if (sheetUser === String(username).trim()) {
      // ✅ ตรวจสอบรหัสผ่านปัจจุบันก่อน
      if (sheetPass !== String(currentPassword).trim()) {
        return { success: false, error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" };
      }
      // อัปเดตรหัสผ่านใหม่ (column B = index 2)
      sheet.getRange(i + 1, 2).setValue(String(newPassword).trim());
      return { success: true, message: "เปลี่ยนรหัสผ่านสำเร็จ" };
    }
  }

  return { success: false, error: "ไม่พบผู้ใช้นี้" };
}
