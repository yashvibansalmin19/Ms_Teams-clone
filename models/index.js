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

// class NormalUser extends Model {}
//   NormalUser.init({
//     googleId : Sequelize.STRING
//   }, {
//     sequelize,
//     modelName: 'normalUser'
// })

class User extends Model { }
User.init({
    googleId: Sequelize.STRING
}, {
    sequelize,
    modelName: 'user'
});

class Token extends Model { }
Token.init({
    name: Sequelize.STRING
}, {
    sequelize,
    modelName: 'tokens'
});

User.hasMany(Token);

class Room extends Model { }
Room.init({
    roomId: Sequelize.STRING,
    startTime: Sequelize.TIME
}, {
    sequelize,
    modelName: 'room'
});

class Message extends Model { }
Message.init({
    text: Sequelize.STRING
}, {
    sequelize,
    modelName: 'message'
});

Room.hasMany(Message);
User.hasMany(Message);


// const models = {
//     user: require('./user')//(sequelize),
//     // token: require('./token')(sequelize),
//     // room: require('./room')(sequelize),
//     // message: require('./message')(sequelize),
// }

// // models.token.sync()
// // models.user.sync()

// Object.keys(models).forEach((modelName) => {
//     if ('associate' in models[modelName]) {
//         models[modelName].associate(models);
//     }
// })

// models.sequelize = sequelize;
// models.sequelize = Sequelize;

module.exports = sequelize;