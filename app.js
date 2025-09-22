require('dotenv').config();
const express = require('express');
const passport = require('passport');
const path = require('path');

require('./backend/config/db.js');
require('./backend/config/passport');

const sessionMiddleware = require('./backend/config/session');
const authRoutes = require('./backend/routes/auth');
const indexRoutes = require('./backend/routes/index');
const guestRoutes = require('./backend/routes/guestsRoutes.js');
const checkInRoutes = require('./backend/routes/checkinRoutes.js');

const managerRoutes = require('./backend/routes/managerRoutes.js');
const staffRoutes = require('./backend/routes/staffRoutes.js');
const app = express();

app.use(sessionMiddleware);

app.set('view engine', 'ejs');
app.set('views', 'frontend/views');
app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use('/styles', express.static(path.join(__dirname, 'frontend','styles')));
app.use('/scripts', express.static(path.join(__dirname, 'frontend','scripts')));
app.use('/visuals', express.static(path.join(__dirname, 'visuals')));
app.use('/auth', authRoutes);
app.use('/', indexRoutes);
app.use('/guests', guestRoutes);
app.use('/checkin', checkInRoutes);
app.use('/manager', managerRoutes);
app.use('/staff', staffRoutes);



// Socket IO Initialisation

const chat = require('./backend/models/chat.js');
const http = require('http');
const server = http.createServer(app);
const socketio = require('socket.io');
const io = socketio(server);
app.set('io', io);


io.on('connection', function(socket){
    console.log("new websocket connection...");
    socket.on('disconnect',function(){
        console.log('a user disconnected');
    });

    // message recieved from client
    socket.on('message', async function(data){

        try{
            let chatRoom = await chat.findOne({managerId: data.managerId});

            if(!chatRoom){
                console.log("no chat was found");
            }
            const newMessage = {
                senderId: data.userId,
                senderRole: data.Role,
                content: data.text,
                timestamp: new Date()
            };
            chatRoom.messages.push(newMessage);
            await chatRoom.save();

            // server send to everyone
            io.to(data.roomId).emit('message',data);
        }
        catch(error){
            console.log('cannor save',error);
        }
    });
    socket.on('joinUserRoom', function(userId) {
    socket.join(userId);
    console.log(`User with joined room`);
    });
    socket.on('managerJoin',function(managerID){
        socket.join(managerID);
        console.log("manager joined the room");
    });
    socket.on('staffJoin',function(managerId){
        socket.join(managerId);
        console.log("staff joined the room");
    });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
