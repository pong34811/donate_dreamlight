import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Typography,
  Card,
  message,
  Popconfirm,
  Tag,
  Tooltip,
} from "antd";
import {
  UserAddOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { apiGetUsers, apiAddUser, apiDeleteUser } from "../services/api";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const result = await apiGetUsers();
      setUsers(result.data);
    } catch (error) {
      messageApi.error("โหลดข้อมูลไม่สำเร็จ: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleAddUser = async (values) => {
    try {
      setSubmitting(true);
      await apiAddUser({
        username: values.username,
        password: values.password,
      });
      messageApi.success("สร้างผู้ใช้สำเร็จ! 🎉");
      setModalOpen(false);
      form.resetFields();
      loadUsers();
    } catch (error) {
      messageApi.error(error.message || "สร้างผู้ใช้ไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (username) => {
    try {
      await apiDeleteUser(username);
      messageApi.success("ลบผู้ใช้สำเร็จ");
      loadUsers();
    } catch (error) {
      messageApi.error(error.message || "ลบผู้ใช้ไม่สำเร็จ");
    }
  };

  const columns = [
    {
      title: "#",
      key: "index",
      width: 60,
      render: (_, __, i) => <Text type="secondary">{i + 1}</Text>,
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (text) => (
        <Space>
          <UserOutlined style={{ color: "#1677ff" }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "เข้าสู่ระบบล่าสุด",
      dataIndex: "lastLogin",
      key: "lastLogin",
      render: (v) =>
        v ? (
          <Tag color="green">{dayjs(v).format("DD/MM/YYYY HH:mm")}</Tag>
        ) : (
          <Tag>ยังไม่เคย</Tag>
        ),
    },
    {
      title: "วันที่สร้าง",
      dataIndex: "created",
      key: "created",
      render: (v) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "",
      key: "actions",
      width: 80,
      render: (_, record) => (
        <Popconfirm
          title="ลบผู้ใช้"
          description={`ต้องการลบ "${record.username}" ใช่หรือไม่?`}
          onConfirm={() => handleDeleteUser(record.username)}
          okText="ลบ"
          cancelText="ยกเลิก"
          okButtonProps={{ danger: true }}
        >
          <Tooltip title="ลบผู้ใช้">
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <div>
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>
            <UserOutlined style={{ color: "#1677ff", marginRight: 8 }} />
            ผู้ใช้งาน
          </Title>
          <Text type="secondary">
            จัดการผู้ใช้เข้าสู่ระบบ (อ้างอิง Google Sheets - User sheet)
          </Text>
        </div>

        <Card bordered={false} style={{ borderRadius: 12 }}>
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text type="secondary">ทั้งหมด {users.length} คน</Text>
            <Space>
              <Tooltip title="รีเฟรช">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={loadUsers}
                  loading={loading}
                />
              </Tooltip>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => setModalOpen(true)}
              >
                เพิ่มผู้ใช้
              </Button>
            </Space>
          </div>

          <Table
            dataSource={users}
            columns={columns}
            rowKey="username"
            loading={loading}
            pagination={false}
            size="middle"
          />
        </Card>
      </div>

      {/* Add User Modal */}
      <Modal
        title="เพิ่มผู้ใช้ใหม่"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAddUser}>
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: "กรุณากรอก Username" },
              { min: 3, message: "Username ต้องมีอย่างน้อย 3 ตัวอักษร" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "กรุณากรอก Password" },
              { min: 4, message: "Password ต้องมีอย่างน้อย 4 ตัวอักษร" },
            ]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="ยืนยัน Password"
            dependencies={["password"]}
            rules={[
              { required: true, message: "กรุณายืนยัน Password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Password ไม่ตรงกัน"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="ยืนยัน Password" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setModalOpen(false)}>ยกเลิก</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                สร้างผู้ใช้
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UsersPage;
