// Focus Timer Content Script - Applies visual themes to web pages
(function() {
    'use strict';
    
    let sessionOverlay = null;
    let currentSessionType = null;
    
    // Session theme configurations
    const sessionThemes = {
        focus: {
            overlayColor: 'rgba(255, 107, 107, 0.03)', // Very subtle red tint
            borderColor: '#ff6b6b',
            accentColor: '#ff6b6b',
            name: 'Focus Session'
        },
        break: {
            overlayColor: 'rgba(79, 172, 254, 0.03)', // Very subtle blue tint
            borderColor: '#4facfe',
            accentColor: '#4facfe',
            name: 'Break Time'
        }
    };
    
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'applySessionTheme') {
            applySessionTheme(message.sessionType);
        } else if (message.action === 'removeSessionTheme') {
            removeSessionTheme();
        }
    });
    
    // Check for active session on page load
    chrome.storage.local.get('focusTimerSession', (result) => {
        if (result.focusTimerSession && result.focusTimerSession.isActive) {
            // Check if session is still recent (within last 5 minutes)
            const sessionAge = Date.now() - result.focusTimerSession.timestamp;
            if (sessionAge < 5 * 60 * 1000) {
                applySessionTheme(result.focusTimerSession.type);
            }
        }
    });
    
    function applySessionTheme(sessionType) {
        if (currentSessionType === sessionType) return; // Already applied
        
        removeSessionTheme(); // Remove any existing theme
        
        const theme = sessionThemes[sessionType];
        if (!theme) return;
        
        currentSessionType = sessionType;
        
        // Create subtle overlay
        createSessionOverlay(theme);
        
        // Add subtle border indication
        addSessionBorder(theme);
        
        // Create session indicator
        createSessionIndicator(theme);
        
        console.log(`Applied ${sessionType} theme to page`);
    }
    
    function removeSessionTheme() {
        if (sessionOverlay) {
            sessionOverlay.remove();
            sessionOverlay = null;
        }
        
        // Remove border styling
        document.documentElement.style.removeProperty('box-shadow');
        
        // Remove any existing indicators
        const existingIndicator = document.getElementById('focus-timer-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        currentSessionType = null;
        console.log('Removed session theme from page');
    }
    
    function createSessionOverlay(theme) {
        sessionOverlay = document.createElement('div');
        sessionOverlay.id = 'focus-timer-overlay';
        sessionOverlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: ${theme.overlayColor} !important;
            pointer-events: none !important;
            z-index: 999999 !important;
            transition: opacity 0.5s ease !important;
        `;
        
        document.documentElement.appendChild(sessionOverlay);
    }
    
    function addSessionBorder(theme) {
        // Add subtle border to indicate session type
        document.documentElement.style.boxShadow = `inset 0 0 0 2px ${theme.borderColor}40`;
        document.documentElement.style.transition = 'box-shadow 0.5s ease';
    }
    
    function createSessionIndicator(theme) {
        const indicator = document.createElement('div');
        indicator.id = 'focus-timer-indicator';
        indicator.style.cssText = `
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            background: ${theme.accentColor} !important;
            color: white !important;
            padding: 8px 16px !important;
            border-radius: 20px !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            font-size: 12px !important;
            font-weight: 600 !important;
            z-index: 1000000 !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
            opacity: 0 !important;
            transform: translateY(-10px) !important;
            transition: all 0.3s ease !important;
            pointer-events: none !important;
        `;
        indicator.textContent = `🍅 ${theme.name}`;
        
        document.body.appendChild(indicator);
        
        // Animate in
        setTimeout(() => {
            indicator.style.opacity = '1';
            indicator.style.transform = 'translateY(0)';
        }, 100);
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.style.opacity = '0';
                indicator.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    if (indicator.parentNode) {
                        indicator.remove();
                    }
                }, 300);
            }
        }, 3000);
    }
    
    // Handle page navigation - reapply theme if needed
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            if (currentSessionType) {
                // Reapply theme after navigation
                setTimeout(() => {
                    const theme = sessionThemes[currentSessionType];
                    if (theme) {
                        addSessionBorder(theme);
                    }
                }, 500);
            }
        }
    }).observe(document, { subtree: true, childList: true });
    
})(); 