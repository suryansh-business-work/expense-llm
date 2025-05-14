import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import BotPagesData from "./BotPagesData";
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <i className="fas fa-search" aria-hidden="true" />
                  </InputAdornment>
                ),
                style: { verticalAlign: 'middle' }
              }}
              sx={{ width: 300 }}
              inputProps={{
                tabIndex: 0,
                role: "searchbox",
                "aria-label": "Search bots"
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
          <nav className="col-3" aria-label="Bot Category">
            <h3 id="bot-category-heading">Bot Category</h3>
            <ul className="bot-categories mt-3" role="listbox" aria-labelledby="bot-category-heading">
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
            <style>
              {`
                .bot-categories {
                  list-style: none;
                  padding: 0;
                  margin: 0;
                }
                .bot-categories a {
                  border-radius: 6px;
                  padding: 6px 10px;
                  list-style: none;
                }
                .bot-categories .active {
                  background: #0c1b32;
                  border-radius: 6px;
                  padding: 6px 10px;
                  color: #ffffff;
                }
              `}
            </style>
          </nav>
          <main className="col-9" aria-labelledby="bots-heading">
            <div className="row">
              {filteredBots.map((bot, index) => (
                <div className="col-12 col-sm-6 col-md-4 mb-4" key={index}>
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
                    tabIndex={0}
                    aria-label={`${bot.name}: ${bot.description}`}
                  >
                    <CardHeader
                      avatar={
                        <Avatar aria-label={`${bot.name} logo`}>
                          {bot.logo ? (
                            <img
                              src={bot.logo}
                              alt={`${bot.name} logo`}
                              style={{ width: "100%", height: "100%" }}
                            />
                          ) : (
                            bot.name.slice(0, 1)
                          )}
                        </Avatar>
                      }
                      title={<h4>{bot.name}</h4>}
                      subheader={bot.description}
                    />
                    <CardActions sx={{ justifyContent: "flex-end" }}>
                      <Button
                        size="small"
                        onClick={() => navigate(`/bot/${bot.url}`)}
                        aria-label={`Go to ${bot.name}`}
                        endIcon={<i className="fas fa-arrow-right" aria-hidden="true" />}
                        style={{ display: "flex", alignItems: "center", gap: 6 }}
                      >
                      </Button>
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
