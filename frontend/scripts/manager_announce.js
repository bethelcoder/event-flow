function openPage(pageId, button) {
    
    document.getElementById('form').style.display = 'none';
    document.getElementById('history').style.display = 'none';

    
    document.getElementById(pageId).style.display = 'block';

    const buttons = document.querySelectorAll('.btn_tablink');
    buttons.forEach(btn => btn.classList.remove('active'));

    
    if (button) {
        button.classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    openPage('form'); 
});
document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const data = Object.fromEntries(new FormData(e.target).entries());

  const res = await fetch('/manager/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  if(result.success){
    e.target.reset();
  } else {
    alert('Failed to send announcement');
  }
});

// const socket = io();
socket.emit('joinUserRoom', user._id); 
socket.on('newAnnouncement', function (announcement) {
    const count= document.getElementById('Count');
    if(count){
        let currentCount = parseInt(count.textContent);
        count.textContent = `${currentCount + 1} sent`;
    } 
const historySection = document.getElementById('history');
    if (!historySection) return;

    
    const noAnnouncements = historySection.querySelector('p');
    if (noAnnouncements && noAnnouncements.textContent.includes('No announcements')) {
        noAnnouncements.remove();
    }

    const priorityClass = {
        high: 'priority-high',
        medium: 'priority-medium',
        low: 'priority-low'
    }[announcement.priority.toLowerCase()] || '';

    const newAnnouncement = document.createElement('section');
    newAnnouncement.classList.add('announcement');             
    newAnnouncement.dataset.id = announcement._id;           

    newAnnouncement.innerHTML = `
        <section class="H_title">
        <h5 class="announe_heading">${announcement.title}</h5>
        <span class="status">${announcement.status}</span>
        <span class="announce_priority ${priorityClass}">${announcement.priority}</span>
        </section>
        <p class="description">${announcement.message}</p>
        <span class="sent_to">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
        ${announcement.audience}
         </span>
        <span class="time_date">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        ${new Date(announcement.publishedAt).toDateString()} at ${new Date(announcement.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
         </span>
        <button class="delete-announcement" data-id="${announcement._id}">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
        </button>
        `;
    
    const header = historySection.querySelector("h4");
    historySection.insertBefore(newAnnouncement, header.nextSibling);
});

const historySection = document.getElementById('history');


historySection.addEventListener('click', async (e) => {
  const button = e.target.closest('.delete-announcement');
  if (!button) return;

  const id = button.dataset.id;
  if (!id) return;

  try {
    const res = await fetch(`/manager/announcement/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.status === 204) {
      const announcementEl = button.closest('.announcement');
      if (announcementEl) announcementEl.remove();

      
      if (historySection.querySelectorAll('.announcement').length === 0) {
        const p = document.createElement('p');
        p.textContent = 'No announcements have been sent yet.';
        historySection.appendChild(p);
      }
    } else {
      const data = await res.json();
      console.error('Error deleting:', data.error);
    }
  } catch (err) {
    console.error(err);
  }
});

socket.on('announcementDeleted', (id) => {
  const announcementEl = document.querySelector(`.announcement[data-id="${id}"]`);
  if (announcementEl) announcementEl.remove();

  const count = document.getElementById('Count');
  if (count) {
    let currentCount = parseInt(count.textContent);
    count.textContent = `${currentCount - 1} sent`;
  }
});

