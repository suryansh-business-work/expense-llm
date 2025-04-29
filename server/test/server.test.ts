// test/server.test.ts
import axios from 'axios';

const SERVER_URL = 'http://localhost:3000'; // Adjust to your server's URL if necessary

describe('Server Tests', () => {
  it('should respond with status 200 on the healthcheck endpoint', async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/healthcheck`);
      expect(response.status).toBe(200);  // Check if status is 200 OK
    } catch (error) {
      console.error(error);
      throw new Error('Server is not running properly');
    }
  });

  // Remove or comment out this test if you don't need to test the root path
  /*
  it('should respond with status 200 on the root endpoint', async () => {
    try {
      const response = await axios.get(`${SERVER_URL}`);
      expect(response.status).toBe(200);  // Check if status is 200 OK
    } catch (error) {
      console.error(error);
      throw new Error('Server is not running properly');
    }
  });
  */
});
