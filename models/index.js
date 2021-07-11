// const Sequelize = require('sequelize')

// const sequelize = new Sequelize('d3k5anfnkmf7kj', 'jbbhtttxoavnua', '7ec54ba61f0e69825718807f776ae577441129549cd565e2b8669d106a30389f', {
//     host: 'ec2-54-91-188-254.compute-1.amazonaws.com',
//     port: 5432,
//     dialect: "postgres",
//     dialectOptions: {
//         ssl: {
//             require: true,
//             rejectUnauthorized: false
//         }
//     },
// })

// const models = {
//     user: require('./user')(sequelize),
//     token: require('./token')(sequelize),
//     //room: require('./room')(sequelize),
//     //message: require('./chat')(sequelize),
// }

// Object.keys(models).forEach((modelName) => {
//     if ('associate' in models[modelName]) {
//         models[modelName].associate(models);
//     }
// })

// models.sequelize = sequelize;
// models.sequelize = Sequelize;

// module.exports = sequelize;


// // const Sequelize = require('sequelize')

// // const sequelize = new Sequelize('yashvi4', 'postgres', 'postgres', {
// //     dialect: 'postgres',
// // });

const Sequelize = require('sequelize')

const { Model } = require('sequelize');

const sequelize = new Sequelize('d3k5anfnkmf7kj', 'jbbhtttxoavnua', '7ec54ba61f0e69825718807f776ae577441129549cd565e2b8669d106a30389f', {
    host: 'ec2-54-91-188-254.compute-1.amazonaws.com',
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