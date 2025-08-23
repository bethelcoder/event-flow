
const popup = document.querySelector(".modal");
const addBtn = document.querySelector(".add_program .item"); 
const cancelBtn = document.querySelector(".pop_section .cancel"); 


function openForm() {
  document.getElementById('popup').style.display = 'flex';
}

function closeForm() {
  popup.style.display = "none";
  addBtn.focus();
}

addBtn.addEventListener("click", openForm);
cancelBtn.addEventListener("click", closeForm);



