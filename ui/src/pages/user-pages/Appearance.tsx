import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert
} from "@mui/material";
import axios from "axios";

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

export default function Appearance() {
  const [themes, setThemes] = useState<{ themeId: string; themeName: string; selected?: boolean }[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<string>("");
  const [themeLoading, setThemeLoading] = useState(false);
  const [themeError, setThemeError] = useState<string | null>(null);
  const [selectingThemeId, setSelectingThemeId] = useState<string | null>(null);

  useEffect(() => {
    fetchThemes();
    // eslint-disable-next-line
  }, []);

  const fetchThemes = async () => {
    setThemeLoading(true);
    setThemeError(null);
    try {
      const res = await axios.get(`${API_BASE}/get`);
      if (Array.isArray(res.data.data)) {
        setThemes(res.data.data);

        // Find the selected theme
        const selectedTheme = res.data.data.find((t: any) => t.selected === true);

        if (selectedTheme) {
          setSelectedThemeId(selectedTheme.themeId);
        } else if (res.data.data.length > 0) {
          // If none selected, select the first one
          setSelectedThemeId(res.data.data[0].themeId);
        }
      } else {
        setThemes([]);
      }
      if (res.data.message && res.data.status === "no-data-found") {
        setThemeError(res.data.message);
      }
    } catch (err) {
      setThemeError("Failed to load themes");
      setThemes([]);
    } finally {
      setThemeLoading(false);
    }
  };

  // Update selected theme in backend and UI
  const handleSelectTheme = async (themeId: string) => {
    if (themeId === selectedThemeId) return;
    const prevSelected = selectedThemeId;
    setSelectingThemeId(themeId);
    setSelectedThemeId(themeId);
    try {
      await axios.patch(`${API_BASE}/update/${themeId}`, {
        selected: true,
      });
      // Do not fetchThemes again, just update local state
      setThemes(themes =>
        themes.map(t =>
          t.themeId === themeId
            ? { ...t, selected: true }
            : { ...t, selected: false }
        )
      );
    } catch (err) {
      setThemeError("Failed to select theme");
      setSelectedThemeId(prevSelected); // revert selection
    } finally {
      setSelectingThemeId(null);
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
              const color1 = getRandomColor(theme.themeId + "1");
              const color2 = getRandomColor(theme.themeId + "6");
              const isSelected = selectedThemeId === theme.themeId || theme.selected;
              return (
                <div className="col-6 col-sm-4 col-md-4 mb-3" key={theme.themeId}>
                  <Box
                    sx={{
                      position: "relative",
                      border: isSelected
                        ? "2px solid #1976d2"
                        : "1px solid #e0e0e0",
                      borderRadius: 2,
                      p: 2,
                      cursor: "pointer",
                      background: isSelected ? "#e3f2fd" : "#fff",
                      boxShadow: 1,
                      transition: "border-color 0.2s, background 0.2s",
                      minHeight: 90,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: selectingThemeId && selectingThemeId !== theme.themeId ? 0.6 : 1,
                    }}
                    onClick={() => handleSelectTheme(theme.themeId)}
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
                          transition: "box-shadow 0.2s",
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
                          transition: "box-shadow 0.2s",
                        }}
                      />
                    </Box>
                    <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
                      {theme.themeName}
                    </Typography>
                    {isSelected && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          color: "#1976d2",
                          bgcolor: "#fff",
                          borderRadius: "50%",
                          boxShadow: 1,
                          width: 22,
                          height: 22,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          pointerEvents: "none",
                        }}
                      >
                        {selectingThemeId === theme.themeId ? (
                          <CircularProgress size={16} />
                        ) : (
                          <i className="fas fa-check-circle" />
                        )}
                      </Box>
                    )}
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