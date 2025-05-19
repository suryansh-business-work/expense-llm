import { Alert, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../providers/UserProvider";

const HeaderAlert = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();

  if (user?.isUserVerified) return null;

  return (
    <Alert
      severity="warning"
      sx={{
        borderRadius: 0,
        justifyContent: "center",
        alignItems: "center",
        fontSize: 16,
        py: 1.5,
        mb: 0,
        width: "100%",
        textAlign: "center",
      }}
    >
      Your account is not verified. Please&nbsp;
      <Link
        component="button"
        underline="always"
        color="primary"
        onClick={() => navigate("/profile")}
        sx={{ fontWeight: 600 }}
      >
        verify your email and phone
      </Link>
      &nbsp;in your profile to unlock all features of the application.
    </Alert>
  );
};

export default HeaderAlert;
