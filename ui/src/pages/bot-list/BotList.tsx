import { useParams, useNavigate } from 'react-router-dom';
import { getBotPageByUrl } from '../BotPagesData';
import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';

const BotList = () => {
  const { botId } = useParams<{ botId: string }>();
  const botPage = getBotPageByUrl(botId || '');
  const navigate = useNavigate();

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [botData, setBotData] = useState({ name: '', description: '', url: '' });

  const handleCreateDialogOpen = () => setOpenCreateDialog(true);
  const handleCreateDialogClose = () => setOpenCreateDialog(false);
  const handleEditDialogOpen = (bot: any) => {
    setBotData(bot);
    setOpenEditDialog(true);
  };
  const handleEditDialogClose = () => setOpenEditDialog(false);
  const handleDeleteDialogOpen = (bot: any) => {
    setBotData(bot);
    setOpenDeleteDialog(true);
  };
  const handleDeleteDialogClose = () => setOpenDeleteDialog(false);

  const handleCreateBot = () => {
    console.log('Creating bot:', botData);
    handleCreateDialogClose();
  };
  const handleEditBot = () => {
    console.log('Editing bot:', botData);
    handleEditDialogClose();
  };
  const handleDeleteBot = () => {
    console.log('Deleting bot:', botData);
    handleDeleteDialogClose();
  };

  if (!botPage) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Typography variant="h4">404 - Bot Not Found</Typography>
        <Typography>The bot you're looking for doesn't exist.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Helmet>
        <title>{botPage.botListPage.heading} - Bot Management</title>
      </Helmet>
      <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header and Create Button */}
        <Grid container spacing={2} size={12} sx={{ marginBottom: 3, alignItems: "center" }}>
          <Grid size={8}>
            <Typography variant="h4" gutterBottom>
              {botPage.botListPage.heading}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {botPage.description}
            </Typography>
          </Grid>
          <Grid size={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateDialogOpen}
            >
              Create Bot
            </Button>
          </Grid>
        </Grid>

        {/* Bot Cards */}
        <Grid container spacing={3}>
          {(botPage?.bots || []).map((bot: any, index: number) => (
            <Grid key={index}>
              <Card sx={{
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
              }}>
                <CardContent>
                  <Typography variant="h6">{bot.name}</Typography>
                  <Typography color="text.secondary">{bot.description}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => navigate(`/bot/${botId}/chat/${bot.url}/${bot.id}`)}>Go to Bot</Button>
                  <Button size="small" color="secondary" onClick={() => handleEditDialogOpen(bot)}>Edit</Button>
                  <Button size="small" color="error" onClick={() => handleDeleteDialogOpen(bot)}>Delete</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Create Bot Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCreateDialogClose}>
        <DialogTitle>Create a New Bot</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Bot Name"
            fullWidth
            value={botData.name}
            onChange={(e) => setBotData({ ...botData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            value={botData.description}
            onChange={(e) => setBotData({ ...botData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose}>Cancel</Button>
          <Button onClick={handleCreateBot} color="primary">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Bot Dialog */}
      <Dialog open={openEditDialog} onClose={handleEditDialogClose}>
        <DialogTitle>Edit Bot</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Bot Name"
            fullWidth
            value={botData.name}
            onChange={(e) => setBotData({ ...botData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            value={botData.description}
            onChange={(e) => setBotData({ ...botData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button onClick={handleEditBot} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Bot Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete Bot</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete the bot "{botData.name}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteBot} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BotList;
