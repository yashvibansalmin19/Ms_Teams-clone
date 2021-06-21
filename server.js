//importing required libraries

const express = require('express');
const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
app.set('view engine','ejs') ;
//static hoting using express.

app.use(express.static('public')) ;

app.get('/', (req,res)=>{
    res.render('index') ;
})

//listener

http.listen(5500, function(){
    console.log('server running on http://localhost:5500') ;
});

// Signalling handlers

io.on('connection', function(socket){
    console.log('a user is connected');

    // When clients emits create or join

    socket.on('create or join', function (room){

        var myRoom = io.sockets.adapter.rooms[room];
        var numClients = myRoom ? myRoom.length : 0;
        //console.log(room, 'has', numClients, 'clients');
        
        // These events are emitted only to the sender socket.

        if(numClients == 0){ // No users in the room
          console.log('creating room', room);  
          socket.join(room);
          socket.emit('created', room);
        }
        else if(numClients == 1){  // One user is already in the room
            console.log('joining room', room); 
            socket.join(room);
            socket.emit('joined', room);
        }
        else{  // Two participants are already in the room
            console.log('cannot create a room', room); 
            socket.emit('full', room);
        }
    })

    // Relay only handlers

    // These events are emitted to all the sockets connected to the same room except the sender.
    
    socket.on('ready', function (room){
        socket.broadcast.to(room).emit('ready');
    });

    socket.on('candidate', function(event){
        socket.broadcast.to(event.room).emit('candidate', event);
    });

    socket.on('offer', function(event){
        socket.broadcast.to(event.rooom).emit('offer', event.sdp);
    });

    socket.on('answer', function(event){
        socket.broadcast.to(even.room).emit('answer', event.sdp);
    });
});
