'use strict'

const mongoose = require('mongoose');

const connectString = `mongodb://127.0.0.1:27017/shopDev`;

class Database {
    constructor() {
        this.connect();
    }

    connect(type = 'mongodb') {
        if (1 === 1) {
            mongoose.set('debug', true)
            mongoose.set('debug', { color: true })
        }
        mongoose.set("strictQuery", false);
        mongoose.connect(connectString)
            .then((_) => console.log('Connected DB done!'))
            .catch(err => console.log(`Error connect!${err}`));
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }

        return Database.instance;
    }
}

const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;