//importing required libraries

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');
const { ExpressPeerServer } = require('peer');    // webrtc framework for video calling
const peerserver = ExpressPeerServer(server, {
    debug: true
});

//static hosting using express.

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/peerjs', peerserver);

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/newMeeting/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:meetingId', (req, res) => {
    res.render('newMeeting', { roomId: req.params.meetingId })
})

//listener
//process.env.PORT
server.listen(5500, function () {
    console.log('server running on http://localhost:5500');
});

// Signalling handlers

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected', userId)

        // messages

        socket.on('message', (message) => {
            //send message to the same room
            io.to(roomId).emit('createMessage', message)
        });

        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId)
        })
    })
})