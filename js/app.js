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
        
        // Setup WebView banner buttons first (before map init may trigger it)
        setupWebViewBanner();
        
        // Check for WebView 
        checkWebView();
        
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
     * Setup WebView banner button handlers
     */
    function setupWebViewBanner() {
        const banner = document.getElementById('webview-banner');
        const openBtn = document.getElementById('webview-open');
        const dismissBtn = document.getElementById('webview-dismiss');
        
        if (!banner || !openBtn || !dismissBtn) return;
        
        // Open in browser button
        openBtn.addEventListener('click', () => {
            const url = window.location.href;
            
            // Try different methods to open in external browser
            if (/android/i.test(navigator.userAgent)) {
                // Android: try Chrome intent
                window.location.href = 'intent://' + url.replace(/https?:\/\//, '') + '#Intent;scheme=https;package=com.android.chrome;end';
                setTimeout(() => {
                    window.open(url, '_blank');
                }, 500);
            } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                // iOS: copy to clipboard
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(url).then(() => {
                        alert('Линкът е копиран! Отвори Safari и го постави там.');
                    });
                } else {
                    prompt('Копирай този линк и го отвори в Safari:', url);
                }
            } else {
                window.open(url, '_blank');
            }
        });
        
        // Dismiss button
        dismissBtn.addEventListener('click', () => {
            banner.classList.add('hidden');
            localStorage.setItem('webviewDismissed', Date.now().toString());
        });
    }
    
    /**
     * Check if running in WebView (Facebook, Messenger, Instagram, etc.)
     */
    function checkWebView() {
        const ua = navigator.userAgent || navigator.vendor || window.opera;
        
        console.log('📱 User Agent:', ua);
        
        // Detect various in-app browsers
        const isWebView = (
            // Facebook & Messenger (most common)
            /FBAN|FBAV|FB_IAB|FBIOS|FBSS|Messenger/i.test(ua) ||
            // Instagram
            /Instagram/i.test(ua) ||
            // Twitter
            /Twitter/i.test(ua) ||
            // TikTok
            /BytedanceWebview|TikTok|musical_ly/i.test(ua) ||
            // Snapchat
            /Snapchat/i.test(ua) ||
            // LinkedIn
            /LinkedInApp/i.test(ua) ||
            // Line & Viber
            /Line\/|Viber/i.test(ua) ||
            // Telegram
            /Telegram/i.test(ua) ||
            // WhatsApp (rare, usually opens in browser)
            /WhatsApp/i.test(ua) ||
            // Pinterest
            /Pinterest/i.test(ua) ||
            // Generic WebView markers
            /\bwv\b|WebView/i.test(ua) ||
            // iOS UIWebView or WKWebView without Safari
            (/iPhone|iPad|iPod/i.test(ua) && !/Safari/i.test(ua)) ||
            // Android WebView
            (/Android/i.test(ua) && /\bwv\b|Version\/[\d.]+.*Chrome\/[\d.]+ Mobile/i.test(ua))
        );
        
        console.log('📱 Is WebView:', isWebView);
        
        if (isWebView) {
            console.log('⚠️ WebView detected!');
            showWebViewBanner();
        } else {
            console.log('✅ Running in regular browser');
        }
    }
    
    /**
     * Show WebView warning banner
     */
    function showWebViewBanner() {
        const banner = document.getElementById('webview-banner');
        if (!banner) return;
        
        // Check if user dismissed recently (1 hour)
        const dismissedTime = localStorage.getItem('webviewDismissed');
        if (dismissedTime) {
            const hoursSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
            if (hoursSinceDismissed < 1) {
                return;
            }
        }
        
        banner.classList.remove('hidden');
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
