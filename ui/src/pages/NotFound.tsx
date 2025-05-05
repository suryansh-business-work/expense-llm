import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you're looking for doesn't exist.</p>
      <Link to="/" style={{ textDecoration: 'none', color: '#007bff' }}>
        Go back to Home
      </Link>
    </div>
  );
};

export default NotFound;
