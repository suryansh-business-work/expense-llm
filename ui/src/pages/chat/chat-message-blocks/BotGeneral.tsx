// components/Chat/BotGeneral.tsx
import { Avatar, Button, Dialog, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import React, { JSX, useState } from 'react';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

interface BotGeneralProps {
  avatarUrl: string;
  timestamp: string;
  content: JSX.Element;
  isLoading: boolean;
  chatAppearance: any;
}

const BotGeneral: React.FC<BotGeneralProps> = ({ avatarUrl, timestamp, content, isLoading, chatAppearance }) => {
  const [isOptionDialogOpen, setIsOptionDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  return (
    <>
      <div className="message-row bot-message">
        <div className="avatar-image">
          <Avatar
            src={avatarUrl}
            alt="avatar"
            sx={{ width: 40, height: 40 }}
            style={{ display: isLoading ? 'none' : 'block' }}
            
          />
        </div>
        <div className="user-name mb-2" style={{fontSize: '12px', color: '#333', opacity: '0.8'}}>{`Bot`}</div>
        <div className="message-bubble" tabIndex={1} style={{ backgroundColor: chatAppearance?.bot?.bubble?.background || '#f0f0f0', color: chatAppearance?.bot?.bubble?.textColor || '#000' }}>
          <div className="bot-message">
            <div className='bot-action'><a onClick={() => setIsOptionDialogOpen(true)}><i className="fa-solid fa-ellipsis-vertical"></i></a></div>
            {content}
          </div>
          <div className='message-bottom-section'>
            {!isLoading && <div className='saved-to-database'><i className="fa-solid fa-check-double"></i></div>}
          </div>
        </div>
        <div className="timestamp">{timestamp}</div>
      </div>
      <Dialog
        open={isOptionDialogOpen}
        onClose={() => setIsOptionDialogOpen(false)}
      >
        <DialogTitle id="message-option">
          {"Message Option"}
        </DialogTitle>
        <DialogContent>
          <DialogContent id="message-option">
            <List sx={{ pt: 0 }}>
              <ListItem>
                <ListItemButton>
                  <ListItemText primary={'Edit'} />
                </ListItemButton>
              </ListItem>
              <ListItem>
                <ListItemButton>
                  <ListItemText primary={'Delete'} onClick={() => {
                    setIsDeleteDialogOpen(true)
                    setIsOptionDialogOpen(false)
                  }} />
                </ListItemButton>
              </ListItem>
            </List>
          </DialogContent>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOptionDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle id="alert-dialog-title">
          {"Are you sure you want to delete?"}
        </DialogTitle>
        <DialogContent>
          {content}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Close</Button>
          <Button onClick={() => {
            setIsOptionDialogOpen(false)
            setIsDeleteDialogOpen(false)
          }} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default BotGeneral;
