import { useState } from "react";
import { Layout, Menu, Typography, Avatar, Button, theme } from "antd";
import {
  DashboardOutlined,
  UnorderedListOutlined,
  UserOutlined,
  LogoutOutlined,
  HeartFilled,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { token } = theme.useToken();

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/donations",
      icon: <UnorderedListOutlined />,
      label: "รายการโดเนท",
    },
    {
      key: "/users",
      icon: <UserOutlined />,
      label: "ผู้ใช้งาน",
    },
    {
      key: "/report",
      icon: <BarChartOutlined />,
      label: "รายงาน",
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
        }}
        breakpoint="lg"
        onBreakpoint={(broken) => setCollapsed(broken)}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <HeartFilled style={{ fontSize: 24, color: "#eb2f96" }} />
          {!collapsed && (
            <Text strong style={{ fontSize: 16, color: token.colorText }}>
              Donate Tracker
            </Text>
          )}
        </div>

        {/* Navigation */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: "none", marginTop: 8 }}
        />

        {/* User info at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            padding: collapsed ? "16px 8px" : "16px",
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          {!collapsed && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
              }}
            >
              <Avatar
                size="small"
                icon={<UserOutlined />}
                style={{ background: "#1677ff" }}
              />
              <Text ellipsis style={{ flex: 1, fontSize: 13 }}>
                {user?.username}
              </Text>
            </div>
          )}
          <Button
            type="text"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            block={!collapsed}
            style={{ fontSize: 13 }}
          >
            {!collapsed && "ออกจากระบบ"}
          </Button>
        </div>
      </Sider>

      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: token.colorBgContainer,
            display: "flex",
            alignItems: "center",
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          />
        </Header>
        <Content
          style={{
            margin: 24,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
