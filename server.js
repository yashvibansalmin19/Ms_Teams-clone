if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

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
const models = require('./models')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const cors = require('cors')
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')


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
    name: 'tuto-session',
    keys: ['key1', 'key2']
}))

const methodOverride = require('method-override')

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.use(express.urlencoded({ extended: false }))
app.use(flash())

app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

// Auth Routes

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/redirect', passport.authenticate('google', { failureRedirect: '/failed' }),
    function (req, res) {
        // Successful authentication, redirect homePage.
        res.render('HomePage', { uId: req.user.displayName });
    }
);

const initializePassport = require('./passport-config');
const { profile } = require('console');
initializePassport(
    passport,
    email => user.find(user => user.email === email),
    id => user.find(user => user.id === id)
)

const user = []

app.use(express.static('public'));
app.use('/peerjs', peerserver);

app.get('/', function (req, res) {
    res.render('login.ejs');
})

// Login & Register & Authentication to website(under development)

// app.get('/', checkAuthenticated, (req, res) => {
//     res.render('login.ejs', { name: req.user.name })
// })

// app.get('/login', checkNotAuthenticated, (req, res) => {
//     res.redirect('/register');
// })

// app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
//     successRedirect: '/HomePage',
//     failureRedirect: '/',
//     failureFlash: true
// }))

// app.get('/register', checkNotAuthenticated, (req, res) => {
//     res.render('register.ejs')
//     console.log(user);
// })


// app.post('/register', checkNotAuthenticated, async (req, res) => {
//     console.log(req.body);
// });

// app.delete('/logout', (req, res) => {
//     req.logOut()
//     res.redirect('/login')
// })

// function checkAuthenticated(req, res, next) {
//     if (req.isAuthenticated()) {
//         return next()
//     }

//     res.redirect('/HomePage')
// }

// function checkNotAuthenticated(req, res, next) {
//     if (req.isAuthenticated()) {
//         return res.redirect('/register')
//     }
//     next()
// }

app.get('/HomePage/', (req, res) => {
    if (!req.user.id) {
        res.render('Homepage .ejs', { uId: "" })
    }
    else {
        res.render('HomePage.ejs', { uId: req.user.displayName })
    }
})

app.get('/newMeeting/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:meetingId', (req, res) => {
    res.render('newMeeting', { roomId: req.params.meetingId })
})

// Signalling handlers

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected', userId)

        // messages

        socket.on('message', (message, customUserId) => {
            //send message to the same room
            console.log(customUserId)

            const saveMessage = models.models.message.findOrCreate({ where: { text: message } })

            io.to(roomId).emit('createMessage', message, customUserId)
        });

        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId)
        })
    })
})

//listener
//process.env.PORT
models.sync().then(x => {
    server.listen(process.env.PORT, function () {
        console.log('server running on https://connect-video-chat.herokuapp.com/');
    });
})