const axios = require('axios');
require('dotenv').config();

/**
 * This test script verifies that the authentication and API connection are working correctly
 */

async function testConnection() {
  try {
    const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ4MDY5MDYwLCJpYXQiOjE3NDgwNjg3NjAsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImM0OWVhZTI4LWQ0ZTUtNDdlMy1iODA1LWJhYTNkNmJiMjEyNCIsInN1YiI6ImpheWFudGhhbnNlbnRoaWxrdW1hcjE4QGdtYWlsLmNvbSJ9LCJlbWFpbCI6ImpheWFudGhhbnNlbnRoaWxrdW1hcjE4QGdtYWlsLmNvbSIsIm5hbWUiOiJqYXlhbnRoYW4gcyIsInJvbGxObyI6IjkyNzYyMmJhbDAxNiIsImFjY2Vzc0NvZGUiOiJ3aGVRVXkiLCJjbGllbnRJRCI6ImM0OWVhZTI4LWQ0ZTUtNDdlMy1iODA1LWJhYTNkNmJiMjEyNCIsImNsaWVudFNlY3JldCI6InNUUGhiQk14WXpoV1lnUnIifQ.4az8ZA1mWU_S5ANCQIGaMbd7h2kfZBYy_mhUMOgjgpw";
    const API_BASE_URL = process.env.API_BASE_URL || 'http://20.244.56.144/evaluation-service';
    const endpoints = {
      primes: `${API_BASE_URL}/primes`,
      fibonacci: `${API_BASE_URL}/fibo`,
      random: `${API_BASE_URL}/rand`,
      even: `${API_BASE_URL}/even`,
    };
    console.log('Testing connection to API endpoints with authentication...');
    for (const [name, url] of Object.entries(endpoints)) {
      console.log(`\nTesting ${name} endpoint: ${url}`);
      try {
        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          timeout: 5000
        });
        
        console.log(`✅ ${name} endpoint response received!`);
        console.log('Response data:', JSON.stringify(response.data).substring(0, 100) + '...');
      } catch (error) {
        console.error(`❌ Error connecting to ${name} endpoint:`, error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
      }
    }
    
    console.log('\nConnection test completed!');
    
  } catch (error) {
    console.error('Error during connection test:', error.message);
  }
}

// Run the test
testConnection();
