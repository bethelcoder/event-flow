const popup = document.querySelector(".modal");
const addBtn = document.querySelector(".add_staff .add_btn"); 
const cancelBtn = document.querySelector(".add_popup .cancel"); 

// Add Staff Modal
const addStaffBtn = document.querySelector('.add_btn');
const addStaffModal = document.getElementById('popup');
const cancelButtons = document.querySelectorAll('.cancel');

// Update Event Modal
const updateEventBtn = document.querySelector('.update_event_btn');
const updateEventModal = document.getElementById('updateEventPopup');

// Delete Event Modal
const deleteEventBtn = document.querySelector('.delete_event_btn');
const deleteEventModal = document.getElementById('deleteEventPopup');

function openForm() {
  document.getElementById('popup').style.display = 'flex';
}

function closeForm() {
  popup.style.display = "none";
  addBtn.focus();
}

addBtn.addEventListener("click", openForm);
cancelBtn.addEventListener("click", closeForm);

// Open Add Staff Modal
if (addStaffBtn) {
    addStaffBtn.addEventListener('click', () => {
        addStaffModal.style.display = 'flex';
    });
}

// Open Update Event Modal
if (updateEventBtn) {
    updateEventBtn.addEventListener('click', () => {
        updateEventModal.style.display = 'flex';
    });
}

// Open Delete Event Modal
if (deleteEventBtn) {
    deleteEventBtn.addEventListener('click', () => {
        deleteEventModal.style.display = 'flex';
    });
}

// Close modals when clicking cancel buttons
cancelButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (addStaffModal) addStaffModal.style.display = 'none';
        if (updateEventModal) updateEventModal.style.display = 'none';
        if (deleteEventModal) deleteEventModal.style.display = 'none';
    });
});

// Close modals when clicking outside the popup
window.addEventListener('click', (e) => {
    if (e.target === addStaffModal) {
        addStaffModal.style.display = 'none';
    }
    if (e.target === updateEventModal) {
        updateEventModal.style.display = 'none';
    }
    if (e.target === deleteEventModal) {
        deleteEventModal.style.display = 'none';
    }
});

// Close modals on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (addStaffModal) addStaffModal.style.display = 'none';
        if (updateEventModal) updateEventModal.style.display = 'none';
        if (deleteEventModal) deleteEventModal.style.display = 'none';
    }
});