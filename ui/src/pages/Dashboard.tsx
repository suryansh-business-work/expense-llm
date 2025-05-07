import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Grid, Typography } from '@mui/material';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const doughnutData = {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    datasets: [
      {
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  return (
    <Grid container sx={{ width: '100%', maxWidth: '1200px', margin: '0 auto', paddingTop: '20px' }}>
      <Grid size={{ xs: 12, sm: 12, md: 12 }} sx={{ padding: '20px' }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" gutterBottom>
          Here is your dashboard with key information.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 6 }} sx={{ padding: '20px' }}>
        <Doughnut data={doughnutData} style={{ width: '100%', height: '300px' }} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 6 }} sx={{ padding: '20px' }}>
        <Typography>
          <Doughnut data={doughnutData} style={{ width: '100%', height: '300px' }} />
        </Typography>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
