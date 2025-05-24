const axios = require('axios');

const API_URL = 'http://localhost:3000';
const NUMBER_TYPES = ['p', 'f', 'e', 'r'];

// Function to test the number endpoints
async function testNumberEndpoints() {
  console.log('Testing Average Calculator API endpoints...\n');
  
  for (const type of NUMBER_TYPES) {
    try {
      console.log(`Testing /numbers/${type} endpoint:`);
      
      // Make 3 sequential requests to see the window state change
      for (let i = 0; i < 3; i++) {
        const response = await axios.get(`${API_URL}/numbers/${type}`);
        console.log(`  Request ${i + 1}:`);
        console.log(`    windowPrevState: [${response.data.windowPrevState}]`);
        console.log(`    windowCurrState: [${response.data.windowCurrState}]`);
        console.log(`    numbers: [${response.data.numbers}]`);
        console.log(`    avg: ${response.data.avg}`);
      }
      
      console.log('\n');
    } catch (error) {
      console.error(`Error testing /numbers/${type}:`, error.message);
    }
  }
  
  // Test invalid endpoint
  try {
    console.log('Testing invalid number type:');
    await axios.get(`${API_URL}/numbers/x`);
  } catch (error) {
    console.log(`  Expected error: ${error.response.data.error}\n`);
  }
}

// Check if server is running
async function checkServerStatus() {
  try {
    await axios.get(`${API_URL}/health`);
    return true;
  } catch (error) {
    console.error('Server not running or not reachable at ' + API_URL);
    console.error('Please start the server first with: npm start');
    return false;
  }
}

// Run tests
(async function() {
  const serverRunning = await checkServerStatus();
  
  if (serverRunning) {
    await testNumberEndpoints().catch(error => console.error('Test failed:', error.message));
  }
})();
