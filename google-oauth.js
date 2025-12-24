const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const Sequelize = require('sequelize')

const { sequelize, User, Message, Room } = require('./models')



passport.serializeUser(function (user, done) {
    /*
    From the user take just the id (to minimize the cookie size) and just pass the id of the user
    to the done callback
    PS: You dont have to do it like this its just usually done like this
    */
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    /*
    Instead of user this function usually recives the id 
    then you use the id to select the user from the db and pass the user obj to the done callback
    PS: You can later access this data in any routes in: req.user
    */
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/redirect'
},
    async function (accessToken, refreshToken, profile, done) {
        try {
            await User.findOrCreate({
                where: { google_id: profile.id, username: profile.displayName }
            });
            return done(null, profile);
        } catch (err) {
            console.error('Error saving user:', err);
            return done(err, null);
        }
    }
));