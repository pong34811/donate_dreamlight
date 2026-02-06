import { useState } from 'react';
import { formatDate } from '../services/googleSheets';

// รายชื่อ Talent
const TALENT_OPTIONS = [
    'Hoshi_1489',
    'Kael',
    'Aomikung',
    'Armigon',
    'Laffey Nilvalen'
];

/**
 * DonateForm Component
 * ฟอร์มสำหรับกรอกข้อมูลโดเนท
 */
const DonateForm = ({ onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        talent: '',
        name: '',
        amount: '',
        note: '',
        date: formatDate()
    });
    const [errors, setErrors] = useState({});

    // จัดการการเปลี่ยนแปลงข้อมูลในฟอร์ม
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // ลบ error เมื่อผู้ใช้เริ่มพิมพ์
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // ตรวจสอบความถูกต้องของข้อมูล
    const validateForm = () => {
        const newErrors = {};

        if (!formData.talent) {
            newErrors.talent = 'กรุณาเลือกทาเลน';
        }

        if (!formData.name.trim()) {
            newErrors.name = 'กรุณากรอกชื่อผู้โดเนท';
        }

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'กรุณากรอกจำนวนเงินที่ถูกต้อง';
        }

        if (!formData.date) {
            newErrors.date = 'กรุณาเลือกวันที่';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // จัดการการ submit ฟอร์ม
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const donationData = {
            ...formData,
            amount: parseFloat(formData.amount)
        };

        const success = await onSubmit(donationData);

        // Reset form หาก submit สำเร็จ
        if (success) {
            setFormData({
                talent: '',
                name: '',
                amount: '',
                note: '',
                date: formatDate()
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Talent Selection */}
            <div className="space-y-2">
                <label
                    htmlFor="talent"
                    className="block text-sm font-medium text-gray-300"
                >
                    เลือกทาเลน <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                        </svg>
                    </span>
                    <select
                        id="talent"
                        name="talent"
                        value={formData.talent}
                        onChange={handleChange}
                        disabled={isLoading}
                        className={`w-full pl-12 pr-10 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 appearance-none
              transition-all duration-300 focus:bg-white/10 cursor-pointer
              ${errors.talent ? 'border-red-500' : 'border-white/10 hover:border-white/20 focus:border-purple-500'}`}
                    >
                        <option value="" disabled className="bg-gray-800 text-gray-500">เลือกทาเลน...</option>
                        {TALENT_OPTIONS.map((talent) => (
                            <option key={talent} value={talent} className="bg-gray-800 text-white">
                                {talent}
                            </option>
                        ))}
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </span>
                </div>
                {errors.talent && (
                    <p className="text-red-400 text-sm animate-fade-in-up">{errors.talent}</p>
                )}
            </div>

            {/* ชื่อผู้โดเนท */}
            <div className="space-y-2">
                <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-300"
                >
                    ชื่อผู้โดเนท <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="ใส่ชื่อผู้โดเนท..."
                        disabled={isLoading}
                        className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 
              transition-all duration-300 focus:bg-white/10
              ${errors.name ? 'border-red-500' : 'border-white/10 hover:border-white/20 focus:border-purple-500'}`}
                    />
                </div>
                {errors.name && (
                    <p className="text-red-400 text-sm animate-fade-in-up">{errors.name}</p>
                )}
            </div>

            {/* จำนวนเงิน */}
            <div className="space-y-2">
                <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-gray-300"
                >
                    จำนวนเงิน (บาท) <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                    </span>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        disabled={isLoading}
                        className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 
              transition-all duration-300 focus:bg-white/10
              ${errors.amount ? 'border-red-500' : 'border-white/10 hover:border-white/20 focus:border-purple-500'}`}
                    />
                </div>
                {errors.amount && (
                    <p className="text-red-400 text-sm animate-fade-in-up">{errors.amount}</p>
                )}
            </div>

            {/* วันที่ */}
            <div className="space-y-2">
                <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-300"
                >
                    วันที่ <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                    </span>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        disabled={isLoading}
                        className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white 
              transition-all duration-300 focus:bg-white/10
              ${errors.date ? 'border-red-500' : 'border-white/10 hover:border-white/20 focus:border-purple-500'}`}
                    />
                </div>
                {errors.date && (
                    <p className="text-red-400 text-sm animate-fade-in-up">{errors.date}</p>
                )}
            </div>

            {/* หมายเหตุ */}
            <div className="space-y-2">
                <label
                    htmlFor="note"
                    className="block text-sm font-medium text-gray-300"
                >
                    หมายเหตุ / รายละเอียด
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-4 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                    </span>
                    <textarea
                        id="note"
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)..."
                        rows={3}
                        disabled={isLoading}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 
              transition-all duration-300 hover:border-white/20 focus:border-purple-500 focus:bg-white/10 resize-none"
                    />
                </div>
            </div>

            {/* ปุ่ม Submit */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-4 rounded-xl font-semibold text-white text-lg
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          flex items-center justify-center gap-3"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>กำลังบันทึก...</span>
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                        </svg>
                        <span>บันทึกโดเนท</span>
                    </>
                )}
            </button>
        </form>
    );
};

export default DonateForm;
