import { useState } from "react";

const Bots = () => {
  const [bots] = useState([
    {
      name: 'Expense Bot',
      description: 'Store all expense here',
      logo: ''
    },
    {
      name: 'Income Bot',
      description: 'Store all income here',
      logo: ''
    }
  ]);

  return (
    <div className="container mt-4">
      <h1 className="mb-3 mt-4">Bots</h1>
      <p className="mb-4">Here is your Bots with key information.</p>
      <div className="row">
        {bots.map((bot, index) => (
          <div className="col-12 col-sm-6 col-md-4 mb-4" key={index}>
            <div className="card h-100">
              {bot.logo && (
                <img
                  src={bot.logo}
                  className="card-img-top"
                  alt={`${bot.name} logo`}
                />
              )}
              <div className="card-body">
                <h3 className="card-title">{bot.name}</h3>
                <p className="card-text">{bot.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bots;
