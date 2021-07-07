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

const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
// const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = []

//static hosting using express.

app.set('view engine', 'ejs');

// app.use(express.static('public'));
// app.use('/peerjs', peerserver);

// // app.get('/', (req, res) => {
// //     res.render('index')
// // })

// app.get('/newMeeting/', (req, res) => {
//     res.redirect(`/${uuidV4()}`)
// })

// app.get('/:meetingId', (req, res) => {
//     res.render('newMeeting', { roomId: req.params.meetingId })
// })

app.use(express.urlencoded({ extended: false }))
app.use(flash())

app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
// app.use(session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false
// }))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
app.get('/auth/google/redirect', passport.authenticate('google', { session: false, failureRedirect: `https://localhost:5500/login` }), (req, res) => {
    res.redirect(req.user); //req.user has the redirection_url
});

app.get('/', checkAuthenticated, (req, res) => {
    res.render('login.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.use(express.static('public'));
app.use('/peerjs', peerserver);

// app.get('/', (req, res) => {
//     res.render('index')
// })

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

        socket.on('message', (message) => {
            //send message to the same room
            io.to(roomId).emit('createMessage', message)
        });

        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId)
        })
    })
})

//listener
//process.env.PORT
server.listen(5500, function () {
    console.log('server running on http://localhost:5500');
});