import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import BotPagesData from "../data/BotPagesData";
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

// Map type value to icon class (Font Awesome 5+ CSS classes)
const typeIconMap: Record<string, string> = {
  finance: "fas fa-money-bill",
  "daily-life": "fas fa-calendar-check",
  professional: "fas fa-briefcase",
  all: "fas fa-list",
};

const Bots = () => {
  const [bots] = useState(BotPagesData);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [searchFocus, setSearchFocus] = useState(false);
  const navigate = useNavigate();

  // Dynamically create categories from BotPagesData
  const BOT_CATEGORIES = useMemo(() => {
    const types: { label: string; value: string; icon: string }[] = [];
    const seen = new Set();
    for (const bot of BotPagesData) {
      const t = bot.type;
      if (t && t.value && !seen.has(t.value)) {
        types.push({
          label: t.name + " Bots",
          value: t.value,
          icon: typeIconMap[t.value] || typeIconMap.all,
        });
        seen.add(t.value);
      }
    }
    // "All Bots" always first
    return [
      { label: "All Bots", value: "all", icon: typeIconMap.all },
      ...types,
    ];
  }, []);

  // Filter bots by category and search
  const filteredBots = bots.filter((bot) => {
    // If search is focused, ignore category filter
    if (searchFocus) {
      return (
        bot.name.toLowerCase().includes(search.toLowerCase()) ||
        bot.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    // Category filter (bot.type.value)
    const matchCategory = category === "all" ? true : bot.type?.value === category;
    // Search filter
    const matchSearch =
      bot.name.toLowerCase().includes(search.toLowerCase()) ||
      bot.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  // When search is focused, set category to "all"
  const handleSearchFocus = () => {
    setCategory("all"); // Always select All Bots on focus
    setSearchFocus(true);
  };
  const handleSearchBlur = () => setSearchFocus(false);

  return (
    <>
      <div className="container">
        <div className="row pt-4 align-items-center">
          <div className="col-6">
            <h1 id="bots-heading">Bots</h1>
          </div>
          <div className="col-6 d-flex justify-content-end align-items-center" style={{ minHeight: 80 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search bots..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              aria-label="Search bots"
              aria-describedby="bots-desc"
              sx={{ width: 300, backgroundColor: "#fff" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </div>
        </div>
        <div className="row mb-4">
          <div className="col-12">
            <hr />
          </div>
        </div>
        <div className="row">
          <nav className="col-12 col-sm-12 col-md-4 col-lg-3 mb-4" aria-label="Bot Category">
            <ul className="bot-categories" role="listbox" aria-labelledby="bot-category-heading">
              {BOT_CATEGORIES.map((cat) => (
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
          </nav>
          <main className="col-12 col-sm-12 col-md-8 col-lg-9" aria-labelledby="bots-heading">
            <div className="row">
              {filteredBots.map((bot, index) => (
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
                    aria-label={`${bot.name}: ${bot.description}`}
                  >
                    <CardHeader
                      title={<h4>{bot.name}</h4>}
                      subheader={bot.description}
                    />
                    <CardActions sx={{ justifyContent: "flex-end" }}>
                      <div className="bot-action" aria-label={`Go to ${bot.name}`} aria-hidden="true">
                        <a onClick={() => navigate(`/bot/${bot.url}`)}><i className="fas fa-arrow-right" /></a>
                      </div>
                    </CardActions>
                  </Card>
                </div>
              ))}
              {filteredBots.length === 0 && (
                <div className="col-12 text-center text-muted py-5" aria-live="polite">
                  No bots found.
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Bots;
