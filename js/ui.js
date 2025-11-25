/**
 * UI Module
 * Handles all user interface interactions
 */

const UI = (function() {
    // DOM Elements
    let elements = {};
    let locationSelectedToast = null;
    
    /**
     * Initialize UI elements and event listeners
     */
    function init() {
        // Cache DOM elements
        elements = {
            addBtn: document.getElementById('add-story-btn'),
            modal: document.getElementById('story-modal'),
            closeBtn: document.getElementById('close-modal'),
            form: document.getElementById('story-form'),
            textarea: document.getElementById('story-text'),
            charCount: document.getElementById('char-current'),
            emotionBtns: document.querySelectorAll('.emotion-btn'),
            selectedEmotion: document.getElementById('selected-emotion'),
            submitBtn: document.getElementById('submit-btn'),
            btnText: document.querySelector('.btn-text'),
            btnLoading: document.querySelector('.btn-loading'),
            locationStatus: document.getElementById('location-status'),
            statusText: document.getElementById('status-text'),
            toast: document.getElementById('toast'),
            toastMessage: document.getElementById('toast-message'),
            filterBtns: document.querySelectorAll('.filter-btn'),
            // Menu elements
            homeBtn: document.getElementById('home-btn'),
            menuBtn: document.getElementById('menu-btn'),
            sideMenu: document.getElementById('side-menu'),
            closeMenuBtn: document.getElementById('close-menu-btn'),
            menuOverlay: document.getElementById('menu-overlay'),
            // Menu items
            menuAbout: document.getElementById('menu-about'),
            menuPrivacy: document.getElementById('menu-privacy'),
            menuHowto: document.getElementById('menu-howto'),
            menuContact: document.getElementById('menu-contact'),
            // Info modals
            aboutModal: document.getElementById('about-modal'),
            privacyModal: document.getElementById('privacy-modal'),
            howtoModal: document.getElementById('howto-modal'),
            contactModal: document.getElementById('contact-modal'),
            infoCloseBtns: document.querySelectorAll('.info-close-btn')
        };
        
        // Bind events
        bindEvents();
        
        // Set first emotion as selected
        if (elements.emotionBtns.length > 0) {
            elements.emotionBtns[0].classList.add('selected');
        }
    }
    
    /**
     * Bind all event listeners
     */
    function bindEvents() {
        // Open modal
        elements.addBtn.addEventListener('click', openModal);
        
        // Close modal
        elements.closeBtn.addEventListener('click', closeModal);
        elements.modal.addEventListener('click', (e) => {
            if (e.target === elements.modal) closeModal();
        });
        
        // Character count
        elements.textarea.addEventListener('input', updateCharCount);
        
        // Emotion selection
        elements.emotionBtns.forEach(btn => {
            btn.addEventListener('click', () => selectEmotion(btn));
        });
        
        // Form submission
        elements.form.addEventListener('submit', handleSubmit);
        
        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (!elements.modal.classList.contains('hidden')) {
                    closeModal();
                }
                closeSideMenu();
                closeAllInfoModals();
            }
        });
        
        // Filter buttons
        elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => handleFilterClick(btn));
        });
        
        // Home button
        elements.homeBtn.addEventListener('click', goToMyLocation);
        
        // Menu button
        elements.menuBtn.addEventListener('click', openSideMenu);
        elements.closeMenuBtn.addEventListener('click', closeSideMenu);
        elements.menuOverlay.addEventListener('click', closeSideMenu);
        
        // Menu items
        elements.menuAbout.addEventListener('click', (e) => {
            e.preventDefault();
            closeSideMenu();
            openInfoModal('about-modal');
        });
        elements.menuPrivacy.addEventListener('click', (e) => {
            e.preventDefault();
            closeSideMenu();
            openInfoModal('privacy-modal');
        });
        elements.menuHowto.addEventListener('click', (e) => {
            e.preventDefault();
            closeSideMenu();
            openInfoModal('howto-modal');
        });
        elements.menuContact.addEventListener('click', (e) => {
            e.preventDefault();
            closeSideMenu();
            openInfoModal('contact-modal');
        });
        
        // Info modal close buttons
        elements.infoCloseBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.dataset.close;
                closeInfoModal(modalId);
            });
        });
        
        // Close info modals on overlay click
        [elements.aboutModal, elements.privacyModal, elements.howtoModal, elements.contactModal].forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.classList.add('hidden');
                    }
                });
            }
        });
    }
    
    /**
     * Go to user's current location
     */
    function goToMyLocation() {
        const position = MapModule.getMyPosition();
        const map = MapModule.getMap();
        
        if (position && map) {
            map.setView([position.lat, position.lng], 15);
            showToast('📍 Moved to your location', 'success');
        } else {
            showToast('Location not available', 'error');
        }
    }
    
    /**
     * Open side menu
     */
    function openSideMenu() {
        elements.sideMenu.classList.remove('hidden');
        elements.menuOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * Close side menu
     */
    function closeSideMenu() {
        elements.sideMenu.classList.add('hidden');
        elements.menuOverlay.classList.add('hidden');
        document.body.style.overflow = '';
    }
    
    /**
     * Open info modal by ID
     */
    function openInfoModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }
    
    /**
     * Close info modal by ID
     */
    function closeInfoModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }
    
    /**
     * Close all info modals
     */
    function closeAllInfoModals() {
        ['about-modal', 'privacy-modal', 'howto-modal', 'contact-modal'].forEach(id => {
            closeInfoModal(id);
        });
    }
    
    /**
     * Handle filter button click
     */
    function handleFilterClick(btn) {
        // Update active state
        elements.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Get filter value
        const filter = btn.dataset.filter;
        
        // Apply filter
        StoriesModule.filterByEmotion(filter);
    }
    
    /**
     * Open the story submission modal
     */
    function openModal() {
        const position = MapModule.getUserPosition();
        
        if (!position) {
            showToast('Please select a location on the map or enable GPS', 'error');
            return;
        }
        
        // Hide location selected prompt if visible
        hideLocationSelectedPrompt();
        
        elements.modal.classList.remove('hidden');
        elements.textarea.focus();
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * Close the story submission modal
     */
    function closeModal() {
        elements.modal.classList.add('hidden');
        document.body.style.overflow = '';
        resetForm();
        
        // Clear map selection when closing
        MapModule.clearSelection();
    }
    
    /**
     * Reset the form to initial state
     */
    function resetForm() {
        elements.form.reset();
        elements.charCount.textContent = '0';
        
        // Reset emotion selection
        elements.emotionBtns.forEach(btn => btn.classList.remove('selected'));
        if (elements.emotionBtns.length > 0) {
            elements.emotionBtns[0].classList.add('selected');
            elements.selectedEmotion.value = elements.emotionBtns[0].dataset.emotion;
        }
    }
    
    /**
     * Update character count display
     */
    function updateCharCount() {
        const count = elements.textarea.value.length;
        elements.charCount.textContent = count;
        
        // Visual warning when near limit
        if (count > CONFIG.stories.maxLength - 50) {
            elements.charCount.parentElement.style.color = '#E74C3C';
        } else {
            elements.charCount.parentElement.style.color = '';
        }
    }
    
    /**
     * Handle emotion button selection
     */
    function selectEmotion(btn) {
        elements.emotionBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        elements.selectedEmotion.value = btn.dataset.emotion;
    }
    
    /**
     * Handle form submission
     */
    async function handleSubmit(e) {
        e.preventDefault();
        
        const text = elements.textarea.value.trim();
        const emotion = elements.selectedEmotion.value;
        
        // Validation
        if (!text) {
            showToast('Please write your story', 'error');
            return;
        }
        
        if (text.length < 10) {
            showToast('Story is too short', 'error');
            return;
        }
        
        // Show loading state
        setSubmitLoading(true);
        
        // Submit story
        const result = await StoriesModule.submit(text, emotion);
        
        // Handle result
        setSubmitLoading(false);
        
        if (result.success) {
            showToast('Story shared! 🎉', 'success');
            closeModal();
        } else {
            showToast(result.message, 'error');
        }
    }
    
    /**
     * Set submit button loading state
     */
    function setSubmitLoading(loading) {
        elements.submitBtn.disabled = loading;
        elements.btnText.classList.toggle('hidden', loading);
        elements.btnLoading.classList.toggle('hidden', !loading);
    }
    
    /**
     * Show location status message
     */
    function showStatus(message, type = 'info') {
        elements.statusText.textContent = message;
        elements.locationStatus.classList.remove('hidden');
        
        if (type === 'error') {
            elements.locationStatus.style.background = '#FFEBEE';
        } else {
            elements.locationStatus.style.background = '';
        }
    }
    
    /**
     * Hide location status
     */
    function hideStatus() {
        elements.locationStatus.classList.add('hidden');
    }
    
    /**
     * Show toast notification
     */
    function showToast(message, type = 'info') {
        elements.toastMessage.textContent = message;
        elements.toast.className = 'toast';
        elements.toast.classList.add(type, 'show');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            elements.toast.classList.remove('show');
        }, 3000);
    }
    
    /**
     * Show location selected prompt
     */
    function showLocationSelected(lat, lng) {
        // Remove existing prompt if any
        hideLocationSelectedPrompt();
        
        // Create prompt element
        locationSelectedToast = document.createElement('div');
        locationSelectedToast.className = 'location-selected-prompt';
        locationSelectedToast.innerHTML = `
            <div class="prompt-content">
                <span class="prompt-text">📍 Location selected!</span>
                <button class="prompt-btn add-story-btn-prompt">Add Story Here</button>
                <button class="prompt-btn cancel-btn-prompt">Cancel</button>
            </div>
        `;
        
        document.body.appendChild(locationSelectedToast);
        
        // Bind events
        locationSelectedToast.querySelector('.add-story-btn-prompt').addEventListener('click', () => {
            hideLocationSelectedPrompt();
            openModal();
        });
        
        locationSelectedToast.querySelector('.cancel-btn-prompt').addEventListener('click', () => {
            MapModule.clearSelection();
            hideLocationSelectedPrompt();
        });
        
        // Show with animation
        setTimeout(() => locationSelectedToast.classList.add('show'), 10);
    }
    
    /**
     * Hide location selected prompt
     */
    function hideLocationSelectedPrompt() {
        if (locationSelectedToast) {
            locationSelectedToast.remove();
            locationSelectedToast = null;
        }
    }
    
    // Public API
    return {
        init,
        openModal,
        closeModal,
        showStatus,
        hideStatus,
        showToast,
        showLocationSelected,
        hideLocationSelectedPrompt
    };
})();
