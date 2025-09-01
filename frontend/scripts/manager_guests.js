function openPage(pageId, button) {
 
    document.getElementById('Invitations').style.display = 'none';
    document.getElementById('Guest_list').style.display = 'none';
    document.getElementById('EmailTemplate').style.display = 'none';

    document.getElementById(pageId).style.display = 'block';


    const buttons = document.querySelectorAll('.btn_tablink');
    buttons.forEach(btn => btn.classList.remove('active'));
    button?.classList.add('active'); 
}

document.addEventListener('DOMContentLoaded', () => {
    openPage('Invitations');
});

// Grabbing inputs for guest details
const inviteBtn = document.getElementById('sendInvite');
const guestName = document.getElementById('Guest_name');
const guestEmail = document.getElementById('Guest_email');
const errorSection = document.getElementById('errorSection');

inviteBtn.addEventListener('click', async () => {
    const name = guestName.value.trim();
    const email = guestEmail.value.trim();

    // Validate inputs
    if (!name || !email) {
        errorSection.innerHTML = "Please fill in all details";
        errorSection.style.display = 'block';
        return;
    }

    if (!validateEmail(email)) {
        errorSection.innerHTML = "Please enter a valid email address";
        errorSection.style.display = 'block';
        return;
    }

    errorSection.style.display = 'none';

    const managerInput = document.getElementById("manager-id");
    const managerDetails = {
        id: managerInput.value,
        name: managerInput.dataset.name
    };

    try {
        const res = await fetch("/manager/send-guest-invite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email,
                fullName: name,
                manager: managerDetails
            })
        });

        // Check if response is JSON
        const contentType = res.headers.get("content-type");
        let data;
        if (contentType && contentType.includes("application/json")) {
            data = await res.json();
        } else {
            const text = await res.text();
            console.log("Non-JSON response:", text);
            data = { success: true, message: "Invite sent (non-JSON response)" };
        }

        if (res.ok && data.success) {
            alert("Guest Invitation successfully sent.");
            guestName.value = "";
            guestEmail.value = "";
        } else {
            alert(data.message || `Failed to send invite. Status: ${res.status}`);
        }

    } catch (error) {
        console.error("Fetch error:", error);
        alert("There was an error with our email system. Please try again later.");
    }
});

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
}


