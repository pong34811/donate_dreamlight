import { useState } from "react";
import {
  Layout,
  Menu,
  Typography,
  Avatar,
  Button,
  Dropdown,
  Modal,
  Form,
  Input,
  message,
  theme,
} from "antd";
import {
  DashboardOutlined,
  UnorderedListOutlined,
  UserOutlined,
  LogoutOutlined,
  HeartFilled,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BarChartOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiChangePassword } from "../services/api";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [changePwdOpen, setChangePwdOpen] = useState(false);
  const [changePwdLoading, setChangePwdLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { token } = theme.useToken();

  const menuItems = [
    { key: "/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
    {
      key: "/donations",
      icon: <UnorderedListOutlined />,
      label: "รายการโดเนท",
    },
    { key: "/users", icon: <UserOutlined />, label: "ผู้ใช้งาน" },
    { key: "/report", icon: <BarChartOutlined />, label: "รายงาน" },
  ];

  const handleMenuClick = ({ key }) => navigate(key);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleChangePassword = async (values) => {
    try {
      setChangePwdLoading(true);
      await apiChangePassword(
        user?.username,
        values.currentPassword,
        values.newPassword,
      );
      message.success("เปลี่ยนรหัสผ่านสำเร็จ");
      setChangePwdOpen(false);
      form.resetFields();
    } catch (err) {
      message.error(err.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
    } finally {
      setChangePwdLoading(false);
    }
  };

  // Dropdown menu items
  const userMenuItems = [
    {
      key: "username",
      label: (
        <div style={{ padding: "4px 0", pointerEvents: "none" }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            เข้าสู่ระบบในชื่อ
          </Text>
          <br />
          <Text strong style={{ fontSize: 13 }}>
            {user?.username}
          </Text>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "changePassword",
      icon: <LockOutlined />,
      label: "เปลี่ยนรหัสผ่าน",
      onClick: () => setChangePwdOpen(true),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "ออกจากระบบ",
      danger: true,
      onClick: handleLogout,
    },
  ];

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
      </Sider>

      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: token.colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          {/* Collapse button */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          />

          {/* ✅ User Avatar Dropdown (top-right) */}
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <Avatar
              icon={<UserOutlined />}
              style={{ background: "#6366f1", cursor: "pointer" }}
            />
          </Dropdown>
        </Header>

        <Content style={{ margin: 24, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>

      {/* Change Password Modal */}
      <Modal
        title={
          <span>
            <LockOutlined style={{ marginRight: 8, color: "#6366f1" }} />
            เปลี่ยนรหัสผ่าน
          </span>
        }
        open={changePwdOpen}
        onCancel={() => {
          setChangePwdOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="บันทึก"
        cancelText="ยกเลิก"
        confirmLoading={changePwdLoading}
        width={400}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleChangePassword}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="currentPassword"
            label="รหัสผ่านปัจจุบัน"
            rules={[{ required: true, message: "กรุณากรอกรหัสผ่านปัจจุบัน" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="รหัสผ่านปัจจุบัน"
            />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="รหัสผ่านใหม่"
            rules={[
              { required: true, message: "กรุณากรอกรหัสผ่านใหม่" },
              { min: 4, message: "รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="รหัสผ่านใหม่"
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="ยืนยันรหัสผ่านใหม่"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "กรุณายืนยันรหัสผ่านใหม่" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("รหัสผ่านไม่ตรงกัน"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="ยืนยันรหัสผ่านใหม่"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AppLayout;
