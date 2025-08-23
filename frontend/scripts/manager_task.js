const popup = document.querySelector(".modal");
const addBtn = document.querySelector(".top_section .Assign"); 
const cancelBtn = document.querySelector(".popup_form .cancel"); 


function openForm() {
  document.getElementById('popup').style.display = 'flex';
}

function closeForm() {
  popup.style.display = "none";
  addBtn.focus();
}

addBtn.addEventListener("click", openForm);
cancelBtn.addEventListener("click", closeForm);


function openPage(pageId, button) {
    
    document.getElementById('management').style.display = 'none';
    document.getElementById('workload').style.display = 'none';

    
    document.getElementById(pageId).style.display = 'block';

    const buttons = document.querySelectorAll('.btn_tablink');
    buttons.forEach(btn => btn.classList.remove('active'));

    
    if (button) {
        button.classList.add('active');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    openPage('management'); 
});