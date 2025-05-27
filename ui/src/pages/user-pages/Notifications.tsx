import { Paper, Typography, FormGroup, FormControlLabel, Checkbox } from "@mui/material";

export default function Notifications({
  notifications,
  setNotifications,
}: {
  notifications: {
    promotions: boolean;
    account: boolean;
    bots: boolean;
  };
  setNotifications: React.Dispatch<
    React.SetStateAction<{
      promotions: boolean;
      account: boolean;
      bots: boolean;
    }>
  >;
}) {
  return (
    <div>
      <Typography sx={{ mb: 2, fontWeight: 600 }}>
        Notifications
      </Typography>
      <Paper elevation={0} sx={{ p: 2, background: "#f5f7fa", borderRadius: 2 }}>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={notifications.promotions}
                onChange={() =>
                  setNotifications((n) => ({
                    ...n,
                    promotions: !n.promotions,
                  }))
                }
                color="primary"
              />
            }
            label="Promotions"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={notifications.account}
                onChange={() =>
                  setNotifications((n) => ({
                    ...n,
                    account: !n.account,
                  }))
                }
                color="primary"
              />
            }
            label="Account Related"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={notifications.bots}
                onChange={() =>
                  setNotifications((n) => ({
                    ...n,
                    bots: !n.bots,
                  }))
                }
                color="primary"
              />
            }
            label="Bots Messages"
          />
        </FormGroup>
      </Paper>
    </div>
  );
}