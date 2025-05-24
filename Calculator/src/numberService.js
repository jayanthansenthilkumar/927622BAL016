const axios = require('axios');

class NumberService {
  constructor(testServerUrl, timeoutMs, windowSize) {
    this.testServerUrl = testServerUrl;
    this.timeoutMs = timeoutMs;
    this.windowSize = windowSize;
    
    // Initialize number stores
    this.stores = {
      p: [], // prime numbers
      f: [], // fibonacci numbers
      e: [], // even numbers
      r: []  // random numbers
    };
  }

  // Get the current state of a specific number store
  getStore(type) {
    if (!this.stores[type]) {
      throw new Error(`Invalid number type: ${type}`);
    }
    return [...this.stores[type]];
  }

  // Calculate average of numbers in a store
  calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return parseFloat((sum / numbers.length).toFixed(2));
  }

  // Add a unique number to the store, respecting the window size
  addUniqueNumber(store, number) {
    if (!store.includes(number)) {
      // If store is at window size, remove the oldest entry
      if (store.length >= this.windowSize) {
        store.shift();
      }
      store.push(number);
    }
  }

  // Fetch numbers from the test server
  async fetchNumbers(type) {
    if (!this.stores[type]) {
      throw new Error(`Invalid number type: ${type}`);
    }
    
    const store = this.stores[type];
    const windowPrevState = [...store]; // Copy current state before changes
    
    try {      // Set up the request with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, this.timeoutMs);
      
      // Fetch numbers from third-party server
      const response = await axios.get(`${this.testServerUrl}/numbers/${type}`, {
        signal: controller.signal,
        timeout: this.timeoutMs
      }).catch(error => {
        if (axios.isCancel(error) || error.code === 'ECONNABORTED' || error.message === 'canceled') {
          throw new Error('Request timed out');
        }
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Cannot connect to server');
        }
        throw error;
      });
      
      clearTimeout(timeoutId);
      
      // Handle empty or invalid response
      if (!response.data || !Array.isArray(response.data.numbers)) {
        throw new Error('Invalid response format from server');
      }
      
      const fetchedNumbers = response.data.numbers || [];
      
      // Add unique numbers to the store
      fetchedNumbers.forEach(num => {
        // Make sure we're only adding numeric values
        if (typeof num === 'number' && !isNaN(num)) {
          this.addUniqueNumber(store, num);
        }
      });
      
      // Prepare the response
      return {
        windowPrevState: windowPrevState,
        windowCurrState: [...store],
        numbers: fetchedNumbers,
        avg: this.calculateAverage(store)
      };
    } catch (error) {
      console.error(`Error fetching ${type} numbers:`, error.message);
      
      // If there's an error, still calculate average with existing numbers
      return {
        windowPrevState: windowPrevState,
        windowCurrState: [...store],
        numbers: [],
        error: error.message,
        avg: this.calculateAverage(store)
      };
    }
  }
}

module.exports = NumberService;
