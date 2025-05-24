// filepath: d:\927622BAL016\Calculator\src\numberService.js
const axios = require('axios');
const AuthService = require('./authService');

class NumberService {
  constructor(testServerUrl, timeoutMs, windowSize, apiBaseUrl, authUrl) {
    this.testServerUrl = testServerUrl;
    this.apiBaseUrl = apiBaseUrl;
    this.timeoutMs = timeoutMs;
    this.windowSize = windowSize;
    this.authService = new AuthService(authUrl);
    this.stores = {
      p: [],
      f: [],
      e: [],
      r: []
    };
    
    // Initialize auth token
    this.authService.init();
  }

  getStore(type) {
    if (!this.stores[type]) {
      throw new Error(`Invalid number type: ${type}`);
    }
    return [...this.stores[type]];
  }

  calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return parseFloat((sum / numbers.length).toFixed(2));
  }

  addUniqueNumber(store, number) {
    if (!store.includes(number)) {
      if (store.length >= this.windowSize) {
        store.shift();
      }
      store.push(number);
    }
  }

  async fetchNumbers(type) {
    if (!this.stores[type]) {
      throw new Error(`Invalid number type: ${type}`);
    }
    
    const store = this.stores[type];
    const windowPrevState = [...store];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, this.timeoutMs);
      
      // Get the API endpoint based on type
      let apiEndpoint = '';
      switch(type) {
        case 'p':
          apiEndpoint = `${this.apiBaseUrl}/primes`;
          break;
        case 'f':
          apiEndpoint = `${this.apiBaseUrl}/fibo`;
          break;
        case 'r':
          apiEndpoint = `${this.apiBaseUrl}/rand`;
          break;
        default:
          // For 'e' and any other types not matching the API, fallback to mock server
          return this.fetchFromMockServer(type, store, windowPrevState);
      }
      
      // Get auth headers
      const authHeaders = await this.authService.getAuthHeader();
      
      // Make authenticated API request
      const response = await axios.get(apiEndpoint, {
        headers: authHeaders,
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
      
      if (!response.data) {
        throw new Error('Invalid response format from server');
      }
      
      // Handle different API response formats
      let fetchedNumbers = [];
      if (Array.isArray(response.data)) {
        // API returns direct array for some endpoints
        fetchedNumbers = response.data;
      } else if (Array.isArray(response.data.numbers)) {
        // Mock server format
        fetchedNumbers = response.data.numbers;
      } else if (response.data.result && Array.isArray(response.data.result)) {
        // Another possible API format
        fetchedNumbers = response.data.result;
      } else {
        console.warn('Unexpected response format:', response.data);
        fetchedNumbers = [];
      }
      
      fetchedNumbers.forEach(num => {
        if (typeof num === 'number' && !isNaN(num)) {
          this.addUniqueNumber(store, num);
        }
      });
      
      return {
        windowPrevState: windowPrevState,
        windowCurrState: [...store],
        numbers: fetchedNumbers,
        avg: this.calculateAverage(store)
      };
    } catch (error) {
      console.error(`Error fetching ${type} numbers:`, error.message);
      return {
        windowPrevState: windowPrevState,
        windowCurrState: [...store],
        numbers: [],
        error: error.message,
        avg: this.calculateAverage(store)
      };
    }
  }

  // Fetch from mock server as fallback
  async fetchFromMockServer(type, store, windowPrevState) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, this.timeoutMs);
      
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
      
      if (!response.data) {
        throw new Error('Invalid response format from server');
      }
      
      const fetchedNumbers = Array.isArray(response.data.numbers) ? response.data.numbers : [];
      fetchedNumbers.forEach(num => {
        if (typeof num === 'number' && !isNaN(num)) {
          this.addUniqueNumber(store, num);
        }
      });
      
      return {
        windowPrevState: windowPrevState,
        windowCurrState: [...store],
        numbers: fetchedNumbers,
        avg: this.calculateAverage(store)
      };
    } catch (error) {
      console.error(`Error fetching ${type} numbers from mock server:`, error.message);
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
