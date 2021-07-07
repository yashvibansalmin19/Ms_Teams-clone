const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
passport.use(new GoogleStrategy({
    callbackURL: `https://connect-video-chat.herokuapp.com/auth/google/redirect`,
    clientID: "5610789853-cgup6npmfrebr5sl8kfs63h6ovd83ti9.apps.googleusercontent.com",
    clientSecret: "0zA3EONrT63mui2ygwBIyNiX"
},
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    }),

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    }),
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user_email = profile.emails && profile.emails[0].value; //profile object has the user info
            let [user] = await db('users').select(['id', 'name', 'email']).where('email', user_email); //check whether user exist in database
            let redirect_url = "";
            if (user) {
                const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' }); //generating token
                redirect_url = `https://connect-video-chat.herokuapp.com/index/${token}` //registered on FE for auto-login
                return done(null, redirect_url);  //redirect_url will get appended to req.user object : passport.js in action
            } else {
                redirect_url = `https://connect-video-chat.herokuapp.com/login/`;  // fallback page
                return done(null, redirect_url);
            }
        } catch (error) {
            done(error)
        }
    }
));