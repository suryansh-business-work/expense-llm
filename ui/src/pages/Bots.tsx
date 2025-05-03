import { useState } from "react";
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { CardHeader, IconButton } from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';

const Bots = () => {
  const [bots] = useState([
    {
      name: 'Expense',
      description: 'Store all expense here',
      logo: '',
      type: 'finance',
      url: 'expense-track'
    },
    {
      name: 'Income Bot',
      description: 'Store all income here',
      logo: '',
      type: 'finance',
      url: 'income-track'
    },
    {
      name: 'ToDos',
      description: 'Daily task track, Reminder etc',
      logo: '',
      type: 'traking',
      url: 'todos'
    },
    {
      name: 'Task',
      description: 'Long terms task track, Reminder etc',
      logo: '',
      type: 'traking',
      url: 'task'
    },
    {
      name: 'Wishlist',
      description: 'Manage your short terms and long terms wishlist',
      logo: '',
      type: 'traking',
      url: 'wishlist'
    },
    {
      name: 'Reminders',
      description: 'Manage all your reminders here',
      logo: '',
      type: 'traking',
      url: 'reminders'
    }
  ]);

  return (
    <div className="container mt-4">
      <h1 className="mb-3 mt-4">Bots</h1>
      <p className="mb-4">Here is your Bots with key information.</p>
      <div className="row">
        {bots.map((bot, index) => (
          <div className="col-12 col-sm-6 col-md-4 mb-4" key={index}>
            <Card sx={{ minWidth: 275 }}>
              <CardHeader
                avatar={
                  <Avatar aria-label="recipe">
                    {bot.logo && (
                      <img
                        src={bot.logo}
                        className="card-img-top"
                        alt={`${bot.name} logo`}
                      />
                    )}
                    {bot.name.slice(0, 1)}
                  </Avatar>
                }
                action={
                  <IconButton aria-label="settings">
                    <MoreVertIcon />
                  </IconButton>
                }
                title={bot.name}
                subheader={bot.description}
              />
              {/* <CardContent>
                <Typography variant="h3" sx={{ fontSize: 25 }}>
                  {bot.name}
                </Typography>
                <Typography component="p">
                  {bot.description}
                </Typography>
              </CardContent> */}
              <CardActions>
                <Button size="small">Go to bot</Button>
              </CardActions>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bots;
