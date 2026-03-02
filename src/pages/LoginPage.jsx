import { useState } from "react";
import { Form, Input, Button, Typography, Card, message, Space } from "antd";
import { UserOutlined, LockOutlined, HeartFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiLogin } from "../services/api";

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const result = await apiLogin(values.username, values.password);
      login(result.user);
      messageApi.success("เข้าสู่ระบบสำเร็จ! 🎉");
      setTimeout(() => navigate("/dashboard"), 500);
    } catch (error) {
      messageApi.error(error.message || "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="login-page">
        {/* Background orbs */}
        <div className="login-bg-orb login-bg-orb-1" />
        <div className="login-bg-orb login-bg-orb-2" />
        <div className="login-bg-orb login-bg-orb-3" />

        <Card className="login-card" bordered={false}>
          <Space
            direction="vertical"
            align="center"
            size={16}
            style={{ width: "100%", marginBottom: 32 }}
          >
            <div className="login-logo">
              <HeartFilled style={{ fontSize: 36, color: "#fff" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <Title level={2} style={{ margin: 0, color: "#fff" }}>
                Donate Tracker
              </Title>
              <Text type="secondary" style={{ fontSize: 14 }}>
                ระบบจดบันทึกยอดโดเนท
              </Text>
            </div>
          </Space>

          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
            layout="vertical"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: "กรุณากรอก Username" }]}
            >
              <Input
                prefix={
                  <UserOutlined style={{ color: "rgba(255,255,255,0.3)" }} />
                }
                placeholder="Username"
                className="login-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "กรุณากรอก Password" }]}
            >
              <Input.Password
                prefix={
                  <LockOutlined style={{ color: "rgba(255,255,255,0.3)" }} />
                }
                placeholder="Password"
                className="login-input"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className="login-button"
              >
                เข้าสู่ระบบ
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center", marginTop: 24 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Made with ❤️ by Donate Dreamlight Team
            </Text>
          </div>
        </Card>
      </div>
    </>
  );
};

export default LoginPage;
