
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

  //function to delete the program item
  async function deleteSession(sessionID) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const res = await fetch(`/manager/program/${sessionID}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        alert('Program Item deleted!');
        location.reload();
      } else {
        alert('Failed to delete Program Item.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting Program Item.');
    }
  }




