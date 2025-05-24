document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const fetchButtons = document.querySelectorAll('.fetch-btn');
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    const themeSwitcher = document.getElementById('theme-switcher');
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mainContent = document.querySelector('.main-content');
    // Type to display name mapping
    const typeNames = {
        'p': 'Prime',
        'f': 'Fibonacci',
        'e': 'Even',
        'r': 'Random'
    };
    
    // Type to element ID mapping
    const typeToWindowId = {
        'p': 'prime-window',
        'f': 'fibonacci-window',
        'e': 'even-window',
        'r': 'random-window'
    };
    
    const typeToAvgId = {
        'p': 'prime-avg',
        'f': 'fibonacci-avg',
        'e': 'even-avg',
        'r': 'random-avg'
    };
    
    const typeToCountId = {
        'p': 'prime-count',
        'f': 'fibonacci-count',
        'e': 'even-count',
        'r': 'random-count'
    };
    
    // Add event listeners to all fetch buttons
    fetchButtons.forEach(button => {
        button.addEventListener('click', () => {
            const numberType = button.getAttribute('data-type');
            fetchNumbers(numberType);
        });
    });
      // Initialize all number types on page load with a slight delay between each
    setTimeout(() => fetchNumbers('p'), 500);
    setTimeout(() => fetchNumbers('f'), 1000);
    setTimeout(() => fetchNumbers('e'), 1500);
    setTimeout(() => fetchNumbers('r'), 2000);
      // Theme switcher functionality
    themeSwitcher.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Update theme switcher icon
        const icon = themeSwitcher.querySelector('i');
        if (newTheme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
        }
    });
    
    // Sidebar toggle functionality
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        });
    }
      // Mobile menu button
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-active');
        });
    }
    
    // Save theme preference to localStorage
    localStorage.setItem('calculator-theme', newTheme);
    });
    
    // Load theme from localStorage if available
    const savedTheme = localStorage.getItem('calculator-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (savedTheme === 'dark') {
            const icon = themeSwitcher.querySelector('i');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }
    
    /**
          * Fetch numbers from the API
     * @param {string} type - The type of numbers to fetch (p, f, e, r)
     */
    async function fetchNumbers(type) {
        // Show loading state
        const card = document.querySelector(`.card[data-type="${type}"]`);
        const loader = card.querySelector('.loader');
        loader.classList.add('active');
        
        try {
            const response = await fetch(`/numbers/${type}`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch ${typeNames[type]} numbers`);
            }
            
            const data = await response.json();
            
            // Update the UI
            updateNumberWindow(type, data);
            updateAverage(type, data.avg);
            
            // Show success notification
            showNotification(`Successfully fetched ${typeNames[type]} numbers`, 'success');
            
        } catch (error) {
            console.error(`Error fetching ${type} numbers:`, error);
            showNotification(`Error: ${error.message}`, 'error');
        } finally {
            // Hide loading state
            loader.classList.remove('active');
        }
    }
      /**
     * Update the number window with new data
     * @param {string} type - The type of numbers (p, f, e, r)
     * @param {Object} data - The data returned from the API
     */
    function updateNumberWindow(type, data) {
        const windowElement = document.getElementById(typeToWindowId[type]);
        const prevState = data.windowPrevState || [];
        const currState = data.windowCurrState || [];
        
        // Clear the window
        windowElement.innerHTML = '';
        
        // Create a map of previous numbers for quick lookup
        const prevNumbersMap = new Map();
        prevState.forEach(num => prevNumbersMap.set(num, true));
        
        // Add all current numbers to the window
        currState.forEach(num => {
            const numberItem = document.createElement('div');
            numberItem.classList.add('number-item');
            numberItem.textContent = num;
            
            // If this number wasn't in previous state, mark it as new
            if (!prevNumbersMap.has(num)) {
                numberItem.classList.add('new');
            }
            
            windowElement.appendChild(numberItem);
        });
          // If window is empty, show a message
        if (currState.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'No numbers in window';
            windowElement.appendChild(emptyMessage);
        }
        // Update the count in the dashboard
        updateDashboardCount(type, currState.length);
    }
    
    /**
     * Update the average display
     * @param {string} type - The type of numbers (p, f, e, r)
     * @param {number} avg - The average value
     */
    function updateAverage(type, avg) {
        const avgElement = document.getElementById(typeToAvgId[type]);
        const oldValue = parseFloat(avgElement.textContent);
        const newValue = parseFloat(avg);
        
        // Add animation class if value changed
        if (oldValue !== newValue) {
            avgElement.classList.add('changed');
            
            // Remove class after animation completes
            setTimeout(() => {
                avgElement.classList.remove('changed');
            }, 1000);
        }
        
        avgElement.textContent = avg;
    }
      /**
     * Show a notification message
     * @param {string} message - The message to display
     * @param {string} type - The type of notification (success, error)
          * Show a notification message
     * @param {string} message - The message to display
     * @param {string} type - The type of notification (success, error)
     */
    function showNotification(message, type) {
        notificationMessage.textContent = message;
        notification.className = 'notification';
        notification.classList.add(type);
        notification.classList.add('show');
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    /**
     * Update the dashboard count for a specific number type
     * @param {string} type - The type of numbers (p, f, e, r)
     * @param {number} count - The count to display
     */
    function updateDashboardCount(type, count) {
        const countElement = document.getElementById(typeToCountId[type]);
        const oldValue = parseInt(countElement.textContent);
        
        // Add animation class if value changed
        if (oldValue !== count) {
            countElement.classList.add('changed');
            
            // Remove class after animation completes
            setTimeout(() => {
                countElement.classList.remove('changed');
            }, 1000);
        }
        
        countElement.textContent = count;
        
        // Update progress bar in sidebar if elements exist
        const progressBar = document.querySelector(`.${typeNames[type].toLowerCase()}-progress .progress-value`);
        const progressPercent = document.getElementById(`${typeNames[type].toLowerCase()}-percent`);
        
        if (progressBar && progressPercent) {        // Calculate progress as percentage of window size (from configuration)
            const windowSize = window.APP_CONFIG ? window.APP_CONFIG.WINDOW_SIZE : 10;
            const percent = Math.round((count / windowSize) * 100);
            progressBar.style.width = `${percent}%`;
            progressPercent.textContent = `${percent}%`;
        }
    }
    
    /**
     * Apply entrance animations with delays to elements
     */
    function applyEntranceAnimations() {
        const cards = document.querySelectorAll('.card');
        const statCards = document.querySelectorAll('.stat-card');
        
        // Stagger animations for cards
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 * index);
        });
        
        // Stagger animations for stat cards
        statCards.forEach((statCard, index) => {
            setTimeout(() => {
                statCard.style.opacity = '1';
                statCard.style.transform = 'translateY(0)';
            }, 100 * index);
        });
    }
    
    // Apply entrance animations after a short delay
    setTimeout(applyEntranceAnimations, 300);