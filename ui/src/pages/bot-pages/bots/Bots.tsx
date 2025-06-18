import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Skeleton from "@mui/material/Skeleton";
import Divider from "@mui/material/Divider";
import DescriptionWithReadMore from "./DescriptionWithReadMore";
import CreateOrUpdateBotDialog from "./CreateOrUpdateBotDialog";
import StorageIcon from '@mui/icons-material/Storage';
import PsychologyIcon from '@mui/icons-material/Psychology';

// Map type value to icon class (Font Awesome 5+ CSS classes)
const typeIconMap: Record<string, string> = {
  finance: "fas fa-money-bill",
  "daily-life": "fas fa-calendar-check",
  professional: "fas fa-briefcase",
  all: "fas fa-list",
};

const API_BASE = "http://localhost:3000/bot";

const Bots = () => {
  const [bots, setBots] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [searchFocus, setSearchFocus] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editBot, setEditBot] = useState<any | null>(null);
  const [deleteBotId, setDeleteBotId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Fetch bots from API
  const fetchBots = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/bots`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({}),
      });
      const result = await res.json();
      setBots(result.data?.bots || []);
    } catch (e) {
      setBots([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBots();
    // eslint-disable-next-line
  }, []);

  // Dynamically create categories from bots data
  const BOT_CATEGORIES = useMemo(() => {
    const types: { label: string; value: string; icon: string }[] = [];
    const seen = new Set();
    for (const item of bots) {
      const bot = item.bot || item;
      const t = bot.category?.value;
      if (t && !seen.has(t)) {
        types.push({
          label: (bot.category?.label || t.charAt(0).toUpperCase() + t.slice(1)) + " Bots",
          value: t,
          icon: typeIconMap[t] || typeIconMap.all,
        });
        seen.add(t);
      }
    }
    return [
      { label: "All Bots", value: "all", icon: typeIconMap.all },
      ...types,
    ];
  }, [bots]);

  // Filter bots by category and search
  const filteredBots = bots.filter((item) => {
    const botData = item.bot || item;
    // If search is focused, ignore category filter
    if (searchFocus) {
      return (
        botData.name.toLowerCase().includes(search.toLowerCase()) ||
        botData.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    // Category filter
    const matchCategory = category === "all" ? true : botData.category?.value === category;
    // Search filter
    const matchSearch =
      botData.name.toLowerCase().includes(search.toLowerCase()) ||
      botData.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  // When search is focused, set category to "all"
  const handleSearchFocus = () => {
    setCategory("all");
    setSearchFocus(true);
  };
  const handleSearchBlur = () => setSearchFocus(false);

  // Delete bot handler
  const handleDeleteBot = async () => {
    if (!deleteBotId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_BASE}/delete/bot/${deleteBotId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        setDeleteBotId(null);
        fetchBots();
      }
    } catch (e) {
      // handle error
    }
    setDeleteLoading(false);
  };

  // Accessibility: focus management for dialogs
  useEffect(() => {
    if (createDialogOpen || editBot) {
      document.body.setAttribute("aria-hidden", "true");
    } else {
      document.body.removeAttribute("aria-hidden");
    }
    return () => document.body.removeAttribute("aria-hidden");
  }, [createDialogOpen, editBot]);

  return (
    <>
      <div className="container">
        <section className="mt-4 mb-4 create-bot">
          <div className="row align-items-center">
            <div className="col-12 col-md-3 col-lg-3">
              <h1 id="bots-heading" tabIndex={-1}>
                {loading ? <Skeleton width={120} height={40} /> : "Bots"}
              </h1>
            </div>
            <div className="col-12 col-md-9 col-lg-9 d-flex justify-content-end align-items-center" style={{ minHeight: 80 }}>
              {loading ? (
                <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 2, mr: 2 }} />
              ) : (
                <Button
                  variant="text"
                  onClick={() => setCreateDialogOpen(true)}
                  sx={{ mr: 2 }}
                  aria-label="Create a new bot"
                >
                  <i className="fas fa-plus me-2" aria-hidden="true" /> Create Bot
                </Button>
              )}
              <TextField
                variant="outlined"
                size="small"
                placeholder={
                  bots.length === 0
                    ? "No bots to search"
                    : "Search bots..."
                }
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                aria-label="Search bots"
                aria-describedby="bots-desc"
                sx={{ width: 300, backgroundColor: "#ffffff", borderRadius: 0, border: 0, boxShadow: 'none' }}
                inputProps={{
                  "aria-disabled": bots.length === 0,
                  "aria-label": bots.length === 0 ? "No bots to search" : "Search bots"
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                disabled={bots.length === 0 || loading}
              />
            </div>
          </div>
        </section>
        <div className="row">
          <nav className="col-12 col-sm-12 col-md-4 col-lg-3 mb-4" aria-label="Bot Category">
            <ul className="bot-categories" role="listbox" aria-labelledby="bot-category-heading">
              {loading
                ? Array.from({ length: 4 }).map((_, idx) => (
                  <li key={idx} className="mb-2">
                    <Skeleton variant="rectangular" width={160} height={32} sx={{ borderRadius: 2 }} />
                  </li>
                ))
                : BOT_CATEGORIES.map((cat) => (
                  <li key={cat.value} className="mb-2" role="option" aria-selected={category === cat.value}>
                    <a
                      href="#"
                      className={`d-flex align-items-center ${(category === cat.value && (!searchFocus || cat.value === "all")) ||
                        (searchFocus && cat.value === "all")
                        ? "active fw-bold text-primary"
                        : ""
                        }`}
                      style={{ cursor: "pointer", textDecoration: "none" }}
                      onClick={e => {
                        e.preventDefault();
                        setCategory(cat.value);
                        setSearch("");
                        setSearchFocus(false);
                      }}
                      tabIndex={0}
                      aria-label={cat.label}
                      aria-current={category === cat.value ? "true" : undefined}
                      onKeyDown={e => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setCategory(cat.value);
                          setSearch("");
                          setSearchFocus(false);
                        }
                      }}
                    >
                      <i className={`${cat.icon} me-2`} aria-hidden="true" />
                      {cat.label}
                    </a>
                  </li>
                ))}
            </ul>
            <Divider sx={{ my: 2 }} />
            <Card
              sx={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                boxShadow: 'none',
                padding: 2,
              }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  color: "#4f4f4f",
                  marginBottom: 8,
                  gap: 8,
                  letterSpacing: 0.2,
                }}
              >
                Labs
              </div>
              <Button
                variant="text"
                color="secondary"
                sx={{ mt: 1, textTransform: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 1 }}
                onClick={() => navigate("/lab/mcp-servers/marketplace")}
                startIcon={<StorageIcon />}
              >
                MCP Servers
              </Button>
              <Button
                variant="text"
                color="secondary"
                sx={{ mt: 1, textTransform: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 1 }}
                onClick={() => navigate("/lab/agentic-ai")}
                startIcon={<PsychologyIcon />}
              >
                Agentic AI
              </Button>
            </Card>
          </nav>
          <main className="col-12 col-sm-12 col-md-8 col-lg-9" aria-labelledby="bots-heading">
            <div className="row" aria-live="polite">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div className="col-12 col-sm-6 col-md-6 mb-4" key={idx}>
                    <Card
                      sx={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.05)',
                        maxWidth: '900px',
                        minHeight: 220,
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 18px 36px rgba(0, 0, 0, 0.08)',
                        },
                        p: 2,
                      }}
                      className="bot-card"
                    >
                      <Skeleton variant="text" width="60%" height={36} sx={{ mb: 2 }} />
                      <Skeleton variant="text" width="90%" height={24} sx={{ mb: 1 }} />
                      <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2 }} />
                      <Skeleton variant="rectangular" width={80} height={32} sx={{ mt: 2, borderRadius: 2 }} />
                    </Card>
                  </div>
                ))
              ) : filteredBots.length > 0 ? (
                filteredBots.map((bot, index) => {
                  const botData = bot.bot || bot;
                  return (
                    <div className="col-12 col-sm-6 col-md-6 mb-4" key={index}>
                      <Card
                        sx={{
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.05)',
                          maxWidth: '900px',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 18px 36px rgba(0, 0, 0, 0.08)',
                          },
                        }}
                        className="bot-card"
                        tabIndex={0}
                        aria-label={`${botData.name}: ${botData.description}`}
                        role="region"
                        aria-labelledby={`bot-title-${index}`}
                      >
                        <CardHeader
                          title={<h4 className="mb-4" id={`bot-title-${index}`}>{botData.name}</h4>}
                          subheader={
                            <>
                              <DescriptionWithReadMore description={botData.description} />
                              {Array.isArray(botData.tags) && botData.tags.length > 0 && (
                                <div style={{ marginTop: 10 }}>
                                  {botData.tags.map((tag: string, i: number) => (
                                    <span
                                      key={i}
                                      style={{
                                        display: "inline-block",
                                        background: "#e0e0e0",
                                        borderRadius: "16px",
                                        padding: "2px 12px",
                                        fontSize: "0.85em",
                                        marginRight: 6,
                                        marginBottom: 4,
                                      }}
                                      aria-label={`Tag: ${tag}`}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </>
                          }
                        />
                        <CardActions sx={{ justifyContent: "flex-end" }}>
                          <Button
                            size="small"
                            color="primary"
                            startIcon={<EditIcon />}
                            onClick={() => setEditBot(botData)}
                            aria-label={`Edit bot ${botData.name}`}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => setDeleteBotId(botData.botId)}
                            aria-label={`Delete bot ${botData.name}`}
                          >
                            Delete
                          </Button>
                          <div className="bot-action" aria-label={`Go to ${botData.name}`} aria-hidden="true">
                            <a
                              onClick={() => navigate(`/bots/${botData.botId || botData.url}`)}
                              tabIndex={0}
                              aria-label={`Open bot ${botData.name}`}
                              style={{ cursor: "pointer" }}
                            >
                              <i className="fas fa-arrow-right" />
                            </a>
                          </div>
                        </CardActions>
                      </Card>
                    </div>
                  );
                })
              ) : (
                <div className="col-12 text-center text-muted pb-4" aria-live="polite">
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: 16,
                      padding: "48px 24px",
                      boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
                      display: "inline-block",
                      maxWidth: 420,
                      margin: "0 auto"
                    }}
                    role="region"
                    aria-label="No bots found"
                  >
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png"
                      alt="No bots illustration"
                      style={{ width: 80, marginBottom: 24, opacity: 0.85 }}
                    />
                    <h2 style={{ fontWeight: 700, marginBottom: 12, color: '#222' }}>
                      No bots found!
                    </h2>
                    <p style={{ fontSize: 18, color: "#555", marginBottom: 28 }}>
                      Start automating your tasks and boost your productivity.<br />
                      <span style={{ color: "#1976d2", fontWeight: 500 }}>Create your first bot for free!</span>
                    </p>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      sx={{
                        borderRadius: 8,
                        fontWeight: 600,
                        fontSize: 18,
                        px: 4,
                        py: 1.5,
                        boxShadow: "0 2px 8px rgba(25, 118, 210, 0.12)"
                      }}
                      onClick={() => setCreateDialogOpen(true)}
                      startIcon={<i className="fas fa-robot" />}
                      aria-label="Create your first bot"
                    >
                      Create Bot
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      {/* Create & Edit Bot Dialog */}
      <CreateOrUpdateBotDialog
        open={createDialogOpen || !!editBot}
        onClose={() => {
          setCreateDialogOpen(false);
          setEditBot(null);
        }}
        onSuccess={() => {
          setCreateDialogOpen(false);
          setEditBot(null);
          fetchBots();
        }}
        initialData={editBot}
        token={token}
      />
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteBotId} onClose={() => setDeleteBotId(null)} aria-labelledby="delete-bot-dialog-title">
        <DialogTitle id="delete-bot-dialog-title">Are you sure you want to delete this bot?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteBotId(null)} disabled={deleteLoading}>Cancel</Button>
          <Button
            onClick={handleDeleteBot}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <Skeleton variant="circular" width={18} height={18} /> : null}
            aria-label="Confirm delete bot"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Bots;
