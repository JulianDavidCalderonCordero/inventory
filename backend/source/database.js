const fs = require('fs')

const { Sequelize } = require('sequelize')

const client = new Sequelize({
    database: 'defaultdb',
    username: 'avnadmin',
    host: 'inventory-db-jln-test-inventory-db.d.aivencloud.com',
    password: 'AVNS_9-xteeijc867XM-5i-h',
    dialect: 'postgres',
    port: 15119,
    dialectOptions: {
        ssl: {
            ca: fs.readFileSync('C:\\Users\\boaar\\Desktop\\julian\\inventory\\backend\\ca.pem').toString()
        }
    }
})

module.exports = {
    client
}