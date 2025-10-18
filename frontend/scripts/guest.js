

function openPage(pageId, button) {
   
    document.getElementById('qr').style.display = 'none';
    document.getElementById('program').style.display = 'none';
    document.getElementById('announce').style.display = 'none';
    document.getElementById('venue').style.display = 'none';
    document.getElementById('report').style.display = 'none';

    
    document.getElementById(pageId).style.display = 'block';
    
    const buttons = document.querySelectorAll('.btn_tablink');
    buttons.forEach(btn => btn.classList.remove('active'));

    button.classList.add('active');
     if (pageId === 'announce') {
    notifCount = 0;
    updateBadge();
    
      fetch(`/guests/access/${user._id}/announcements/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: event._id, guestId: user._id })
    }).catch(err => console.error('Error marking announcements as read', err));
  }
    
  }

document.addEventListener('DOMContentLoaded', () => {
    // const firstButton = document.querySelector('.btn_tablink');
    openPage('qr');
});

document.querySelector(".issue").addEventListener("submit", async (e) => {
  e.preventDefault(); // stop browser from navigating

  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  const res = await fetch(form.action, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (res.ok) {
    alert("Issue submitted successfully!");
    form.reset(); // optional
  } else {
    alert("Error submitting issue");
  }
});