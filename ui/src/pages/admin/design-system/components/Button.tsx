import React from "react";

type ButtonVariant = "text" | "outlined" | "contained";
type ButtonColor = "primary" | "secondary" | "success" | "error" | "info" | "warning";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  disabled?: boolean;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  loading?: boolean;
  boxShadow?: boolean;
  children: React.ReactNode;
}

const colorMap: Record<ButtonColor, string> = {
  primary: "#1976d2",
  secondary: "#9c27b0",
  success: "#2e7d32",
  error: "#d32f2f",
  info: "#0288d1",
  warning: "#ed6c02",
};

const sizeMap: Record<ButtonSize, React.CSSProperties> = {
  small: { fontSize: 13, padding: "6px 12px" },
  medium: { fontSize: 15, padding: "8px 15px" },
  large: { fontSize: 17, padding: "12px 18px" },
};

// Simple loading spinner
const Spinner = () => (
  <span
    style={{
      display: "inline-block",
      width: 18,
      height: 18,
      border: "2px solid #fff",
      borderTop: "2px solid #bbb",
      borderRadius: "50%",
      animation: "mui-btn-spin 0.7s linear infinite",
      marginRight: 6,
    }}
  />
);

// Add keyframes for spinner animation
const spinnerStyle = `
@keyframes mui-btn-spin {
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
}
`;

export default function Button({
  variant = "contained",
  color = "primary",
  size = "medium",
  disabled = false,
  fullWidth = false,
  startIcon,
  endIcon,
  loading = false,
  boxShadow = false,
  children,
  ...rest
}: ButtonProps) {
  let style: React.CSSProperties = {
    ...sizeMap[size],
    borderRadius: 4,
    border: "none",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? "100%" : undefined,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "background 0.2s, color 0.2s, border 0.2s, box-shadow 0.2s",
    boxShadow:
      boxShadow && variant === "contained"
        ? "0 2px 8px 0 rgba(25,118,210,0.15)"
        : undefined,
  };

  if (variant === "contained") {
    style.background = colorMap[color];
    style.color = "#fff";
  } else if (variant === "outlined") {
    style.background = "#fff";
    style.color = colorMap[color];
    style.border = `1.5px solid ${colorMap[color]}`;
    style.boxShadow = boxShadow
      ? "0 2px 8px 0 rgba(25,118,210,0.10)"
      : undefined;
  } else if (variant === "text") {
    style.background = "transparent";
    style.color = colorMap[color];
    style.boxShadow = undefined;
  }

  return (
    <>
      <style>{spinnerStyle}</style>
      <button
        type="button"
        style={style}
        disabled={disabled || loading}
        {...rest}
      >
        {loading && <Spinner />}
        {!loading && startIcon && (
          <span style={{ display: "inline-flex", marginRight: 4 }}>{startIcon}</span>
        )}
        {children}
        {!loading && endIcon && (
          <span style={{ display: "inline-flex", marginLeft: 4 }}>{endIcon}</span>
        )}
      </button>
    </>
  );
}
