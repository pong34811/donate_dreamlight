import { useState, useEffect, useCallback } from 'react';
import DonateForm from './components/DonateForm';
import DonateTable from './components/DonateTable';
import Toast from './components/Toast';
import JsonImporter from './components/JsonImporter';
import {
  fetchDonations,
  appendDonation,
  calculateTotalAmount,
  initGoogleAuth,
  requestAccessToken,
  isAuthenticated,
  signOut
} from './services/googleSheets';

/**
 * App Component
 * หน้าหลักของแอปพลิเคชัน Donate Tracker
 */
function App() {
  // State management
  const [donations, setDonations] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Initialize Google Auth
  useEffect(() => {
    initGoogleAuth()
      .then(() => {
        setIsAuthReady(true);
        setIsLoggedIn(isAuthenticated());
      })
      .catch((error) => {
        console.error('Failed to initialize Google Auth:', error);
        setIsAuthReady(true);
      });
  }, []);

  // ดึงข้อมูลโดเนทจาก Google Sheets
  const loadDonations = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchDonations();
      setDonations(data);
      setTotalAmount(calculateTotalAmount(data));
    } catch (error) {
      console.error('Failed to load donations:', error);
      showToast('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // โหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  // แสดง toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // ซ่อน toast
  const hideToast = () => {
    setToast(null);
  };

  // Handle Google Sign In
  const handleSignIn = async () => {
    try {
      await requestAccessToken();
      setIsLoggedIn(true);
      showToast('เข้าสู่ระบบสำเร็จ! 🎉', 'success');
    } catch (error) {
      console.error('Sign in failed:', error);
      showToast('เข้าสู่ระบบไม่สำเร็จ', 'error');
    }
  };

  // Handle Sign Out
  const handleSignOut = () => {
    signOut();
    setIsLoggedIn(false);
    showToast('ออกจากระบบแล้ว', 'success');
  };

  // จัดการการ submit ฟอร์ม
  const handleSubmit = async (donationData) => {
    try {
      setIsSubmitting(true);
      await appendDonation(donationData);
      setIsLoggedIn(true); // Update login state after successful submission
      showToast('บันทึกข้อมูลโดเนทสำเร็จ! 🎉', 'success');

      // รีโหลดข้อมูลใหม่
      await loadDonations();
      return true;
    } catch (error) {
      console.error('Failed to submit donation:', error);
      showToast(`บันทึกไม่สำเร็จ: ${error.message}`, 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // รีเฟรชข้อมูล
  const handleRefresh = () => {
    loadDonations();
    showToast('รีเฟรชข้อมูลเรียบร้อย', 'success');
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-float">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">
            <span className="gradient-text">Donate</span> Tracker
          </h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            ระบบจดบันทึกและรับยอดเงินโดเนท
          </p>

          {/* Auth & Admin Tools */}
          {isAuthReady && (
            <div className="mt-6 flex justify-center items-center gap-4 flex-wrap">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 
                                            border border-white/10 text-gray-300 text-sm transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.414l-4.293 4.293a1 1 0 01-1.414 0L4 7.414 5.414 6l3.293 3.293L13 5l1 2.414z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-400">● เชื่อมต่อแล้ว</span>
                    <span className="text-gray-500">|</span>
                    <span>ออกจากระบบ</span>
                  </button>

                  <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

                  {/* Import Button */}
                  <JsonImporter onImportSuccess={handleRefresh} />
                </>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 
                                        border border-white/20 text-white text-sm transition-all duration-200 hover:scale-105 shadow-lg shadow-purple-500/10"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  เข้าสู่ระบบด้วย Google
                </button>
              )}
            </div>
          )}
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-5">
            <div className="glass-card p-6 sm:p-8 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  เพิ่มรายการโดเนท
                </h2>
              </div>

              {!isLoggedIn && isAuthReady && (
                <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-yellow-400 text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    กรุณาเข้าสู่ระบบ Google เพื่อบันทึกข้อมูล
                  </p>
                </div>
              )}

              <DonateForm onSubmit={handleSubmit} isLoading={isSubmitting} />
            </div>
          </div>

          {/* Right Column - Table */}
          <div className="lg:col-span-7">
            <div className="glass-card p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  รายการโดเนท
                </h2>

                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 
                                        transition-all duration-200 hover:scale-105 disabled:opacity-50"
                  title="รีเฟรชข้อมูล"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 text-gray-400 ${isLoading ? 'animate-spin' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <DonateTable
                donations={donations}
                isLoading={isLoading}
                totalAmount={totalAmount}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 py-6 border-t border-white/5">
          <p className="text-gray-500 text-sm">
            Made with ❤️ by Donate Dreamlight Team
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
