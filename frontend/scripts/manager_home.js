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