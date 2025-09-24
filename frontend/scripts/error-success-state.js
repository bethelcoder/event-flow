// EventFlow Notification Modal JavaScript
class NotificationModal {
    constructor(options = {}) {
        this.options = {
            duration: options.duration || 5000,
            autoClose: options.autoClose !== false,
            onClose: options.onClose || null,
            onShow: options.onShow || null
        };
        
        this.overlay = null;
        this.modal = null;
        this.progressFill = null;
        this.closeBtn = null;
        this.timeoutId = null;
        this.progressInterval = null;
        this.startTime = null;
        
        this.init();
    }
    
    init() {
        this.overlay = document.getElementById('notificationOverlay');
        this.modal = document.getElementById('notificationModal');
        this.progressFill = document.getElementById('progressFill');
        this.closeBtn = document.getElementById('closeBtn');
        
        if (!this.overlay || !this.modal) {
            console.error('Notification modal elements not found');
            return;
        }
        
        this.bindEvents();
        this.show();
    }
    
    bindEvents() {
        // Close button click
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }
        
        // Overlay click to close
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        });
        
        // Pause on hover
        this.modal.addEventListener('mouseenter', () => this.pause());
        this.modal.addEventListener('mouseleave', () => this.resume());
        
        // Pause on focus
        this.modal.addEventListener('focusin', () => this.pause());
        this.modal.addEventListener('focusout', () => this.resume());
    }
    
    show() {
        // Add show class with a small delay for smooth animation
        requestAnimationFrame(() => {
            this.overlay.classList.add('show');
            
            // Focus management for accessibility
            this.modal.setAttribute('tabindex', '-1');
            this.modal.focus();
            
            // Callback
            if (this.options.onShow) {
                this.options.onShow();
            }
            
            // Start auto-close timer if enabled
            if (this.options.autoClose && this.options.duration > 0) {
                this.startAutoClose();
            }
        });
    }
    
    close() {
        // Clear timers
        this.clearTimers();
        
        // Remove show class for exit animation
        this.overlay.classList.remove('show');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (this.overlay && this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
            
            // Callback
            if (this.options.onClose) {
                this.options.onClose();
            }
            
            // Restore focus to previously focused element
            this.restoreFocus();
        }, 300);
    }
    
    startAutoClose() {
        this.startTime = Date.now();
        
        // Start progress bar animation
        if (this.progressFill) {
            this.progressFill.style.transition = `width ${this.options.duration}ms linear`;
            this.progressFill.style.width = '0%';
        }
        
        // Set timeout for auto-close
        this.timeoutId = setTimeout(() => {
            this.close();
        }, this.options.duration);
    }
    
    pause() {
        if (!this.options.autoClose) return;
        
        // Clear the timeout
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        
        // Pause progress bar
        if (this.progressFill && this.startTime) {
            const elapsed = Date.now() - this.startTime;
            const remaining = Math.max(0, this.options.duration - elapsed);
            const currentWidth = (elapsed / this.options.duration) * 100;
            
            this.progressFill.style.transition = 'none';
            this.progressFill.style.width = `${Math.min(100, 100 - currentWidth)}%`;
            
            // Store remaining time for resume
            this.remainingTime = remaining;
        }
    }
    
    resume() {
        if (!this.options.autoClose || !this.remainingTime) return;
        
        // Resume progress bar
        if (this.progressFill) {
            this.progressFill.style.transition = `width ${this.remainingTime}ms linear`;
            this.progressFill.style.width = '0%';
        }
        
        // Set new timeout with remaining time
        this.timeoutId = setTimeout(() => {
            this.close();
        }, this.remainingTime);
        
        // Update start time
        this.startTime = Date.now();
        this.options.duration = this.remainingTime;
        this.remainingTime = null;
    }
    
    clearTimers() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }
    
    restoreFocus() {
        // Attempt to restore focus to the previously focused element
        const activeElement = document.activeElement;
        if (activeElement && activeElement !== document.body) {
            activeElement.blur();
        }
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if notification data is available
    if (typeof window.notificationData !== 'undefined') {
        const notification = new NotificationModal({
            duration: window.notificationData.duration,
            autoClose: window.notificationData.autoClose,
            onClose: () => {
                // Optional: Redirect or perform action after close
                if (window.notificationData.redirectUrl) {
                    window.location.href = window.notificationData.redirectUrl;
                }
            }
        });
        
        // Add any additional custom behavior based on status
        const status = window.notificationData.status;
        
        // Example: Different behaviors for different statuses
        if (status === 'error') {
            // Error notifications might stay longer
            notification.options.duration = Math.max(notification.options.duration, 7000);
        } else if (status === 'success') {
            // Success notifications might redirect after closing
            notification.options.onClose = () => {
                // Optional: Add success-specific behavior
                console.log('Success notification closed');
            };
        }
    } else {
        console.warn('No notification data found. Make sure to pass data from your route.');
    }
});

// Export for manual usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationModal;
}

// Global function for manual triggering (if needed)
window.showNotification = function(status, message, options = {}) {
    // Create notification HTML dynamically
    const notificationHTML = `
        <div class="notification-overlay" id="notificationOverlay">
            <div class="notification-modal ${status}" id="notificationModal">
                <button class="close-btn" id="closeBtn" aria-label="Close notification">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                
                <div class="notification-icon">
                    ${getIconForStatus(status)}
                </div>
                
                <div class="notification-content">
                    <h3 class="notification-title">${getTitleForStatus(status)}</h3>
                    <p class="notification-message">${message}</p>
                </div>
                
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing notification if any
    const existing = document.getElementById('notificationOverlay');
    if (existing) {
        existing.remove();
    }
    
    // Add to body
    document.body.insertAdjacentHTML('beforeend', notificationHTML);
    
    // Initialize
    return new NotificationModal(options);
};

function getIconForStatus(status) {
    const icons = {
        success: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        error: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.24 21H20.76A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86ZM12 9V13M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        warning: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        info: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    };
    return icons[status] || icons.info;
}

function getTitleForStatus(status) {
    const titles = {
        success: 'Success!',
        error: 'Error!',
        warning: 'Warning!',
        info: 'Information'
    };
    return titles[status] || 'Notification';
}