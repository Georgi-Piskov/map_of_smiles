/**
 * Map of Smiles - Main Application
 * A web app showing positive, anonymous stories pinned on a map
 */

(function() {
    'use strict';
    
    // Store the install prompt for later
    let deferredPrompt = null;
    
    /**
     * Initialize the application
     */
    function init() {
        console.log('🗺️ Map of Smiles initializing...');
        
        // Initialize UI first
        UI.init();
        
        // Initialize map
        MapModule.init();
        
        // Register service worker for PWA
        registerServiceWorker();
        
        // Setup install prompt
        setupInstallPrompt();
        
        console.log('✅ Map of Smiles ready!');
    }
    
    /**
     * Register Service Worker for PWA functionality
     */
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then((registration) => {
                        console.log('✅ Service Worker registered:', registration.scope);
                    })
                    .catch((error) => {
                        console.log('❌ Service Worker registration failed:', error);
                    });
            });
        }
    }
    
    /**
     * Setup PWA Install Prompt
     */
    function setupInstallPrompt() {
        const installBanner = document.getElementById('install-banner');
        const installBtn = document.getElementById('install-btn');
        const installDismiss = document.getElementById('install-dismiss');
        
        // Check if already installed or dismissed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('📱 App is already installed');
            return;
        }
        
        if (localStorage.getItem('installDismissed')) {
            // Check if dismissed more than 7 days ago
            const dismissedTime = parseInt(localStorage.getItem('installDismissed'));
            const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
            if (daysSinceDismissed < 7) {
                console.log('📱 Install prompt dismissed recently');
                return;
            }
        }
        
        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('📱 beforeinstallprompt fired');
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Save the event for later
            deferredPrompt = e;
            // Show our custom install banner
            installBanner.classList.remove('hidden');
        });
        
        // Handle install button click
        installBtn.addEventListener('click', async () => {
            if (!deferredPrompt) {
                console.log('📱 No install prompt available');
                return;
            }
            
            // Show the native install prompt
            deferredPrompt.prompt();
            
            // Wait for the user's response
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`📱 User response: ${outcome}`);
            
            // Clear the prompt
            deferredPrompt = null;
            
            // Hide our banner
            installBanner.classList.add('hidden');
            
            if (outcome === 'accepted') {
                UI.showToast('🎉 Thanks for installing!', 'success');
            }
        });
        
        // Handle dismiss button click
        installDismiss.addEventListener('click', () => {
            installBanner.classList.add('hidden');
            // Remember that user dismissed (for 7 days)
            localStorage.setItem('installDismissed', Date.now().toString());
        });
        
        // Listen for successful installation
        window.addEventListener('appinstalled', () => {
            console.log('📱 App was installed');
            installBanner.classList.add('hidden');
            deferredPrompt = null;
        });
    }
    
    // Start app when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
