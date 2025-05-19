import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
import { Helmet } from 'react-helmet-async';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Popover from '@mui/material/Popover';
import CreateChildBotDialog from "./CreateChildBotDialog";
import DeleteChildBotDialog from "./DeleteChildBotDialog";
import UpdateChildBotDialog from "./UpdateChildBotDialog";
import { getBotPageByUrl } from "../data/BotPagesData";
import API_LIST from "../apiList"; 

const ChildBots = () => {
  const { childBotType } = useParams<{ childBotType: string }>();
  const navigate = useNavigate();

  // Get bot page data by URL
  const botPageData = getBotPageByUrl(childBotType || "");

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
    <Box sx={{ padding: 4 }}>
      <Helmet>
        <title>Child Bots - Bot Management</title>
      </Helmet>
      <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header and Create Button */}
        <div className="row mb-3 align-items-center">
          <div className="col-8">
            <Typography variant="h4" gutterBottom>
              {botPageData?.botListPage?.heading + 's' || childBotType}
            </Typography>
          </div>
          <div className="col-4 d-flex justify-content-end">
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenCreateDialog(true)}
            >
              Create {botPageData?.botListPage?.heading || 'Bot'}
            </Button>
          </div>
        </div>

        {/* Bot Cards */}
        <div className="row">
          {loading ? (
            <Typography sx={{ m: 3 }}>Loading...</Typography>
          ) : bots.length === 0 ? (
            <Typography sx={{ m: 3 }}>No bots found.</Typography>
          ) : (
            bots.map((bot: any, index: number) => (
              <div className="col-12 col-sm-6 col-md-4 mb-4" key={bot.botId || index}>
                <Card
                  sx={{
                    backgroundColor: '#ffffff',
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
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      Category: {bot.bot?.category || bot.category}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      Tags: 
                      {(bot.bot?.tags || bot.tags || []).map((tag: string, idx: number) => (
                        <Chip key={tag + idx} label={tag} size="small" color="primary" />
                      ))}
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
      <CreateChildBotDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onCreated={handleBotCreated}
        type={childBotType || ""}
      />

      {/* Edit Bot Dialog */}
      <UpdateChildBotDialog
        open={openEditDialog}
        onClose={handleEditDialogClose}
        bot={editBot}
        onUpdated={handleBotUpdated}
        type={childBotType || ""}
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
