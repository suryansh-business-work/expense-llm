import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  Divider,
  Drawer,
  Button,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Table from "../admin/design-system/components/Table";
import axios from "axios";
import { useUserContext } from "../../providers/UserProvider";

function getFirstDayOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}
function getEndOfMonth() {
  const d = new Date();
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  end.setMilliseconds(-1);
  return end.toISOString();
}

// Example pricing data
const pricingData = [
  { tokens: 100, price: 5 },
  { tokens: 500, price: 20 },
  { tokens: 1000, price: 35 },
  { tokens: 5000, price: 150 },
  { tokens: 10000, price: 250 },
  { tokens: 100000, price: 250 },
  { tokens: 1000000, price: 350 },
  { tokens: 10000000, price: 450 },
  { tokens: 100000000, price: 550 },
];

export default function ManageSubscription() {
  const { user } = useUserContext();
  const [totalPromptTokenSizeUsed, setTotalPromptTokenSizeUsed] = useState<number>(0);
  const [totalPromptTokenSizeAvailable, setTotalPromptTokenSizeAvailable] = useState<number>(0);
  const [totalPromptTokenSizeUsedPercentage, setTotalPromptTokenSizeUsedPercentage] = useState<number>(0);
  const [usageHistory, setUsageHistory] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch usage summary and history on mount
  useEffect(() => {
    const fetchUsageSummary = async () => {
      const startDate = getFirstDayOfMonth();
      const endDate = getEndOfMonth();
      const botOwnerUserId = user?.userId || "";

      const apiUrl = `http://localhost:3000/v1/api/subscription-usage/user/${botOwnerUserId}/date-range?startDate=${startDate}&endDate=${endDate}`;

      try {
        const response = await axios.get(apiUrl);
        const { totalPromptTokenSize, history, userCurrentTokenCount } = response.data;
        setTotalPromptTokenSizeUsed(totalPromptTokenSize || 0);
        setTotalPromptTokenSizeAvailable(userCurrentTokenCount?.tokenCount || 0)
        setTotalPromptTokenSizeUsedPercentage(Math.min(((totalPromptTokenSize) / userCurrentTokenCount?.tokenCount) * 100, 100));
        setUsageHistory(history || []);
      } catch (err) {
        console.error("Failed to fetch usage summary:", err);
      }
    };
    fetchUsageSummary();
    // eslint-disable-next-line
  }, [user?.userId]);

  // Table columns for usage history
  const columns = [
    { key: "createdAt", label: "Date", render: (row: any) => new Date(row.createdAt).toLocaleString() },
    { key: "prompt", label: "Prompt", sortable: true },
    { key: "promptTokenSize", label: "Token Used", sortable: true },
    { key: "botId", label: "Bot ID", sortable: true },
    { key: "userName", label: "User Name", render: (row: any) => row.userContext ? `${row.userContext.firstName} ${row.userContext.lastName}` : "" },
    { key: "email", label: "Email", render: (row: any) => row.userContext?.email || "" },
    { key: "role", label: "Role", render: (row: any) => row.userContext?.role || "" },
    { key: "timezone", label: "Timezone", render: (row: any) => row.userContext?.timezone || "" },
  ];

  // Table columns for pricing
  const pricingColumns = [
    { key: "tokens", label: "Tokens" },
    { key: "price", label: "Price ($)" },
    {
      key: "buy",
      label: "",
      render: (row: any) => (
        <Button
          size="small"
          color="primary"
          onClick={() => alert(`Buy ${row.tokens} tokens for ₹${row.price}`)}
        >
          Buy
        </Button>
      ),
    },
  ];

  return (
    <div className="container mt-5 mb-5">
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Manage Subscription
        </Typography>
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <b>Token used:</b> {totalPromptTokenSizeUsed}/{totalPromptTokenSizeAvailable} (<b>{totalPromptTokenSizeUsedPercentage.toFixed(1)}% Used</b>)
          </Typography>
          <Button
            size="small"
            color="primary"
            variant="contained"
            startIcon={<ShoppingCartIcon />}
            onClick={() => setDrawerOpen(true)}
            style={{ marginLeft: 12 }}
          >
            Buy Tokens
          </Button>
        </Box>
        <LinearProgress
          variant="determinate"
          value={totalPromptTokenSizeUsedPercentage}
          sx={{ height: 8, borderRadius: 5, mb: 1 }}
          color={totalPromptTokenSizeUsedPercentage < 80 ? "primary" : "error"}
        />
        <Divider sx={{ my: 3 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Usage History
        </Typography>
        <div style={{ maxHeight: 300, overflowY: "auto" }}>
          <Table
            columns={columns}
            data={usageHistory}
            defaultPageSize={5}
            pageSizeOptions={[5, 10]}
            style={{ background: "#fafbfc" }}
          />
        </div>
      </Paper>
      {/* Pricing Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ style: { width: 800, padding: 24 } }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Buy Tokens
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Table
            columns={pricingColumns}
            data={pricingData}
            defaultPageSize={5}
            pageSizeOptions={[5]}
            style={{ background: "#fafbfc" }}
          />
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            style={{ marginTop: 24 }}
            onClick={() => setDrawerOpen(false)}
          >
            Close
          </Button>
        </Box>
      </Drawer>
    </div>
  );
}