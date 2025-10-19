const popup = document.querySelector(".modal");
const addBtn = document.querySelector(".add_staff .add_btn"); 
const cancelBtn = document.querySelector(".add_popup .cancel"); 


function openForm() {
  document.getElementById('popup').style.display = 'flex';
}

function closeForm() {
  popup.style.display = "none";
  addBtn.focus();
}

addBtn.addEventListener("click", openForm);
cancelBtn.addEventListener("click", closeForm);

const kebabs = document.querySelectorAll('.kebab');

kebabs.forEach(kebab => {
  const middle = kebab.querySelector('.middle');
  const cross = kebab.querySelector('.cross');
  const dropdown = kebab.querySelector('.dropdown');

  kebab.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent body click from closing immediately

    // Close other dropdowns
    document.querySelectorAll('.kebab .dropdown.active').forEach(dd => {
      if(dd !== dropdown) dd.classList.remove('active');
    });

    document.querySelectorAll('.kebab .middle.active').forEach(m => {
      if(m !== middle) m.classList.remove('active');
    });

    document.querySelectorAll('.kebab .cross.active').forEach(c => {
      if(c !== cross) c.classList.remove('active');
    });

    // Toggle current one
    middle.classList.toggle('active');
    cross.classList.toggle('active');
    dropdown.classList.toggle('active');
  });
});

// Close any open kebabs when clicking outside
document.body.addEventListener('click', () => {
  document.querySelectorAll('.kebab .dropdown.active').forEach(dd => dd.classList.remove('active'));
  document.querySelectorAll('.kebab .middle.active').forEach(m => m.classList.remove('active'));
  document.querySelectorAll('.kebab .cross.active').forEach(c => c.classList.remove('active'));
});
