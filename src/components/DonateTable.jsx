import { formatCurrency, formatThaiDate } from '../services/googleSheets';

/**
 * DonateTable Component
 * ตารางแสดงรายการโดเนททั้งหมด
 */
const DonateTable = ({ donations, isLoading, totalAmount }) => {
    // Loading skeleton
    const LoadingSkeleton = () => (
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className="shimmer h-16 rounded-xl"
                    style={{ animationDelay: `${i * 0.1}s` }}
                />
            ))}
        </div>
    );

    // Empty state
    const EmptyState = () => (
        <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">ยังไม่มีรายการโดเนท</h3>
            <p className="text-gray-500">เริ่มต้นเพิ่มรายการโดเนทแรกของคุณได้เลย!</p>
        </div>
    );

    // Function to get initial for avatar
    const getInitial = (name) => {
        return name && name.length > 0 ? name.charAt(0).toUpperCase() : '?';
    };

    return (
        <div className="space-y-6">
            {/* Total Amount Card */}
            <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-white/10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                        </div>
                        <span className="text-gray-400 text-sm font-medium">ยอดเงินรวมทั้งหมด</span>
                    </div>

                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold gradient-text">
                            {isLoading ? '...' : formatCurrency(totalAmount)}
                        </span>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span>{isLoading ? '...' : donations.length} รายการ</span>
                    </div>
                </div>
            </div>

            {/* Donations List/Table */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                    รายการโดเนททั้งหมด
                </h3>

                {isLoading ? (
                    <LoadingSkeleton />
                ) : donations.length === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-hidden rounded-xl border border-white/10">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/10">
                                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">วันที่</th>
                                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">ทาเลน</th>
                                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">ชื่อผู้โดเนท</th>
                                        <th className="text-right py-4 px-6 text-sm font-semibold text-gray-300">จำนวนเงิน</th>
                                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">หมายเหตุ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {donations.map((donation, index) => (
                                        <tr
                                            key={donation.id || index}
                                            className="table-row-hover border-b border-white/5 last:border-b-0"
                                            style={{ animationDelay: `${index * 0.05}s` }}
                                        >
                                            <td className="py-4 px-6">
                                                <span className="text-sm text-gray-400">{formatThaiDate(donation.date)}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100/10 text-purple-300 border border-purple-500/20">
                                                    {donation.talent || '-'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                                                        {getInitial(donation.name)}
                                                    </div>
                                                    <span className="font-medium text-white">{donation.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <span className="font-semibold text-green-400">{formatCurrency(donation.amount)}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-sm text-gray-400 line-clamp-1">{donation.note || '-'}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-3">
                            {donations.map((donation, index) => (
                                <div
                                    key={donation.id || index}
                                    className="glass-card p-4 animate-fade-in-up"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs text-gray-400">{formatThaiDate(donation.date)}</span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/20">
                                            {donation.talent || '-'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                                                {getInitial(donation.name)}
                                            </div>
                                            <h4 className="font-medium text-white">{donation.name}</h4>
                                        </div>
                                        <span className="font-bold text-green-400 text-lg">{formatCurrency(donation.amount)}</span>
                                    </div>
                                    {donation.note && (
                                        <p className="text-sm text-gray-400 bg-white/5 rounded-lg p-2 mt-2">
                                            {donation.note}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DonateTable;
