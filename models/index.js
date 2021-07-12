const Sequelize = require('sequelize')

const { Model } = require('sequelize');

const sequelize = new Sequelize('d65q5gakevpsp6', 'powszzmwuzhrdb', '1d93428f3e6f02a0286edcedbc526be2aba294e5d20245f79e275fb09fa9f604', {
    host: 'ec2-54-145-249-177.compute-1.amazonaws.com',
    port: 5432,
    dialect: "postgres",
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 0,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
});


//UNDER DEVELOPMENT

class User extends Model { }
User.init({
    googleId: Sequelize.STRING
}, {
    sequelize,
    modelName: 'user'
});

class Room extends Model { }
Room.init({
    roomId: Sequelize.STRING,
    startTime: Sequelize.STRING
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
User.hasMany(Room);


module.exports = sequelize;





































// class User extends Model { }
// User.init({
//     googleId: Sequelize.STRING
// }, {
//     sequelize,
//     modelName: 'user'
// });

// class Token extends Model { }
// Token.init({
//     name: Sequelize.STRING
// }, {
//     sequelize,
//     modelName: 'tokens'
// });

// User.hasMany(Token);

// class Room extends Model { }
// Room.init({
//     roomId: Sequelize.STRING,
//     startTime: Sequelize.TIME
// }, {
//     sequelize,
//     modelName: 'room'
// });

// class Message extends Model { }
// Message.init({
//     text: Sequelize.STRING
// }, {
//     sequelize,
//     modelName: 'message'
// });

// Room.hasMany(Message);
// User.hasMany(Message);

// module.exports = sequelize;