const socket = io(); 
clientData = {
    userId: user._id,
}
socket.emit('joinUserRoom', clientData.userId);
window.socket = socket;
