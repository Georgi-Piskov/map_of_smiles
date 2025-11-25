/**
 * UI Module
 * Handles all user interface interactions
 */

const UI = (function() {
    // DOM Elements
    let elements = {};
    
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
            toastMessage: document.getElementById('toast-message')
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
            if (e.key === 'Escape' && !elements.modal.classList.contains('hidden')) {
                closeModal();
            }
        });
    }
    
    /**
     * Open the story submission modal
     */
    function openModal() {
        const position = MapModule.getUserPosition();
        
        if (!position) {
            showToast('Please enable location first', 'error');
            return;
        }
        
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
    
    // Public API
    return {
        init,
        openModal,
        closeModal,
        showStatus,
        hideStatus,
        showToast
    };
})();
