function openPage(pageId, button) {
   
    document.getElementById('qr').style.display = 'none';
    document.getElementById('program').style.display = 'none';
    document.getElementById('venue').style.display = 'none';
    document.getElementById('report').style.display = 'none';

    
    document.getElementById(pageId).style.display = 'block';
    
    const buttons = document.querySelectorAll('.btn_tablink');
    buttons.forEach(btn => btn.classList.remove('active'));

    button.classList.add('active');
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