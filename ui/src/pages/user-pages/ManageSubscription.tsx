import { useState } from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

export default function ManageSubscription() {
  // Simulate current message count (replace with real value if available)
  const currentMessageCount = 100;
  const maxMessageCount = 500;
  const messagePercent = Math.min(
    (currentMessageCount / maxMessageCount) * 100,
    100
  );

  // Purchase state
  const [purchaseCount, setPurchaseCount] = useState(100);
  const pricePerMessage = 0.05; // Example: 5 paise per message
  const [openDialog, setOpenDialog] = useState(false);

  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const handlePurchaseClick = () => setOpenDialog(true);
  const handleDialogClose = () => setOpenDialog(false);

  const handleCountChange = (val: number) => {
    setPurchaseCount((prev) => Math.max(1, prev + val));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(1, parseInt(e.target.value) || 1);
    setPurchaseCount(val);
  };

  const handlePurchase = () => {
    // Implement purchase logic here
    alert(
      `Purchased ${purchaseCount} messages for ₹${(
        purchaseCount * pricePerMessage
      ).toFixed(2)}`
    );
    setOpenDialog(false);
  };

  return (
    <div className="container" style={{ maxWidth: 600, marginTop: 48 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Manage Subscription
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Messages used: {currentMessageCount}/{maxMessageCount}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={messagePercent}
            sx={{ height: 8, borderRadius: 5, mb: 1 }}
            color={messagePercent < 80 ? "primary" : "error"}
          />
        </Box>
        {/* Purchase Form */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 2,
            mt: 3,
          }}
        >
          <Typography variant="body1" sx={{ minWidth: 120 }}>
            Buy Messages:
          </Typography>
          <IconButton
            aria-label="decrease"
            onClick={() => handleCountChange(-1)}
            size="small"
          >
            <RemoveIcon />
          </IconButton>
          <TextField
            type="number"
            value={purchaseCount}
            onChange={handleInputChange}
            inputProps={{ min: 1, style: { textAlign: "center", width: 60 } }}
            size="small"
          />
          <IconButton
            aria-label="increase"
            onClick={() => handleCountChange(1)}
            size="small"
          >
            <AddIcon />
          </IconButton>
          <Typography variant="body1" sx={{ minWidth: 100 }}>
            ₹{(purchaseCount * pricePerMessage).toFixed(2)}
          </Typography>
          <IconButton
            color="primary"
            aria-label="purchase"
            onClick={handlePurchaseClick}
            size="large"
          >
            <ShoppingCartIcon />
          </IconButton>
        </Box>
      </Paper>
      {/* Purchase Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="xs" fullWidth>
        <DialogTitle>
          Purchase {purchaseCount} Messages (₹{(purchaseCount * pricePerMessage).toFixed(2)})
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Enter your card details to complete the purchase.
            </Typography>
            <TextField
              label="Card Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              fullWidth
              margin="dense"
              inputProps={{ maxLength: 19 }}
              placeholder="1234 5678 9012 3456"
            />
            <TextField
              label="Cardholder Name"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              fullWidth
              margin="dense"
              placeholder="Name on Card"
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Expiry"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                margin="dense"
                placeholder="MM/YY"
                inputProps={{ maxLength: 5 }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                margin="dense"
                placeholder="CVV"
                inputProps={{ maxLength: 4 }}
                sx={{ flex: 1 }}
                type="password"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handlePurchase}
            variant="contained"
            color="primary"
            disabled={!cardNumber || !cardName || !expiry || !cvv}
          >
            Pay ₹{(purchaseCount * pricePerMessage).toFixed(2)}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}