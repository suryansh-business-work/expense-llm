import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert
} from "@mui/material";

// Helper to generate a deterministic pastel color from a string seed
function getRandomColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Generate HSL color for better pastel palette
  const h = Math.abs(hash) % 360;
  const s = 60 + (Math.abs(hash) % 20); // 60-80%
  const l = 70 + (Math.abs(hash) % 10); // 70-80%
  return `hsl(${h},${s}%,${l}%)`;
}

const API_BASE = "http://localhost:3000/design-system";

export default function Appearance({
  selectedThemeId,
  setSelectedThemeId,
}: {
  selectedThemeId: string;
  setSelectedThemeId: (id: string) => void;
}) {
  const [themes, setThemes] = useState<{ themeId: string; themeName: string }[]>([]);
  const [themeLoading, setThemeLoading] = useState(false);
  const [themeError, setThemeError] = useState<string | null>(null);

  useEffect(() => {
    fetchThemes();
    // eslint-disable-next-line
  }, []);

  const fetchThemes = async () => {
    setThemeLoading(true);
    setThemeError(null);
    try {
      const res = await fetch(`${API_BASE}/get`);
      const data = await res.json();
      if (Array.isArray(data.data)) {
        setThemes(data.data);
        if (data.data.length && !selectedThemeId) {
          setSelectedThemeId(data.data[0].themeId);
        }
      } else {
        setThemes([]);
      }
      if (data.message && data.status === "no-data-found") {
        setThemeError(data.message);
      }
    } catch (err) {
      setThemeError("Failed to load themes");
      setThemes([]);
    } finally {
      setThemeLoading(false);
    }
  };

  return (
    <div>
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ mb: 2, fontWeight: 600 }}>
          Select Theme
        </Typography>
        {themeLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <CircularProgress size={28} />
          </Box>
        ) : themeError ? (
          <Alert severity="error">{themeError}</Alert>
        ) : (
          <div className="row">
            {themes.map((theme) => {
              // Generate two random colors for each theme
              const color1 = getRandomColor(theme.themeId + "1");
              const color2 = getRandomColor(theme.themeId + "6");
              return (
                <div className="col-6 col-sm-4 col-md-4 mb-3" key={theme.themeId}>
                  <Box
                    sx={{
                      position: "relative",
                      border:
                        selectedThemeId === theme.themeId
                          ? "2px solid #1976d2"
                          : "1px solid #e0e0e0",
                      borderRadius: 2,
                      p: 2,
                      cursor: "pointer",
                      background:
                        selectedThemeId === theme.themeId ? "#e3f2fd" : "#fff",
                      boxShadow: selectedThemeId === theme.themeId ? 3 : 1,
                      transition: "all 0.2s",
                      minHeight: 90,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onClick={() => setSelectedThemeId(theme.themeId)}
                  >
                    {/* Color blocks as theme icon */}
                    <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "6px",
                          background: color1,
                          border: "1.5px solid #fff",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                        }}
                      />
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "6px",
                          background: color2,
                          border: "1.5px solid #fff",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                        }}
                      />
                    </Box>
                    <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
                      {theme.themeName}
                    </Typography>
                  </Box>
                </div>
              );
            })}
            {themes.length === 0 && (
              <div className="col-12">
                <Alert severity="info">No themes found.</Alert>
              </div>
            )}
          </div>
        )}
      </Box>
    </div>
  );
}