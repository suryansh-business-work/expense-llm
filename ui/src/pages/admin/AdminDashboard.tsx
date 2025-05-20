import { useState } from "react";
import {
  Box,
  Card,
  Typography,
  ButtonGroup,
  Button,
  Paper,
} from "@mui/material";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

const ResponsiveGridLayout = WidthProvider(Responsive);

const timeFilters = ["Today", "This Week", "This Month", "This Year"];

export default function AdminDashboard() {
  const [selectedFilter, setSelectedFilter] = useState("Today");
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  // Dummy values
  const totalUsers = 1200;
  const paidUsers = 350;
  const freeUsers = 850;
  const totalProfit = "₹1,20,000";
  const totalRevenue = "₹4,50,000";
  const totalMessages = 98765;

  // Dummy chart data (7 days)
  const labels = Array.from({ length: 7 }, (_, i) =>
    dayjs().subtract(6 - i, "day").format("DD MMM")
  );
  const usersPerDay = [10, 20, 15, 30, 25, 40, 35];
  const messagesPerDay = [1000, 1200, 1100, 1500, 1300, 1700, 1600];

  const layout = [
    { i: "usersChart", x: 0, y: 0, w: 8, h: 2, minW: 4, minH: 2 },
    { i: "messagesChart", x: 0, y: 2, w: 8, h: 2, minW: 4, minH: 2 },
    { i: "users", x: 0, y: 4, w: 2, h: 2, minW: 2, minH: 2 },
    { i: "messages", x: 2, y: 4, w: 2, h: 2, minW: 2, minH: 2 },
    { i: "userPie", x: 4, y: 4, w: 2, h: 2, minW: 2, minH: 2 },
    { i: "financePie", x: 6, y: 4, w: 2, h: 2, minW: 2, minH: 2 },
  ];

  // Borderless card style for charts
  const chartCardSx = {
    p: { xs: 1, md: 2 },
    height: "100%",
    boxShadow: "none",
    border: "none",
    background: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  };

  // Stat card style
  const statCardSx = {
    p: 3,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    bgcolor: "#f8fafc",
    borderRadius: 2,
    boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
    border: "1px solid #f0f0f0",
    minHeight: 140,
  };

  return (
    <div className="admin-dashboard pt-4">
      <div className="container">
        <Box className="row mb-4" sx={{ alignItems: "center" }}>
          <Box className="col-12 col-md-6 mb-2 mb-md-0">
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Admin Dashboard
            </Typography>
          </Box>
          <Box className="col-12 col-md-6 d-flex justify-content-md-end align-items-center">
            <ButtonGroup variant="outlined" color="primary" sx={{ mr: 1 }}>
              {timeFilters.map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? "contained" : "outlined"}
                  onClick={() => setSelectedFilter(filter)}
                >
                  {filter}
                </Button>
              ))}
            </ButtonGroup>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateRangePicker
                value={dateRange}
                onChange={(newValue) => setDateRange(newValue)}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: { width: 200, ml: 1 },
                    placeholder: "Date Range",
                    InputProps: {
                      startAdornment: (
                        <CalendarMonthIcon fontSize="small" sx={{ mr: 1 }} />
                      ),
                    },
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
        </Box>
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout, md: layout, sm: layout, xs: layout, xxs: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 8, md: 8, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={220}
          isResizable
          isDraggable
          useCSSTransforms
          compactType="vertical"
          style={{ minHeight: 900 }}
        >
          {/* Users Created Per Day Chart */}
          <div key="usersChart" className="col-12">
            <Card sx={chartCardSx}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Users Created Per Day
              </Typography>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <Line
                  data={{
                    labels,
                    datasets: [
                      {
                        label: "Users",
                        data: usersPerDay,
                        borderColor: "#1976d2",
                        backgroundColor: "rgba(25, 118, 210, 0.08)",
                        tension: 0.4,
                        fill: true,
                        pointRadius: 3,
                        pointHoverRadius: 5,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } },
                  }}
                  height={160}
                />
              </Box>
            </Card>
          </div>
          {/* Messages Per Day Chart */}
          <div key="messagesChart" className="col-12">
            <Card sx={chartCardSx}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Messages Per Day
              </Typography>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <Line
                  data={{
                    labels,
                    datasets: [
                      {
                        label: "Messages",
                        data: messagesPerDay,
                        borderColor: "#d81b60",
                        backgroundColor: "rgba(216, 27, 96, 0.08)",
                        tension: 0.4,
                        fill: true,
                        pointRadius: 3,
                        pointHoverRadius: 5,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } },
                  }}
                  height={160}
                />
              </Box>
            </Card>
          </div>
          {/* Total Users Stat */}
          <div key="users" className="col-12 col-md-3">
            <Paper sx={statCardSx} elevation={0}>
              <Typography variant="subtitle2" sx={{ color: "#1976d2", fontWeight: 600 }}>
                Total Users
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: "#1976d2" }}>
                {totalUsers}
              </Typography>
            </Paper>
          </div>
          {/* Total Messages Stat */}
          <div key="messages" className="col-12 col-md-3">
            <Paper sx={statCardSx} elevation={0}>
              <Typography variant="subtitle2" sx={{ color: "#d81b60", fontWeight: 600 }}>
                Total Messages
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: "#d81b60" }}>
                {totalMessages}
              </Typography>
            </Paper>
          </div>
          {/* Pie Chart: Free vs Paid Users */}
          <div key="userPie" className="col-12 col-md-3">
            <Card sx={{ ...chartCardSx, alignItems: "center", justifyContent: "center" }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Free vs Paid Users
              </Typography>
              <Box sx={{ width: "100%", maxWidth: 220, mx: "auto" }}>
                <Pie
                  data={{
                    labels: ["Paid Users", "Free Users"],
                    datasets: [
                      {
                        data: [paidUsers, freeUsers],
                        backgroundColor: ["#388e3c", "#fbc02d"],
                        borderColor: ["#388e3c", "#fbc02d"],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: true, position: "bottom" },
                    },
                  }}
                />
              </Box>
            </Card>
          </div>
          {/* Pie Chart: Revenue vs Profit */}
          <div key="financePie" className="col-12 col-md-3">
            <Card sx={{ ...chartCardSx, alignItems: "center", justifyContent: "center" }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Revenue vs Profit
              </Typography>
              <Box sx={{ width: "100%", maxWidth: 220, mx: "auto" }}>
                <Pie
                  data={{
                    labels: ["Revenue", "Profit"],
                    datasets: [
                      {
                        data: [
                          Number(totalRevenue.replace(/[^0-9]/g, "")),
                          Number(totalProfit.replace(/[^0-9]/g, "")),
                        ],
                        backgroundColor: ["#0288d1", "#8e24aa"],
                        borderColor: ["#0288d1", "#8e24aa"],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: true, position: "bottom" },
                    },
                  }}
                />
              </Box>
            </Card>
          </div>
        </ResponsiveGridLayout>
      </div>
    </div>
  );
}
