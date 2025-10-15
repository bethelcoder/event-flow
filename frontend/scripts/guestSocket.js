

clientData = {
    userId: user._id,
}


socket.emit('joinUserRoom', clientData.userId);



