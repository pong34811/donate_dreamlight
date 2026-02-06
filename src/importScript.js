import { appendDonation, initGoogleAuth, requestAccessToken } from './services/googleSheets.js';

const mockData = {
    "results": [
        {
            "id": "cml2ej4sv005imi1gub2yya4p",
            "amount": 20,
            "status": "COMPLETED",
            "createdAt": "2026-01-31T14:22:58.831Z",
            "reference": "77ZJP22NHYA",
            "source": "STRIPE",
            "username": "seiryu",
            "message": "สวัสดีครับ"
        },
        {
            "id": "cml2ec7ht005cmi1gmx665sw4",
            "amount": 90,
            "status": "COMPLETED",
            "createdAt": "2026-01-31T14:17:35.729Z",
            "reference": "019c144ceb87734d851e949e03cf22b6c9q",
            "source": "VOUCHER_TRUEMONEY",
            "username": "Jaokun157",
            "message": "ในที่สุด🥹"
        },
        {
            "id": "cml2e9cmp0056mi1gxdjaigm7",
            "amount": 50,
            "status": "COMPLETED",
            "createdAt": "2026-01-31T14:15:22.417Z",
            "reference": "019c145c40d3702ab5e5c79e334d274077k",
            "source": "VOUCHER_TRUEMONEY",
            "username": "Katy404",
            "message": "เเจ้งทีมงานเเก้ไขปัญหาเเล้วนะจะ"
        },
        {
            "id": "cml2e4xcl0050mi1gugoedz08",
            "amount": 50,
            "status": "COMPLETED",
            "createdAt": "2026-01-31T14:11:55.990Z",
            "reference": "S8T7Y6P0LO",
            "source": "STRIPE",
            "username": "Jaokun157",
            "message": "ระวังนะครับคนดูไม่หลายใจแต่หลายจอ ใช่ครับผมด้วย"
        },
        {
            "id": "cml2d7fbd0042mi1gwkkq5fid",
            "amount": 20,
            "status": "COMPLETED",
            "createdAt": "2026-01-31T13:45:52.969Z",
            "reference": "9ATFRYNZVZM",
            "source": "STRIPE",
            "username": "Earth1711",
            "message": "ยินดีกับการเดบิวต์ด้วยนะคับ👋"
        },
        {
            "id": "cml2d61p1003ymi1grzz03qpa",
            "amount": 300,
            "status": "COMPLETED",
            "createdAt": "2026-01-31T13:44:48.661Z",
            "reference": "NW48D3HV12",
            "source": "STRIPE",
            "username": "FennicZo",
            "message": "โดเนทค่าขนมต้อนรับ debut ครับ =w="
        },
        {
            "id": "cml2d3rzm003mmi1gt544484m",
            "amount": 20,
            "status": "COMPLETED",
            "createdAt": "2026-01-31T13:43:02.771Z",
            "reference": "0179WUKP6W5B",
            "source": "STRIPE",
            "username": "Anonymous",
            "message": ""
        },
        {
            "id": "cml2d2xme003imi1g9xr785bc",
            "amount": 50,
            "status": "COMPLETED",
            "createdAt": "2026-01-31T13:42:23.414Z",
            "reference": "CA3476F80QQ",
            "source": "STRIPE",
            "username": "CODE",
            "message": "คนเยอะไปดีกว่า"
        },
        {
            "id": "cml2d0rub003emi1gbo7jdww7",
            "amount": 100,
            "status": "COMPLETED",
            "createdAt": "2026-01-31T13:40:42.611Z",
            "reference": "KHP8B0U3SPR",
            "source": "STRIPE",
            "username": "ชินะตัวปลอม",
            "message": "คิดตี้อ่ะเป็นแมว คิดถึงอีกแล้วอ่ะเป็นเธอ"
        },
        {
            "id": "cml2cyq060036mi1gwzp994cy",
            "amount": 20,
            "status": "COMPLETED",
            "createdAt": "2026-01-31T13:39:06.918Z",
            "reference": "C3PG299XE5",
            "source": "STRIPE",
            "username": "Anonymous",
            "message": ""
        },
        {
            "id": "cml2cu0b80032mi1gwqxr328a",
            "amount": 20,
            "status": "COMPLETED",
            "createdAt": "2026-01-31T13:35:26.997Z",
            "reference": "NU0KPHN2G9",
            "source": "STRIPE",
            "username": "Nic",
            "message": "สวัสดีครับ"
        },
        {
            "id": "cml2ayvqe002umi1g6avy2h9q",
            "amount": 20,
            "status": "COMPLETED",
            "createdAt": "2026-01-31T12:43:15.110Z",
            "reference": "6K6WAZW3PEX",
            "source": "STRIPE",
            "username": "hoshi1489",
            "message": ""
        },
        {
            "id": "cml0uft3r002qmi1gft0d4wn0",
            "amount": 20,
            "status": "COMPLETED",
            "createdAt": "2026-01-30T12:12:45.208Z",
            "reference": "0B9HMFWI6YA6",
            "source": "STRIPE",
            "username": "hoshi1489",
            "message": "กด"
        }
    ]
};

async function importData() {
    console.log('เริ่มนำเข้าข้อมูล...');

    // เรียงข้อมูลจากเก่าไปใหม่ (เพราะ append จะต่อท้าย)
    const sortedData = [...mockData.results].reverse();

    let count = 0;
    for (const item of sortedData) {
        try {
            const donation = {
                talent: 'Hoshi_1489',
                date: item.createdAt.split('T')[0], // เอาแค่วันที่ YYYY-MM-DD
                name: item.username,
                amount: item.amount,
                note: item.message || ''
            };

            await appendDonation(donation);
            count++;
            console.log(`[${count}/${sortedData.length}] บันทึกสำเร็จ: ${donation.name} - ${donation.amount} บาท`);

            // รอสักนิดเพื่อไม่ให้ยิง API เร็วเกินไป
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
            console.error(`บันทึกล้มเหลว (${item.username}):`, error);
        }
    }

    console.log(`\nเสร็จสิ้น! นำเข้าข้อมูลทั้งหมด ${count} รายการ`);
}

// เนื่องจากต้องรันใน browser context เพื่อใช้ Google Auth
// ผมจะ expose function นี้ให้ window object เพื่อให้คุณเรียกใช้ผ่าน console ได้
window.importMockData = importData;
console.log('Script loaded. Run "window.importMockData()" in console to start import.');
