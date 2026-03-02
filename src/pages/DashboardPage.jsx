import { useState, useEffect, useMemo } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Typography,
  Spin,
  Tag,
  DatePicker,
  Space,
  theme,
} from "antd";
import {
  DollarOutlined,
  UnorderedListOutlined,
  RiseOutlined,
  CalendarOutlined,
  CrownOutlined,
  HeartFilled,
} from "@ant-design/icons";
import { Area } from "@ant-design/charts";
import { apiGetDonations, formatCurrency, formatNumber } from "../services/api";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const DashboardPage = () => {
  const [allDonations, setAllDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(dayjs()); // default = เดือนปัจจุบัน
  const { token } = theme.useToken();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await apiGetDonations();
      setAllDonations(result.data || []);
    } catch (error) {
      console.error("Failed to load donations:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ กรองข้อมูลเฉพาะเดือนที่เลือก
  const filtered = useMemo(() => {
    if (!selectedMonth) return allDonations;
    const ym = selectedMonth.format("YYYY-MM");
    return allDonations.filter((d) => d.date && d.date.startsWith(ym));
  }, [allDonations, selectedMonth]);

  // คำนวณ stats จาก filtered
  const stats = useMemo(() => {
    const totalAmount = filtered.reduce((s, d) => s + (d.amount || 0), 0);
    const totalCount = filtered.length;
    const avgAmount = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;

    // daily stats
    const dailyMap = {};
    filtered.forEach((d) => {
      if (!d.date) return;
      if (!dailyMap[d.date])
        dailyMap[d.date] = { date: d.date, amount: 0, count: 0 };
      dailyMap[d.date].amount += d.amount || 0;
      dailyMap[d.date].count++;
    });
    const dailyStats = Object.values(dailyMap).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    // top donors
    const donorMap = {};
    filtered.forEach((d) => {
      const name = d.name || "Anonymous";
      if (!donorMap[name]) donorMap[name] = { name, total: 0, count: 0 };
      donorMap[name].total += d.amount || 0;
      donorMap[name].count++;
    });
    const topDonors = Object.values(donorMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // recent
    const recentDonations = [...filtered].reverse().slice(0, 10);

    return {
      totalAmount,
      totalCount,
      avgAmount,
      dailyStats,
      topDonors,
      recentDonations,
    };
  }, [filtered]);

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

  const statCards = [
    {
      title: "ยอดรวมเดือนนี้",
      value: stats.totalAmount,
      prefix: <DollarOutlined />,
      color: "#1677ff",
      bg: "linear-gradient(135deg, #1677ff22, #1677ff08)",
      formatter: (v) => formatCurrency(v),
    },
    {
      title: "จำนวนรายการ",
      value: stats.totalCount,
      prefix: <UnorderedListOutlined />,
      color: "#52c41a",
      bg: "linear-gradient(135deg, #52c41a22, #52c41a08)",
      formatter: (v) => formatNumber(v),
      suffix: "รายการ",
    },
    {
      title: "เฉลี่ยต่อรายการ",
      value: stats.avgAmount,
      prefix: <RiseOutlined />,
      color: "#faad14",
      bg: "linear-gradient(135deg, #faad1422, #faad1408)",
      formatter: (v) => formatCurrency(v),
    },
    {
      title: "เดือนที่เลือก",
      value: selectedMonth ? selectedMonth.format("MM/YYYY") : "-",
      prefix: <CalendarOutlined />,
      color: "#eb2f96",
      bg: "linear-gradient(135deg, #eb2f9622, #eb2f9608)",
      formatter: (v) => v,
    },
  ];

  const chartConfig = {
    data: stats.dailyStats,
    xField: "date",
    yField: "amount",
    smooth: true,
    style: {
      fill: "linear-gradient(-90deg, rgba(22,119,255,0.3) 0%, rgba(22,119,255,0.01) 100%)",
    },
    line: { style: { stroke: "#1677ff", lineWidth: 2 } },
    xAxis: { label: { formatter: (v) => dayjs(v).format("DD/MM") } },
    yAxis: { label: { formatter: (v) => `฿${v}` } },
    tooltip: {
      formatter: (datum) => ({
        name: "ยอดโดเนท",
        value: `${formatCurrency(datum.amount)} (${datum.count} รายการ)`,
      }),
    },
    height: 300,
  };

  const topDonorColumns = [
    {
      title: "#",
      key: "rank",
      width: 50,
      render: (_, __, i) => {
        if (i === 0)
          return <CrownOutlined style={{ color: "#ffd700", fontSize: 18 }} />;
        if (i === 1)
          return <CrownOutlined style={{ color: "#c0c0c0", fontSize: 16 }} />;
        if (i === 2)
          return <CrownOutlined style={{ color: "#cd7f32", fontSize: 14 }} />;
        return <Text type="secondary">{i + 1}</Text>;
      },
    },
    {
      title: "ชื่อ",
      dataIndex: "name",
      key: "name",
      render: (t) => <Text strong>{t}</Text>,
    },
    {
      title: "ยอดรวม",
      dataIndex: "total",
      key: "total",
      render: (v) => (
        <Text style={{ color: "#1677ff" }}>{formatCurrency(v)}</Text>
      ),
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: "จำนวนครั้ง",
      dataIndex: "count",
      key: "count",
      render: (v) => <Tag color="blue">{v} ครั้ง</Tag>,
    },
  ];

  const recentColumns = [
    {
      title: "วันที่",
      dataIndex: "date",
      key: "date",
      width: 110,
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
      render: (v) => (
        <Text style={{ color: "#52c41a" }}>{formatCurrency(v)}</Text>
      ),
    },
    {
      title: "ทาเลน",
      dataIndex: "talent",
      key: "talent",
      render: (v) => <Tag>{v}</Tag>,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            <HeartFilled style={{ color: "#eb2f96", marginRight: 8 }} />
            Dashboard
          </Title>
          <Text type="secondary">ภาพรวมยอดโดเนทรายเดือน</Text>
        </div>
        {/* ✅ Month Picker */}
        <Space>
          <Text type="secondary">เลือกเดือน:</Text>
          <DatePicker
            picker="month"
            value={selectedMonth}
            onChange={(val) => setSelectedMonth(val)}
            format="MM/YYYY"
            allowClear={false}
          />
        </Space>
      </div>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              bordered={false}
              style={{
                background: stat.bg,
                borderRadius: 12,
                borderLeft: `3px solid ${stat.color}`,
              }}
            >
              <Statistic
                title={<Text type="secondary">{stat.title}</Text>}
                value={stat.value}
                formatter={stat.formatter}
                prefix={
                  <span style={{ color: stat.color }}>{stat.prefix}</span>
                }
                suffix={
                  stat.suffix ? (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {stat.suffix}
                    </Text>
                  ) : null
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Chart */}
      <Card
        title="📊 ยอดโดเนทรายวัน (ในเดือนที่เลือก)"
        bordered={false}
        style={{ marginBottom: 24, borderRadius: 12 }}
      >
        {stats.dailyStats.length > 0 ? (
          <Area {...chartConfig} />
        ) : (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Text type="secondary">ไม่มีข้อมูลในเดือนนี้</Text>
          </div>
        )}
      </Card>

      {/* Bottom Tables */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="🏆 Top Donors เดือนนี้"
            bordered={false}
            style={{ borderRadius: 12 }}
          >
            <Table
              dataSource={stats.topDonors}
              columns={topDonorColumns}
              pagination={false}
              size="small"
              rowKey="name"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="🕐 รายการล่าสุดเดือนนี้"
            bordered={false}
            style={{ borderRadius: 12 }}
          >
            <Table
              dataSource={stats.recentDonations}
              columns={recentColumns}
              pagination={false}
              size="small"
              rowKey={(_, i) => i}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
