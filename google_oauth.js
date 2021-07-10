const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');

// const { Sequelize, Model, DataTypes } = require('sequelize');
// const sequelize = new Sequelize('yashvi', 'postgres', 'postgres', {
//     dialect: 'postgres',
// });

// const User = sequelize.define("user", {
//     name: DataTypes.STRING,
//     email: DataTypes.STRING,
//     token: DataTypes.STRING
// });

// (async () => {
//   await sequelize.sync({ force: true });
//   const user = User.build({ name: "user" });
//     console.log(user instanceof User); // true
//     console.log(user.name); // "user"
// })();

// (async () => {
//   await sequelize.sync();
//   const user = await GUSER.create({
//     username: 'userdoe',
//     birthday: new Date(1980, 6, 20)
//   });
//   console.log(user.toJSON());
// })();



passport.use(new GoogleStrategy({
    callbackURL: `http://localhost:5500/auth/google/redirect`,
    clientID: "5610789853-cgup6npmfrebr5sl8kfs63h6ovd83ti9.apps.googleusercontent.com",
    clientSecret: "0zA3EONrT63mui2ygwBIyNiX"
},
    function (accessToken, refreshToken, profile, done) {
        console.log(profile);
        // const email = profile.emails[0].value;
        // const username = profile.displayName;
        // const token = profile.id;


        // (async () => {
        //     await sequelize.sync();
        //     const newUser = User.findAll({ where: { token: token }});
        //     console.log(newUser.every(x => console.log(x.name)));
        // })();

        // const newUser =  User.findAll({
        //     where: {
        //         token: token
        //     }
        // });

        // // console.log(" >> ")

        // if (!newUser.name) {
        //     (async () => {
        //         await sequelize.sync();
        //         const newUser = User.build({ name: username, email: email, token: token });
        //           console.log(newUser instance of User); // true
        //           console.log(newUser.name); // "user"
        //           await newUser.save();
        //     })();
        // }
        return done(null, profile);
    }
));