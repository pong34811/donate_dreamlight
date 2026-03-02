import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConfigProvider, theme } from "antd";
import thTH from "antd/locale/th_TH";
import { AuthProvider } from "./contexts/AuthContext";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConfigProvider
      locale={thTH}
      theme={{
        algorithm: theme.defaultAlgorithm, // ✅ เปลี่ยนเป็น Light theme
        token: {
          colorPrimary: "#6366f1",
          colorSuccess: "#22c55e",
          colorWarning: "#f59e0b",
          colorError: "#ef4444",
          colorInfo: "#6366f1",
          borderRadius: 8,
          colorBgBase: "#ffffff",
          colorBgLayout: "#f4f5f7",
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
        components: {
          Card: {
            colorBgContainer: "#ffffff",
            boxShadowTertiary: "0 1px 4px rgba(0,0,0,0.06)",
          },
          Table: {
            colorBgContainer: "#ffffff",
          },
          Layout: {
            colorBgBody: "#f4f5f7",
            siderBg: "#ffffff",
            headerBg: "#ffffff",
          },
          Menu: {
            colorBgContainer: "transparent",
            colorItemBgSelected: "rgba(99, 102, 241, 0.1)",
            colorItemTextSelected: "#6366f1",
          },
          Modal: {
            colorBgElevated: "#ffffff",
          },
        },
      }}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </ConfigProvider>
  </StrictMode>,
);
