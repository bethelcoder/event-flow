const popup = document.querySelector(".modal");
const addBtn = document.querySelector(".add_program .item");
const cancelBtn = document.querySelector(".pop_section .cancel");
const form = document.querySelector(".pop_section");
let editingSessionId = null;

function openForm() {
  popup.style.display = "flex";
}

function closeForm() {
  popup.style.display = "none";
  editingSessionId = null;
  form.reset();
  form.querySelector('button[type="submit"]').innerText = "Add Item";
  addBtn.focus();
}

addBtn.addEventListener("click", openForm);
cancelBtn.addEventListener("click", closeForm);

async function deleteSession(sessionID) {
  if (!confirm("Are you sure you want to delete this item?")) return;
  try {
    const res = await fetch(`/manager/program/${sessionID}`, { method: "DELETE" });
    if (res.ok) {
      document.querySelector(`.Program-section[data-id="${sessionID}"]`)?.remove();
    } else {
      alert("Failed to delete Program Item.");
    }
  } catch (err) {
    console.error(err);
    alert("Error deleting Program Item.");
  }
}

function exportProgram() {
  const element = document.getElementById("programSchedule");
  html2pdf().from(element).save("program_schedule.pdf");
}

function editSession(sessionId) {
  console.log("Editing session with ID:", sessionId);
  
  const section = document.querySelector(`.Program-section[data-id="${sessionId}"]`);
  if (!section) return;

  const titleEl = section.querySelector(".title");
  const speakerEl = section.querySelector(".cartegory");
  const locationEl = section.querySelector(".vanue .text");
  const descriptionEl = section.querySelector(".description");
  const startEl = section.querySelector(".time");
  const endEl = section.querySelector(".endtime");

  openForm();

  // Fill the form with current values
  document.querySelector('input[name="title"]').value = titleEl?.innerText || "";
  document.querySelector('input[name="Speaker"]').value = speakerEl?.innerText || "";
  document.querySelector('input[name="location"]').value = locationEl?.innerText.trim() || "";
  document.querySelector('input[name="description"]').value = descriptionEl?.innerText || "";
  document.querySelector('input[name="start_time"]').value = startEl ? convertTo24(startEl.innerText) : "";
  document.querySelector('input[name="end_time"]').value = endEl ? convertTo24(endEl.innerText) : "";

  form.querySelector('button[type="submit"]').innerText = "Save Changes";
  editingSessionId = sessionId;
}

function convertTo24(timeStr) {
  if (!timeStr || (!timeStr.includes("AM") && !timeStr.includes("PM"))) return timeStr || "";
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":");
  if (modifier === "PM" && hours !== "12") hours = parseInt(hours) + 12;
  if (modifier === "AM" && hours === "12") hours = "00";
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  console.log("Submitting data:", data, "Editing session ID:", editingSessionId);

  try {
    let response;
    if (editingSessionId) {
      // UPDATE existing session
      response = await fetch(`/manager/program/${editingSessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updated = await response.json();
        console.log("Updated session:", updated);

        const section = document.querySelector(`.Program-section[data-id="${editingSessionId}"]`);
        if (section) {
          section.querySelector(".title").innerText = updated.title;
          section.querySelector(".cartegory").innerText = updated.Speaker;
          section.querySelector(".description").innerText = updated.description;
          section.querySelector(".vanue").innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <span class="text">${updated.location}</span>
          `;
          section.querySelector(".time").innerText = updated.start_time;
          section.querySelector(".endtime").innerText = updated.end_time;
        }
        closeForm();
      } else {
        alert("Failed to update session.");
      }
    } else {
      // CREATE new session
      response = await fetch("/manager/program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const created = await response.json();
        const container = document.getElementById("programSchedule");
        const section = document.createElement("section");
        section.className = "Program-section";
        section.dataset.id = created._id;

        section.innerHTML = `
          <p class="time">${created.start_time}</p>
          <p class="duration"></p>
          <h4 class="title">${created.title}</h4>
          <p class="description">${created.description}</p>
          <p class="vanue">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <span class="text">${created.location}</span>
          </p>
          <span class="cartegory">${created.Speaker}</span>
          <button class="edit" onclick="editSession('${created._id}')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
          </button>
          <button class="delete" onclick="deleteSession('${created._id}')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
          <p class="endtime">${created.end_time}</p>
        `;
        container.appendChild(section);
        closeForm();
      } else {
        alert("Failed to create session.");
      }
    }
  } catch (err) {
    console.error(err);
    alert("Error submitting form.");
  }
});
