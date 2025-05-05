import { useParams, useNavigate } from 'react-router-dom';
import { getBotPageByUrl } from '../BotPagesData';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import React, { useState } from 'react';

const BotList = () => {
  const { botId } = useParams<{ botId: string }>();
  const botPage = getBotPageByUrl(botId || '');
  const navigate = useNavigate();

  // States for dialog management
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [botData, setBotData] = useState({ name: '', description: '', url: '' });

  // Handle opening and closing dialogs
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

  // Handle actions for creating, editing, and deleting bots
  const handleCreateBot = () => {
    console.log('Creating bot:', botData); // Replace with actual create bot logic
    handleCreateDialogClose();
  };

  const handleEditBot = () => {
    console.log('Editing bot:', botData); // Replace with actual edit bot logic
    handleEditDialogClose();
  };

  const handleDeleteBot = () => {
    console.log('Deleting bot:', botData); // Replace with actual delete bot logic
    handleDeleteDialogClose();
  };

  // If no bot is found, show the 404 page
  if (!botPage) {
    return (
      <div>
        <h2>404 - Bot Not Found</h2>
        <p>The bot you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>{botPage.botListPage.heading}</h2>
      <p>{botPage.description}</p>

      {/* Button to create a new bot */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateDialogOpen}
        style={{ marginBottom: '20px' }}
      >
        Create Bot
      </Button>

      {/* Table for displaying bot list */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Bot Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Mapping through the bots list */}
            {botPage && (
              <TableRow key={botPage.id}>
                <TableCell>{botPage.name}</TableCell>
                <TableCell>{botPage.description}</TableCell>
                <TableCell>
                  {/* Go to Bot button */}
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate(`/chat/1`)}
                    style={{ marginRight: '10px' }}
                  >
                    Go to Bot
                  </Button>

                  {/* Edit button */}
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleEditDialogOpen(botPage)}
                    style={{ marginRight: '10px' }}
                  >
                    Edit
                  </Button>

                  {/* Delete button */}
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteDialogOpen(botPage)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
          <Button onClick={handleCreateDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateBot} color="primary">
            Create
          </Button>
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
          <Button onClick={handleEditDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleEditBot} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Bot Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete Bot</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete the bot "{botData.name}"?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteBot} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BotList;
