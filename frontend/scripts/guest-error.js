// EventFlow Guest Error Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize page animations
    initializeAnimations();
    
    // Add interaction handlers
    addInteractionHandlers();
    
    // Add accessibility features
    addAccessibilityFeatures();
});

function initializeAnimations() {
    // Stagger animation for action cards
    const actionCards = document.querySelectorAll('.action-card');
    actionCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 + (index * 150));
    });
    
    // Animate main content
    const mainElements = [
        '.icon-wrapper',
        '.main-title',
        '.subtitle',
        '.message-card'
    ];
    
    mainElements.forEach((selector, index) => {
        const element = document.querySelector(selector);
        if (element) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.5s ease-out';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        }
    });
}

function addInteractionHandlers() {
    // Add hover effects to action cards
    const actionCards = document.querySelectorAll('.action-card');
    
    actionCards.forEach(card => {
        // Mouse enter effect
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            
            // Add glow effect to icon
            const icon = this.querySelector('.action-icon');
            icon.style.boxShadow = '0 8px 25px rgba(249, 115, 22, 0.4)';
        });
        
        // Mouse leave effect
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-4px)';
            
            // Remove glow effect
            const icon = this.querySelector('.action-icon');
            icon.style.boxShadow = 'none';
        });
        
        // Click effect for better mobile interaction
        card.addEventListener('click', function() {
            this.style.transform = 'translateY(-2px)';
            
            setTimeout(() => {
                this.style.transform = 'translateY(-4px)';
            }, 150);
        });
    });
    
    // Add click effect to lock icon
    const errorIcon = document.querySelector('.error-icon');
    if (errorIcon) {
        errorIcon.addEventListener('click', function() {
            // Add a bounce effect
            this.style.animation = 'none';
            this.offsetHeight; // Trigger reflow
            this.style.animation = 'bounce 0.6s ease-in-out';
        });
    }
    
    // Add QR code animation on hover
    const qrIcon = document.querySelector('.qr-icon');
    if (qrIcon) {
        qrIcon.addEventListener('mouseenter', function() {
            const dots = this.querySelectorAll('.qr-dot');
            dots.forEach((dot, index) => {
                setTimeout(() => {
                    dot.style.transform = 'scale(1.2)';
                    dot.style.transition = 'transform 0.2s ease';
                    
                    setTimeout(() => {
                        dot.style.transform = 'scale(1)';
                    }, 100);
                }, index * 50);
            });
        });
    }
}

function addAccessibilityFeatures() {
    // Add keyboard navigation for action cards
    const actionCards = document.querySelectorAll('.action-card');
    
    actionCards.forEach(card => {
        // Make cards focusable
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        
        // Add keyboard event handlers
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
        
        // Focus styles
        card.addEventListener('focus', function() {
            this.style.outline = '3px solid #f97316';
            this.style.outlineOffset = '2px';
        });
        
        card.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });
    
    // Add ARIA labels for better screen reader support
    const qrCard = document.querySelector('.action-card:first-child');
    const refCard = document.querySelector('.action-card:last-child');
    
    if (qrCard) {
        qrCard.setAttribute('aria-label', 'Show QR Code option - Present your digital QR code to security');
    }
    
    if (refCard) {
        refCard.setAttribute('aria-label', 'Reference Number option - Provide your unique reference number to security');
    }
}

// Add prefers-reduced-motion support
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Disable animations for users who prefer reduced motion
    const style = document.createElement('style');
    style.textContent = `
        *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    `;
    document.head.appendChild(style);
}

// Add bounce animation keyframe
const bounceAnimation = document.createElement('style');
bounceAnimation.textContent = `
    @keyframes bounce {
        0%, 20%, 53%, 80%, 100% {
            transform: scale(1);
        }
        40%, 43% {
            transform: scale(1.1);
        }
        70% {
            transform: scale(1.05);
        }
        90% {
            transform: scale(1.02);
        }
    }
`;
document.head.appendChild(bounceAnimation);

// Error handling for missing elements
function safeQuerySelector(selector) {
    try {
        return document.querySelector(selector);
    } catch (error) {
        console.warn(`Element not found: ${selector}`);
        return null;
    }
}

// Performance optimization - throttle scroll events if needed
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}