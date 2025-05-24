const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const app = express();
const PORT = process.env.MOCK_SERVER_PORT || 3001;

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.json());
app.get('/numbers/p', (req, res) => {
  const primeNumbers = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
  const count = Math.floor(Math.random() * 5) + 1;
  const selectedPrimes = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * primeNumbers.length);
    selectedPrimes.push(primeNumbers[randomIndex]);
  }
  setTimeout(() => {
    res.json({ numbers: selectedPrimes });
  }, Math.random() * 600);
});
app.get('/numbers/f', (req, res) => {
  const fibonacciNumbers = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
  const count = Math.floor(Math.random() * 5) + 1;
  const selectedFibonacci = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * fibonacciNumbers.length);
    selectedFibonacci.push(fibonacciNumbers[randomIndex]);
  }
  setTimeout(() => {
    res.json({ numbers: selectedFibonacci });
  }, Math.random() * 600);
});
app.get('/numbers/e', (req, res) => {
  const count = Math.floor(Math.random() * 5) + 1;
  const evenNumbers = [];
  
  for (let i = 0; i < count; i++) {
    const randomEven = Math.floor(Math.random() * 50) * 2;
    evenNumbers.push(randomEven);
  }
  setTimeout(() => {
    res.json({ numbers: evenNumbers });
  }, Math.random() * 600);
});
app.get('/numbers/r', (req, res) => {
  const count = Math.floor(Math.random() * 5) + 1;
  const randomNumbers = [];
  for (let i = 0; i < count; i++) {
    const randomNum = Math.floor(Math.random() * 100);
    randomNumbers.push(randomNum);
  }
  setTimeout(() => {
    res.json({ numbers: randomNumbers });
  }, Math.random() * 600);
});
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
app.listen(PORT, () => {
  console.log(`Mock Test Server is running on port ${PORT}`);
});