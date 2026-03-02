import { useState, useEffect, useMemo } from "react";
import {
  Card,
  Table,
  Typography,
  Spin,
  Tag,
  Row,
  Col,
  Statistic,
  Button,
} from "antd";
import {
  BarChartOutlined,
  DownloadOutlined,
  DollarOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { apiGetDonations, formatCurrency, formatNumber } from "../services/api";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const ReportPage = () => {
  const [allDonations, setAllDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null); // null = ทุกเดือน

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await apiGetDonations();
      setAllDonations(result.data || []);
    } catch (error) {
      console.error("Failed to load:", error);
    } finally {
      setLoading(false);
    }
  };

  // สรุปข้อมูลแยกรายเดือน
  const monthlyData = useMemo(() => {
    const map = {};
    allDonations.forEach((d) => {
      if (!d.date) return;
      const parsed = dayjs(d.date);
      if (!parsed.isValid()) return;
      const ym = parsed.format("YYYY-MM"); // ✅ normalize เป็น YYYY-MM เสมอ
      if (!map[ym])
        map[ym] = { month: ym, totalAmount: 0, count: 0, donors: new Set() };
      map[ym].totalAmount += d.amount || 0;
      map[ym].count++;
      if (d.name) map[ym].donors.add(d.name);
    });

    return Object.values(map)
      .sort((a, b) => b.month.localeCompare(a.month)) // ล่าสุดก่อน
      .map((row) => ({
        ...row,
        donorCount: row.donors.size,
        avgAmount: row.count > 0 ? Math.round(row.totalAmount / row.count) : 0,
      }));
  }, [allDonations]);

  // รายละเอียดของเดือนที่กด
  const detailData = useMemo(() => {
    if (!selectedMonth) return [];
    const [selY, selM] = selectedMonth.split("-").map(Number);
    return allDonations
      .filter((d) => {
        if (!d.date) return false;
        const parsed = dayjs(d.date);
        return (
          parsed.isValid() &&
          parsed.year() === selY &&
          parsed.month() + 1 === selM
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [allDonations, selectedMonth]);

  // สรุปรวมทุกเดือน
  const summary = useMemo(
    () => ({
      total: monthlyData.reduce((s, r) => s + r.totalAmount, 0),
      count: monthlyData.reduce((s, r) => s + r.count, 0),
      months: monthlyData.length,
    }),
    [monthlyData],
  );

  // ===== Columns =====
  const monthlyColumns = [
    {
      title: "เดือน",
      dataIndex: "month",
      key: "month",
      render: (v) => (
        <Text strong style={{ color: "#6366f1" }}>
          {dayjs(v + "-01").format("MMMM YYYY")}
        </Text>
      ),
    },
    {
      title: "ยอดรวม",
      dataIndex: "totalAmount",
      key: "totalAmount",
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      render: (v) => (
        <Text style={{ color: "#1677ff", fontWeight: 600 }}>
          {formatCurrency(v)}
        </Text>
      ),
    },
    {
      title: "จำนวนรายการ",
      dataIndex: "count",
      key: "count",
      sorter: (a, b) => a.count - b.count,
      render: (v) => <Tag color="blue">{formatNumber(v)} รายการ</Tag>,
    },
    {
      title: "เฉลี่ย/รายการ",
      dataIndex: "avgAmount",
      key: "avgAmount",
      sorter: (a, b) => a.avgAmount - b.avgAmount,
      render: (v) => <Text>{formatCurrency(v)}</Text>,
    },
    {
      title: "ผู้บริจาค (คน)",
      dataIndex: "donorCount",
      key: "donorCount",
      render: (v) => <Tag color="purple">{v} คน</Tag>,
    },
    {
      title: "ดูรายละเอียด",
      key: "action",
      render: (_, row) => (
        <Button
          type={selectedMonth === row.month ? "primary" : "default"}
          size="small"
          onClick={() =>
            setSelectedMonth(selectedMonth === row.month ? null : row.month)
          }
        >
          {selectedMonth === row.month ? "ซ่อน" : "ดูรายการ"}
        </Button>
      ),
    },
  ];

  const detailColumns = [
    {
      title: "วันที่",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "ชื่อ",
      dataIndex: "name",
      key: "name",
      render: (t) => <Text strong>{t}</Text>,
    },
    {
      title: "จำนวนเงิน",
      dataIndex: "amount",
      key: "amount",
      sorter: (a, b) => a.amount - b.amount,
      render: (v) => (
        <Text style={{ color: "#52c41a", fontWeight: 600 }}>
          {formatCurrency(v)}
        </Text>
      ),
    },
    {
      title: "ทาเลน",
      dataIndex: "talent",
      key: "talent",
      render: (v) => (v ? <Tag>{v}</Tag> : "-"),
    },
    {
      title: "หมายเหตุ",
      dataIndex: "note",
      key: "note",
      render: (v) => <Text type="secondary">{v || "-"}</Text>,
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 400,
        }}
      >
        <Spin size="large" tip="กำลังโหลดข้อมูล..." />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          <BarChartOutlined style={{ color: "#6366f1", marginRight: 8 }} />
          รายงานรายเดือน
        </Title>
        <Text type="secondary">สรุปยอดโดเนทแยกตามเดือน</Text>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card
            bordered={false}
            style={{
              background: "linear-gradient(135deg, #1677ff22, #1677ff08)",
              borderLeft: "3px solid #1677ff",
              borderRadius: 12,
            }}
          >
            <Statistic
              title={<Text type="secondary">ยอดรวมทั้งหมด</Text>}
              value={summary.total}
              formatter={(v) => formatCurrency(v)}
              prefix={<DollarOutlined style={{ color: "#1677ff" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            bordered={false}
            style={{
              background: "linear-gradient(135deg, #52c41a22, #52c41a08)",
              borderLeft: "3px solid #52c41a",
              borderRadius: 12,
            }}
          >
            <Statistic
              title={<Text type="secondary">รายการทั้งหมด</Text>}
              value={summary.count}
              formatter={(v) => formatNumber(v)}
              prefix={<UnorderedListOutlined style={{ color: "#52c41a" }} />}
              suffix={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  รายการ
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            bordered={false}
            style={{
              background: "linear-gradient(135deg, #6366f122, #6366f108)",
              borderLeft: "3px solid #6366f1",
              borderRadius: 12,
            }}
          >
            <Statistic
              title={<Text type="secondary">จำนวนเดือนที่มีข้อมูล</Text>}
              value={summary.months}
              formatter={(v) => formatNumber(v)}
              prefix={<BarChartOutlined style={{ color: "#6366f1" }} />}
              suffix={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  เดือน
                </Text>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Monthly Table */}
      <Card
        title="📅 สรุปยอดรายเดือน"
        bordered={false}
        style={{ borderRadius: 12, marginBottom: selectedMonth ? 16 : 0 }}
      >
        <Table
          dataSource={monthlyData}
          columns={monthlyColumns}
          rowKey="month"
          pagination={false}
          size="middle"
          rowClassName={(row) =>
            row.month === selectedMonth ? "ant-table-row-selected" : ""
          }
          summary={(rows) => {
            const sumTotal = rows.reduce((s, r) => s + r.totalAmount, 0);
            const sumCount = rows.reduce((s, r) => s + r.count, 0);
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>
                  <Text strong>รวมทั้งหมด</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <Text strong style={{ color: "#1677ff" }}>
                    {formatCurrency(sumTotal)}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  <Tag color="blue">{formatNumber(sumCount)} รายการ</Tag>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} />
                <Table.Summary.Cell index={4} />
                <Table.Summary.Cell index={5} />
              </Table.Summary.Row>
            );
          }}
        />
      </Card>

      {/* Detail Table */}
      {selectedMonth && (
        <Card
          title={`📋 รายการทั้งหมดเดือน ${dayjs(selectedMonth + "-01").format("MMMM YYYY")} (${detailData.length} รายการ)`}
          bordered={false}
          style={{ borderRadius: 12 }}
          extra={
            <Button
              icon={<DownloadOutlined />}
              size="small"
              onClick={() => setSelectedMonth(null)}
            >
              ปิด
            </Button>
          }
        >
          <Table
            dataSource={detailData}
            columns={detailColumns}
            rowKey={(_, i) => i}
            size="small"
            pagination={{ pageSize: 20, showSizeChanger: true }}
          />
        </Card>
      )}
    </div>
  );
};

export default ReportPage;
