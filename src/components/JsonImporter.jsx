import { useState } from 'react';
import { appendDonation } from '../services/googleSheets';

const TALENT_OPTIONS = [
    'Hoshi_1489',
    'Kael',
    'Aomikung',
    'Armigon',
    'Laffey Nilvalen'
];

const JsonImporter = ({ onImportSuccess }) => {
    const [jsonInput, setJsonInput] = useState('');
    const [selectedTalent, setSelectedTalent] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [status, setStatus] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleImport = async () => {
        if (!jsonInput.trim()) {
            setStatus('กรุณาวาง JSON');
            return;
        }
        if (!selectedTalent) {
            setStatus('กรุณาเลือกทาเลน');
            return;
        }

        try {
            setIsImporting(true);
            setStatus('กำลังตรวจสอบ JSON...');

            const parsedData = JSON.parse(jsonInput);
            const results = parsedData.data?.results || [];

            if (results.length === 0) {
                setStatus('ไม่พบข้อมูลใน JSON (data.results ว่างเปล่า)');
                setIsImporting(false);
                return;
            }

            setStatus(`พบข้อมูล ${results.length} รายการ กำลังเริ่มนำเข้า...`);

            // เรียงจากเก่าไปใหม่ เพื่อให้ append ต่อท้ายได้อย่างถูกต้องตามลำดับเวลา
            const sortedResults = [...results].reverse();

            let successCount = 0;
            for (let i = 0; i < sortedResults.length; i++) {
                const item = sortedResults[i];
                setStatus(`[${i + 1}/${sortedResults.length}] บันทึก: ${item.username}`);

                const donation = {
                    talent: selectedTalent,
                    date: item.createdAt ? item.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
                    name: item.username || 'Anonymous',
                    amount: parseFloat(item.amount) || 0,
                    note: item.message || ''
                };

                await appendDonation(donation);
                successCount++;

                // Delay เล็กน้อยป้องกัน Rate Limit
                await new Promise(r => setTimeout(r, 500));
            }

            setStatus(`นำเข้าสำเร็จครบ ${successCount} รายการ! 🎉`);
            setJsonInput('');
            if (onImportSuccess) onImportSuccess();

            // ปิดตัวเองหลังจากเสร็จสิ้น 3 วินาที
            setTimeout(() => {
                setIsOpen(false);
                setStatus('');
            }, 3000);

        } catch (error) {
            console.error('Import failed:', error);
            setStatus(`เกิดข้อผิดพลาด: ${error.message}`);
        } finally {
            setIsImporting(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 
                    border border-purple-500/30 text-purple-300 text-sm transition-all duration-200"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                Import JSON
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
            <div className="w-full max-w-2xl bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        Import JSON ข้อมูลย้อนหลัง
                    </h3>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                        disabled={isImporting}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Talent Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            เลือกทาเลน <span className="text-pink-400">*</span>
                        </label>
                        <select
                            value={selectedTalent}
                            onChange={(e) => setSelectedTalent(e.target.value)}
                            disabled={isImporting}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500"
                        >
                            <option value="" className="bg-gray-800">กรุณาเลือกทาเลน...</option>
                            {TALENT_OPTIONS.map(talent => (
                                <option key={talent} value={talent} className="bg-gray-800">{talent}</option>
                            ))}
                        </select>
                    </div>

                    {/* Action Buttons (Moved to Top) */}
                    <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                        <span className={`text-sm ${status.includes('ผิดพลาด') || status.includes('กรุณา') ? 'text-red-400' : 'text-green-400'}`}>
                            {status || 'พร้อมนำเข้าข้อมูล'}
                        </span>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsOpen(false)}
                                disabled={isImporting}
                                className="px-3 py-1.5 rounded-lg text-gray-300 hover:bg-white/5 transition-colors text-sm disabled:opacity-50"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={isImporting || !jsonInput || !selectedTalent}
                                className="btn-primary px-4 py-1.5 rounded-lg text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isImporting && (
                                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {isImporting ? 'กำลังนำเข้า...' : 'เริ่ม Import'}
                            </button>
                        </div>
                    </div>

                    {/* JSON Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            วางโค้ด JSON <span className="text-pink-400">*</span>
                        </label>
                        <textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            placeholder='{ "data": { "results": [...] } }'
                            rows={6}
                            className="w-full p-4 bg-black/30 border border-white/10 rounded-xl text-xs font-mono text-gray-300 focus:border-purple-500 focus:outline-none resize-none"
                            disabled={isImporting}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JsonImporter;
