if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

// Importing required libraries
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');
const { ExpressPeerServer } = require('peer');
const peerserver = ExpressPeerServer(server, {
    debug: process.env.NODE_ENV !== 'production'
});
const passport = require('passport');
const flash = require('express-flash');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const { sequelize, User, Message, Room } = require('./models');


//static hosting using express.

app.set('view engine', 'ejs');

require('./google-oauth');
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// parse application/x-www-form-urlencoded

app.use(bodyParser.urlencoded({ extended: true }))

// parse application/json

app.use(bodyParser.json())

// For an actual app you should configure this with an experation time, better keys, proxy and secure

app.use(cookieSession({
    name: 'connect-session',
    keys: [process.env.COOKIE_KEY_1 || 'dev-key-1', process.env.COOKIE_KEY_2 || 'dev-key-2']
}))

const methodOverride = require('method-override')

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.use(express.urlencoded({ extended: false }))
app.use(flash())

app.use(require('express-session')({
    secret: process.env.SESSION_SECRET || 'dev-session-secret',
    resave: false,
    saveUninitialized: false
}));

// Auth Routes

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/redirect', passport.authenticate('google', { failureRedirect: '/failed' }),
    function (req, res) {
        // Successful authentication, redirect homePage.
        res.render('HomePage', { uName: req.user.displayName, uId: req.user.id });
    }
);

app.use(express.static('public'));
app.use('/peerjs', peerserver);

app.get('/', function (req, res) {
    res.render('login.ejs');
})





















app.get('/HomePage/', (req, res) => {
    if (!req.user || !req.user.id) {
        res.render('HomePage.ejs', { uId: "", uName: "" })
    }
    else {
        res.render('HomePage.ejs', { uId: req.user.id, uName: req.user.displayName })
    }
})


app.get('/newMeeting/', async (req, res) => {
    const newMeetingRoomId = uuidV4();

    // Save room to DB if user is logged in
    try {
        if (req.user && req.user.id) {
            const user = await User.findOne({ where: { google_id: req.user.id } });
            if (user) {
                await Room.create({ room_id: newMeetingRoomId, UserId: user.id });
            }
        }
    } catch (err) {
        console.error('Error creating room:', err);
    }

    res.redirect(`/${newMeetingRoomId}`);
})

app.get('/:meetingId', (req, res) => {
    res.render('newMeeting', { roomId: req.params.meetingId })
})

app.get('/chatRoom/', (req, res) => {
    res.render('chatRoom.ejs');
})

app.get('/getmessagesall/:roomId', async (req, res) => {
    const roomId = req.params.roomId;
    try {
        const room = await Room.findOne({ where: { room_id: roomId } });
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        const messages = await Message.findAll({ where: { RoomId: room.id } });
        return res.json(messages);
    } catch (err) {
        console.error('Error fetching messages:', err);
        return res.status(500).json({ error: 'Failed to fetch messages' });
    }
})

app.post('/addmessagesall/:roomId', async (req, res) => {
    const roomId = req.params.roomId;
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Message text is required' });
    }

    try {
        const room = await Room.findOne({ where: { room_id: roomId } });
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        const userId = req.user ? req.user.id : null;
        const message = await Message.create({ RoomId: room.id, text: text, UserId: userId });
        return res.json(message);
    } catch (err) {
        console.error('Error adding message:', err);
        return res.status(500).json({ error: 'Failed to add message' });
    }
})




// Socket.io signalling handlers
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);

        // Handle chat messages
        socket.on('message', async (message, customUserName, createUserId) => {
            // Save message to database if user is logged in
            if (createUserId) {
                try {
                    const user = await User.findOne({ where: { google_id: createUserId } });
                    if (user) {
                        const room = await Room.findOne({ where: { UserId: user.id } });
                        if (room) {
                            await Message.create({ text: message, UserId: user.id, RoomId: room.id });
                        }
                    }
                } catch (err) {
                    console.error('Error saving message:', err);
                }
            }

            // Broadcast message to room
            io.to(roomId).emit('createMessage', message, customUserName);
        });

        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId);
        });
    });
});

// Start server
const PORT = process.env.PORT || 3000;
sequelize.sync({ alter: true }).then(() => {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to sync database:', err);
});