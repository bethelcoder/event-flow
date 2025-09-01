document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('venueModal');

  function openModal() {
    modal.style.display = 'flex';  
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  }

  window.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  window.openModal = openModal;
  window.closeModal = closeModal;




  
});

