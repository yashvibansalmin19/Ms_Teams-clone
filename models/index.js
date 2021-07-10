const Sequelize = require('sequelize')

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
})

const models = {
    user: require('./user')(sequelize),   //.import('./user'),
}

Object.keys(models).forEach((modelName) => {
    if ('associate' in models[modelName]) {
        models[modelName].associate(models);
    }
})

models.sequelize = sequelize;
models.sequelize = Sequelize;

module.exports = sequelize;