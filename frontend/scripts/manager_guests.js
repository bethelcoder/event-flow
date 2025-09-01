function openPage(pageId, button) {
   
    document.getElementById('Invitations').style.display = 'none';
    document.getElementById('Guest_list').style.display = 'none';
    document.getElementById('EmailTemplate').style.display = 'none';

    
    document.getElementById(pageId).style.display = 'block';
    
    const buttons = document.querySelectorAll('.btn_tablink');
    buttons.forEach(btn => btn.classList.remove('active'));

    button.classList.add('active');

}

document.addEventListener('DOMContentLoaded', () => {
    openPage('Invitations');
});


//Grabbing inputs for guests details
const inviteBtn = document.getElementById('sendInvite');
const guestName = document.getElementById('Guest_name');
const guestEmail = document.getElementById('Guest_email');
const errorSection = document.getElementById('errorSection');

inviteBtn.addEventListener('click', async () => {
    if(!guestName.value.trim() || !guestEmail.value.trim()) {
        errorSection.innerHTML = "Please fill in all details";
        errorSection.style.display = 'block';
    } else {
    if (!validateEmail(guestEmail.value)) {
            errorSection.innerHTML = "Please enter a valid email address";
            errorSection.style.display = 'block';
        } else {
            errorSection.style.display = 'none';
            // proceed with sending invite
            const managerInput = document.getElementById("manager-id");

            const managerDetails = {
            id: managerInput.value,
            name: managerInput.dataset.name,
            };

            try {
                const res = await fetch("/manager/send-guest-invite", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                    email: guestEmail.value,
                    fullName: guestName.value,
                    manager: managerDetails
                    })
                });

                const data = await res.json();

                if (data.success) {
                    alert("Guest Invitation successfully sent.");
                } else {
                    alert(data.message || "Failed to send invite.");
                }
                } catch (error) {
                    alert("There was an error with our email system. Please try again later.");
                    console.log(error);
                }
            
        }
    }
});

function validateEmail(email) {
    // Simple regex for basic email validation
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
}
