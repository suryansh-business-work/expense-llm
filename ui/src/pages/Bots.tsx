import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import BotPagesData from "./BotPagesData";

const Bots = () => {
  const [bots] = useState(BotPagesData);

  const navigate = useNavigate();

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
                  <Avatar aria-label="bot-avatar">
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
                title={bot.name}
                subheader={bot.description}
              />
              <CardActions>
                <Button size="small" onClick={() => navigate(`/bot/${bot.url}`)}>
                  Go to bot
                </Button>
              </CardActions>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bots;
