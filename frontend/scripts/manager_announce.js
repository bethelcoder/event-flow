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
    alert('Announcement sent!');
    e.target.reset();
  } else {
    alert('Failed to send announcement');
  }
});
