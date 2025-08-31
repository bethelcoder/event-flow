const socket = io();

const form = document.getElementById('form');
const input = document.getElementById('input');
const inbox = document.querySelector('.message_container');

clientData = {
    userId: user._id,
    Name: user.Username,
    Role: user.role,

    // I need to this check this out...waiting for tebogo
    managerId: "68b46384834383dfb0ffdbea",
    roomId: "68b46384834383dfb0ffdbea"
}

form.addEventListener('submit',function(event){
    event.preventDefault();
    const msg = input.value;

    if(msg){
        // message sent by client
        clientData.text = msg;
        socket.emit('message',clientData);
        input.value = '';
        input.focus();
    }
});
// message from server
socket.on('message',function(message){
    console.log(message);
    showMessage(message);
    inbox.scrollTop = inbox.scrollHeight;

});

//join the manager room
socket.emit('staffJoin',clientData.managerId);

//showing the message in the chat box
function showMessage(message){
    const section = document.createElement('section');
    if(message.userId === user._id){
        section.classList.add('message_sent');
    }
    else{
        section.classList.add('message_received');
    }

    section.innerHTML = `                    <section class="profile">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                        <p class="user_name">${message.Name}</p>
                        <strong class="user_role">${message.Role}</strong>
                        <p class="message_time">${new Date().toLocaleTimeString([],{hour: '2-digit',minute:'2-digit',hour12:'false'})}</p>
                        <span class="status"></span>
                    </section>
                    <p class="text">${message.text}</p>`;
    document.querySelector('.message_container').appendChild(section);
}