import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Space,
  Typography,
  Tag,
  Card,
  message,
  Tooltip,
  Row,
  Col,
  Popconfirm,
  Input as AntInput,
} from "antd";
import {
  PlusOutlined,
  ImportOutlined,
  ReloadOutlined,
  DownloadOutlined,
  SearchOutlined,
  HeartFilled,
} from "@ant-design/icons";
import {
  apiGetDonations,
  apiAddDonation,
  apiImportDonations,
  formatCurrency,
} from "../services/api";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = AntInput;

const TALENT_OPTIONS = [
  "Hoshi_1489",
  "Kael",
  "Aomikung",
  "Armigon",
  "Laffey Nilvalen",
];

const DonationsPage = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterTalent, setFilterTalent] = useState(null);
  const [addForm] = Form.useForm();
  const [importForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const loadDonations = useCallback(async () => {
    try {
      setLoading(true);
      const result = await apiGetDonations();
      setDonations(result.data);
    } catch (error) {
      messageApi.error("โหลดข้อมูลไม่สำเร็จ: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  // Add Donation
  const handleAdd = async (values) => {
    try {
      setSubmitting(true);
      await apiAddDonation({
        talent: values.talent,
        date: values.date.format("YYYY-MM-DD"),
        name: values.name,
        amount: values.amount,
        note: values.note || "",
      });
      messageApi.success("บันทึกสำเร็จ! 🎉");
      setAddModalOpen(false);
      addForm.resetFields();
      loadDonations();
    } catch (error) {
      messageApi.error("บันทึกไม่สำเร็จ: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Import JSON
  const handleImport = async (values) => {
    try {
      setSubmitting(true);
      const parsed = JSON.parse(values.jsonData);
      const results = parsed.data?.results || parsed.results || parsed;

      if (!Array.isArray(results) || results.length === 0) {
        messageApi.error("ไม่พบข้อมูลใน JSON");
        return;
      }

      const items = results.map((item) => ({
        talent: values.talent,
        date: item.createdAt
          ? item.createdAt.split("T")[0]
          : dayjs().format("YYYY-MM-DD"),
        name: item.username || "Anonymous",
        amount: parseFloat(item.amount) || 0,
        note: item.message || "",
      }));

      const result = await apiImportDonations(items);
      messageApi.success(
        result.message || `นำเข้าสำเร็จ ${items.length} รายการ 🎉`,
      );
      setImportModalOpen(false);
      importForm.resetFields();
      loadDonations();
    } catch (error) {
      if (error instanceof SyntaxError) {
        messageApi.error("รูปแบบ JSON ไม่ถูกต้อง");
      } else {
        messageApi.error("นำเข้าไม่สำเร็จ: " + error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const filtered = getFilteredData();
    const header = "ทางเลน,วันที่,ชื่อผู้โดเนท,จำนวนเงิน,หมายเหตุ\n";
    const rows = filtered
      .map(
        (d) => `"${d.talent}","${d.date}","${d.name}",${d.amount},"${d.note}"`,
      )
      .join("\n");

    const bom = "\uFEFF";
    const blob = new Blob([bom + header + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `donations_${dayjs().format("YYYYMMDD_HHmmss")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    messageApi.success("ส่งออก CSV สำเร็จ");
  };

  const getFilteredData = () => {
    return donations.filter((d) => {
      const matchSearch =
        !searchText ||
        d.name.toLowerCase().includes(searchText.toLowerCase()) ||
        d.note.toLowerCase().includes(searchText.toLowerCase());
      const matchTalent = !filterTalent || d.talent === filterTalent;
      return matchSearch && matchTalent;
    });
  };

  const totalAmount = getFilteredData().reduce((sum, d) => sum + d.amount, 0);

  const columns = [
    {
      title: "#",
      key: "index",
      width: 60,
      render: (_, __, i) => <Text type="secondary">{i + 1}</Text>,
    },
    {
      title: "วันที่",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : "-"),
      sorter: (a, b) => (a.date || "").localeCompare(b.date || ""),
    },
    {
      title: "ทาเลน",
      dataIndex: "talent",
      key: "talent",
      width: 140,
      render: (v) => <Tag color="purple">{v}</Tag>,
    },
    {
      title: "ชื่อผู้โดเนท",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "จำนวนเงิน",
      dataIndex: "amount",
      key: "amount",
      width: 130,
      render: (v) => (
        <Text style={{ color: "#52c41a", fontWeight: 600 }}>
          {formatCurrency(v)}
        </Text>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "หมายเหตุ",
      dataIndex: "note",
      key: "note",
      ellipsis: true,
      render: (text) => text || <Text type="secondary">-</Text>,
    },
  ];

  return (
    <>
      {contextHolder}
      <div>
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>
            <HeartFilled style={{ color: "#eb2f96", marginRight: 8 }} />
            รายการโดเนท
          </Title>
          <Text type="secondary">บันทึกรายรับทั้งหมด</Text>
        </div>

        <Card bordered={false} style={{ borderRadius: 12 }}>
          {/* Toolbar */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle">
            <Col xs={24} sm={8} md={6}>
              <Input
                placeholder="ค้นหาชื่อ, หมายเหตุ..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={8} md={5}>
              <Select
                placeholder="กรองทาเลน"
                value={filterTalent}
                onChange={(v) => setFilterTalent(v)}
                allowClear
                style={{ width: "100%" }}
                options={TALENT_OPTIONS.map((t) => ({ label: t, value: t }))}
              />
            </Col>
            <Col flex="auto" style={{ textAlign: "right" }}>
              <Space wrap>
                <Text type="secondary">
                  ยอดรวม:{" "}
                  <Text strong style={{ color: "#1677ff" }}>
                    {formatCurrency(totalAmount)}
                  </Text>{" "}
                  ({getFilteredData().length} รายการ)
                </Text>
                <Tooltip title="รีเฟรช">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={loadDonations}
                    loading={loading}
                  />
                </Tooltip>
                <Tooltip title="ส่งออก CSV">
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={handleExportCSV}
                  />
                </Tooltip>
                <Button
                  icon={<ImportOutlined />}
                  onClick={() => setImportModalOpen(true)}
                >
                  Import JSON
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    addForm.setFieldsValue({ date: dayjs() });
                    setAddModalOpen(true);
                  }}
                >
                  เพิ่มรายการ
                </Button>
              </Space>
            </Col>
          </Row>

          {/* Table */}
          <Table
            dataSource={getFilteredData()}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} จาก ${total} รายการ`,
            }}
            size="middle"
            scroll={{ x: 800 }}
          />
        </Card>
      </div>

      {/* Add Donation Modal */}
      <Modal
        title="เพิ่มรายการโดเนท"
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAdd}
          initialValues={{ date: dayjs() }}
        >
          <Form.Item
            name="talent"
            label="ทาเลน"
            rules={[{ required: true, message: "กรุณาเลือกทาเลน" }]}
          >
            <Select
              placeholder="เลือกทาเลน"
              options={TALENT_OPTIONS.map((t) => ({ label: t, value: t }))}
            />
          </Form.Item>
          <Form.Item
            name="name"
            label="ชื่อผู้โดเนท"
            rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
          >
            <Input placeholder="ชื่อผู้โดเนท" />
          </Form.Item>
          <Form.Item
            name="amount"
            label="จำนวนเงิน (บาท)"
            rules={[{ required: true, message: "กรุณากรอกจำนวนเงิน" }]}
          >
            <InputNumber placeholder="0" min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="date"
            label="วันที่"
            rules={[{ required: true, message: "กรุณาเลือกวันที่" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="note" label="หมายเหตุ">
            <Input placeholder="หมายเหตุ (ไม่บังคับ)" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setAddModalOpen(false)}>ยกเลิก</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                บันทึก
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Import JSON Modal */}
      <Modal
        title="Import JSON ข้อมูลย้อนหลัง"
        open={importModalOpen}
        onCancel={() => setImportModalOpen(false)}
        footer={null}
        width={640}
        destroyOnClose
      >
        <Form form={importForm} layout="vertical" onFinish={handleImport}>
          <Form.Item
            name="talent"
            label="ทาเลน"
            rules={[{ required: true, message: "กรุณาเลือกทาเลน" }]}
          >
            <Select
              placeholder="เลือกทาเลน"
              options={TALENT_OPTIONS.map((t) => ({ label: t, value: t }))}
            />
          </Form.Item>
          <Form.Item
            name="jsonData"
            label="วาง JSON"
            rules={[{ required: true, message: "กรุณาวาง JSON" }]}
          >
            <TextArea
              rows={8}
              placeholder={'{ "data": { "results": [...] } }'}
              style={{ fontFamily: "monospace", fontSize: 12 }}
            />
          </Form.Item>
          <div
            style={{
              marginBottom: 16,
              padding: "8px 12px",
              background: "rgba(22,119,255,0.06)",
              borderRadius: 8,
            }}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              รองรับรูปแบบ: <code>{'{ "data": { "results": [...] } }'}</code>{" "}
              หรือ <code>{'{ "results": [...] }'}</code> หรือ{" "}
              <code>{"[...]"}</code>
              <br />
              แต่ละรายการควรมี: <code>username</code>, <code>amount</code>,{" "}
              <code>createdAt</code>, <code>message</code>
            </Text>
          </div>
          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setImportModalOpen(false)}>ยกเลิก</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                เริ่ม Import
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DonationsPage;
