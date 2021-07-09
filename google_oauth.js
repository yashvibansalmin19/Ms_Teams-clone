const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
passport.use(new GoogleStrategy({
    callbackURL: `http://localhost:5500/auth/google/redirect`,
    clientID: "5610789853-cgup6npmfrebr5sl8kfs63h6ovd83ti9.apps.googleusercontent.com",
    clientSecret: "0zA3EONrT63mui2ygwBIyNiX"
},
    function (accessToken, refreshToken, profile, done) {
        console.log(profile);
        return done(null, profile);
    }
));