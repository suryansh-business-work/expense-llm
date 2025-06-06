import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Popover from '@mui/material/Popover';
import DeleteChildBotDialog from "./DeleteChildBotDialog";
import API_LIST from "../../apiList"; 
import Skeleton from "@mui/material/Skeleton";
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import ChildBotDialog from './ChildBotDialog';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

const API_BASE = "http://localhost:3000/bot";

const ChildBots = () => {
  const { childBotType } = useParams<{ childBotType: string }>();
  const navigate = useNavigate();

  // Remove: const botPageData = getBotPageByUrl(childBotType || "");

  // Add state for bot details
  const [botPageData, setBotPageData] = useState<any>(null);

  // Add loading state for botPageData
  const [botPageLoading, setBotPageLoading] = useState(true);

  // Fetch bot details by ID (childBotType)
  useEffect(() => {
    if (!childBotType) return;
    setBotPageLoading(true);
    const fetchBotDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/bot-info/${childBotType}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const result = await res.json();
        if (res.ok && result.status === "success") {
          setBotPageData(result.data.bot);
        } else {
          setBotPageData(null);
        }
      } catch {
        setBotPageData(null);
      }
      setBotPageLoading(false);
    };
    fetchBotDetails();
  }, [childBotType]);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [popoverBot, setPopoverBot] = useState<any>(null);
  const [deleteBotId, setDeleteBotId] = useState<string | null>(null);
  const [deleteBotName, setDeleteBotName] = useState<string | null>(null);
  const [editBot, setEditBot] = useState<any>(null);

  // Bots state from API
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch bots from API
  useEffect(() => {
    const fetchBots = async () => {
      if (!childBotType) return;
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(API_LIST.GET_CHILD_BOTS, { // <-- Use API_LIST here
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ type: childBotType }),
        });
        const result = await res.json();
        if (res.ok && result.status === "success") {
          setBots(result.data.bots || []);
        } else {
          setBots([]);
        }
      } catch {
        setBots([]);
      }
      setLoading(false);
    };
    fetchBots();
  }, [childBotType]);

  const handleEditDialogOpen = (bot: any) => {
    setEditBot(bot);
    setOpenEditDialog(true);
  };
  const handleEditDialogClose = () => setOpenEditDialog(false);
  const handleDeleteDialogOpen = (bot: any) => {
    setDeleteBotId(bot.botId || bot.id);
    setDeleteBotName(bot.name);
    setOpenDeleteDialog(true);
  };
  const handleDeleteDialogClose = () => setOpenDeleteDialog(false);

  const handleBotUpdated = (updatedBot: any) => {
    setBots(prev =>
      prev.map(b =>
        (b.botId || b.id) === (updatedBot.botId || updatedBot.id) ? updatedBot : b
      )
    );
    handleEditDialogClose();
  };
  const handleBotDeleted = (deletedBotId: string) => {
    setBots(prev => prev.filter(bot => bot.botId !== deletedBotId && bot.id !== deletedBotId));
    handleDeleteDialogClose();
  };

  // Popover handlers
  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>, bot: any) => {
    setAnchorEl(event.currentTarget);
    setPopoverBot(bot);
  };
  const handlePopoverClose = () => {
    setAnchorEl(null);
    setPopoverBot(null);
  };

  // Option handlers (bind with dialogs)
  const handleEditFromPopover = () => {
    handlePopoverClose();
    handleEditDialogOpen(popoverBot);
  };
  const handleDeleteFromPopover = () => {
    handlePopoverClose();
    handleDeleteDialogOpen(popoverBot);
  };

  const handleBotCreated = (newBot: any) => {
    setBots(prev => [...prev, newBot]);
  };

  return (
    <Box sx={{ background: "#f6f8fa", minHeight: "100vh" }}>
      <Box
        sx={{
          maxWidth: 1320,
          margin: '0 auto 0 auto',
          borderRadius: 3,
          px: { xs: 2, md: 4 },
          py: { xs: 2, md: 3 },
        }}
      >
        {/* Back Button and Breadcrumbs */}
        <Box
          display="flex"
          alignItems="center"
          mb={3}
          sx={{
            background: "#fff",
            borderRadius: 2,
            px: { xs: 1, md: 2 },
            py: 1.5,
            boxShadow: "0 1px 4px rgba(25,118,210,0.04)",
            gap: 2,
          }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              mr: 2,
              background: "#e3eafc",
              color: "#1976d2",
              fontWeight: 500,
              borderRadius: 2,
              px: 2,
              boxShadow: "none",
              "&:hover": { background: "#d2e3fc", boxShadow: 'none' },
              minWidth: 90,
            }}
            variant="contained"
            aria-label="Back"
          >
            Back
          </Button>
          <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: 16 }}>
            <Link
              underline="hover"
              color="inherit"
              onClick={() => navigate('/bots')}
              sx={{ cursor: 'pointer', fontWeight: 500 }}
            >
              Bots
            </Link>
            <Typography color="text.primary" sx={{ fontWeight: 600 }}>
              {botPageLoading
                ? <Skeleton width={80} />
                : botPageData?.name + ' Bots' || childBotType}
            </Typography>
          </Breadcrumbs>
        </Box>

        {/* Header and Create Button */}
        <div className="row mb-3 align-items-center">
          <div className="col-8">
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              {botPageLoading ? (
                <Skeleton width={220} height={40} />
              ) : (
                botPageData?.name ? `${botPageData.name} Bots` : childBotType
              )}
            </Typography>
          </div>
          <div className="col-4 d-flex justify-content-end">
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenCreateDialog(true)}
              disabled={botPageLoading}
              startIcon={botPageLoading ? <Skeleton variant="circular" width={24} height={24} /> : null}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                fontSize: 16,
                px: 3,
                py: 1.2,
                boxShadow: "0 2px 8px rgba(25, 118, 210, 0.10)"
              }}
            >
              {botPageLoading ? <Skeleton width={80} /> : `Create ${botPageData?.name || 'Bot'} Bot`}
            </Button>
          </div>
        </div>

        {/* Bot Cards */}
        <div className="row">
          {loading ? (
            // Show 4 skeleton cards while loading
            Array.from({ length: 4 }).map((_, idx) => (
              <div className="col-12 col-sm-6 col-md-4 mb-4" key={idx}>
                <Card
                  sx={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    padding: '1rem',
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.05)',
                    maxWidth: '900px',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    position: 'relative',
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Skeleton variant="text" width={120} height={32} />
                    <Skeleton variant="circular" width={32} height={32} />
                  </Box>
                  <CardContent sx={{ pt: 0 }}>
                    <Skeleton variant="text" width="90%" height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} variant="rounded" width={48} height={24} sx={{ mr: 1 }} />
                      ))}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Skeleton variant="rounded" width={90} height={36} />
                  </CardActions>
                </Card>
              </div>
            ))
          ) : bots.length === 0 ? (
            <Typography sx={{ m: 3 }}>No bots found.</Typography>
          ) : (
            bots.map((bot: any, index: number) => (
              <div className="col-12 col-sm-6 col-md-4 mb-4" key={bot.botId || index}>
                <Card
                  sx={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    padding: '1rem',
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.05)',
                    maxWidth: '900px',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 18px 36px rgba(0, 0, 0, 0.08)',
                    },
                    position: 'relative',
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="h6">{bot.bot?.name || bot.name}</Typography>
                    <IconButton
                      aria-label="more"
                      aria-controls={`bot-menu-${index}`}
                      aria-haspopup="true"
                      onClick={e => handlePopoverOpen(e, bot)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Popover
                      id={`bot-menu-${index}`}
                      open={Boolean(anchorEl) && popoverBot === bot}
                      anchorEl={anchorEl}
                      onClose={handlePopoverClose}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                    >
                      <Box>
                        <Button fullWidth onClick={handleEditFromPopover}>Edit</Button>
                        <Button fullWidth color="error" onClick={handleDeleteFromPopover}>Delete</Button>
                      </Box>
                    </Popover>
                  </Box>
                  <CardContent sx={{ pt: 0 }}>
                    <Typography color="text.secondary" sx={{ mb: 1 }}>
                      {bot.bot?.description || bot.description}
                    </Typography>
                    <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                      <CategoryOutlinedIcon fontSize="small" sx={{ mr: 0.5, color: "#1976d2" }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#1976d2" }}>
                        {typeof (bot.bot?.category) === "object"
                          ? bot.bot?.category.label
                          : typeof (bot.category) === "object"
                          ? bot.category.label
                          : bot.bot?.category || bot.category || "Other"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                      <LabelOutlinedIcon fontSize="small" sx={{ color: "#888" }} />
                      {(bot.bot?.tags || bot.tags || []).length > 0 ? (
                        (bot.bot?.tags || bot.tags || []).map((tag: string, idx: number) => (
                          <Chip
                            key={tag + idx}
                            label={tag}
                            size="small"
                            color="primary"
                            variant="filled"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          No tags
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => navigate(`/bot/${childBotType}/chat/${bot.botId}`)}>Go to Bot</Button>
                  </CardActions>
                </Card>
              </div>
            ))
          )}
        </div>
      </Box>

      {/* Create Bot Dialog */}
      <ChildBotDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onSubmitSuccess={handleBotCreated}
        type={childBotType || ""}
        mode="create"
      />

      <ChildBotDialog
        open={openEditDialog}
        onClose={handleEditDialogClose}
        onSubmitSuccess={handleBotUpdated}
        type={childBotType || ""}
        mode="update"
        bot={editBot}
      />
      {/* Delete Bot Dialog */}
      <DeleteChildBotDialog
        open={openDeleteDialog}
        onClose={handleDeleteDialogClose}
        botId={deleteBotId}
        botName={deleteBotName ?? undefined}
        onDeleted={handleBotDeleted}
      />
    </Box>
  );
};

export default ChildBots;
