export default {
  port: process.env.PORT || 3001,
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/v1/api',
  jwtSecret: process.env.JWT_SECRET || 'SECRET_KEY'
};
