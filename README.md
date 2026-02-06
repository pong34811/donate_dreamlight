# 💝 Donate Tracker - ระบบบันทึกยอดโดเนท

ระบบเว็บแอปพลิเคชันสำหรับจดบันทึกและติดตามยอดเงินโดเนท เชื่อมต่อกับ Google Sheets เป็นฐานข้อมูล

![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite)
![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-06B6D4?logo=tailwindcss)

## ✨ คุณสมบัติ

- 📝 **ฟอร์มกรอกข้อมูลโดเนท** - ชื่อ, จำนวนเงิน, หมายเหตุ, วันที่
- 📊 **ตารางแสดงรายการ** - แสดงข้อมูลจาก Google Sheets แบบ real-time
- 💰 **สรุปยอดรวม** - คำนวณยอดเงินรวมอัตโนมัติ
- 📱 **Responsive Design** - รองรับทุกขนาดหน้าจอ
- 🎨 **Premium UI/UX** - ออกแบบสวยงามด้วย Glassmorphism และ Animations

## 🚀 เริ่มต้นใช้งาน

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. ตั้งค่า Google Sheets API

#### สร้าง API Key
1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้างโปรเจคใหม่หรือเลือกโปรเจคที่มีอยู่
3. ไปที่ **APIs & Services > Library**
4. ค้นหาและเปิดใช้งาน **Google Sheets API**
5. ไปที่ **APIs & Services > Credentials**
6. คลิก **Create Credentials > API Key**
7. คัดลอก API Key ที่ได้

#### ตั้งค่า Environment Variables
```bash
# คัดลอก .env.example เป็น .env
cp .env.example .env

# แก้ไขไฟล์ .env และใส่ API Key
VITE_GOOGLE_API_KEY=YOUR_API_KEY_HERE
```

#### ตั้งค่า Google Sheets
1. เปิด Google Sheets ที่ต้องการใช้งาน (Spreadsheet ID: `1elTSvZaQRJCzzPLOlThLr8DVruFV8yDz`)
2. สร้าง Sheet ชื่อ `Donate`
3. สร้าง Header ในแถวที่ 1: `Date | Name | Amount | Note`
4. ตั้งค่าการแชร์ Sheet เป็น **Anyone with the link can view**

> ⚠️ **สำคัญ**: เพื่อให้สามารถ **เขียน** ข้อมูลลง Sheet ได้ คุณต้องใช้ OAuth 2.0 แทน API Key เพียงอย่างเดียว หรือใช้ Service Account ดูรายละเอียดในหัวข้อ "การตั้งค่าขั้นสูง"

### 3. รันโปรเจค

```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ http://localhost:5173

## 📁 โครงสร้างโปรเจค

```
donate-dreamlight/
├── src/
│   ├── components/
│   │   ├── DonateForm.jsx    # ฟอร์มกรอกข้อมูลโดเนท
│   │   ├── DonateTable.jsx   # ตารางแสดงรายการโดเนท
│   │   └── Toast.jsx         # การแจ้งเตือน
│   ├── services/
│   │   └── googleSheets.js   # จัดการ Google Sheets API
│   ├── App.jsx               # หน้าหลักของแอป
│   ├── main.jsx              # Entry point
│   └── index.css             # Tailwind CSS + Custom styles
├── .env                      # Environment variables (ไม่ commit)
├── .env.example              # ตัวอย่าง environment variables
├── index.html                # HTML template
├── vite.config.js            # Vite configuration
└── package.json              # Dependencies
```

## 🔧 การตั้งค่าขั้นสูง

### การใช้ Service Account (แนะนำสำหรับ Production)

เพื่อความปลอดภัยที่ดีกว่า ควรใช้ Backend Server เป็นตัวกลาง:

1. สร้าง Service Account ใน Google Cloud Console
2. ดาวน์โหลด credentials.json
3. สร้าง Backend API (Node.js/Express/etc.) เพื่อจัดการ authentication
4. เรียก Backend API จาก Frontend แทนการเรียก Google Sheets โดยตรง

### ข้อจำกัดของ API Key

- ⚠️ API Key เพียงอย่างเดียวสามารถ **อ่าน** ข้อมูลได้เท่านั้น
- สำหรับการ **เขียน** ข้อมูล ต้องใช้ OAuth 2.0 หรือ Service Account
- ไม่ควร expose API Key บน client-side ในโปรเจคจริง

## 🔒 ความปลอดภัย

- ❌ **อย่า** commit ไฟล์ `.env` ขึ้น Git
- ❌ **อย่า** เปิดเผย API Key ใน source code
- ✅ ใช้ `.env.example` เป็นตัวอย่างเท่านั้น
- ✅ ใช้ Backend Server เป็นตัวกลางในโปรเจคจริง

## 📜 License

MIT License - ใช้งานได้อย่างเสรี

---

Made with ❤️ by Donate Dreamlight Team
