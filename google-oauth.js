const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const Sequelize = require('sequelize')

const { Model } = require('sequelize');

const sequelize = new Sequelize('d65q5gakevpsp6', 'powszzmwuzhrdb', '1d93428f3e6f02a0286edcedbc526be2aba294e5d20245f79e275fb09fa9f604', {
    host: 'ec2-54-145-249-177.compute-1.amazonaws.com',
    port: 5432,
    dialect: "postgres",
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
});

const models = require('./models')

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
    clientID: "5610789853-cgup6npmfrebr5sl8kfs63h6ovd83ti9.apps.googleusercontent.com",
    clientSecret: "0zA3EONrT63mui2ygwBIyNiX",
    callbackURL: `http://localhost:5500/auth/google/redirect`
},
    function (accessToken, refreshToken, profile, done) {
        (async () => {
            const user = await models.models.user.findOrCreate({ where: { googleId: profile.id } })
            return done(null, user);
        })();
        /*
         use the profile info (mainly profile id) to check if the user is registerd in ur db
         If yes select the user and pass him to the done callback
         If not create the user and then select him and pass to callback
        */
        return done(null, profile);
    }
));