"use strict";

const mongoose = require("mongoose");
const {
  db: { host, port, name },
} = require("../configs/config.mongodb.js");
const { countConnect } = require("../helpers/check.connect.js");
const connectString = `mongodb://${host}:${port}/${name}`;

/**
 * Database is used singleton pattern
 */
class Database {
  constructor() {
    this.connect();
  }

  connect(type = "mongodb") {
    if (1 === 1) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }
    mongoose.set("strictQuery", false);
    mongoose
      .connect(connectString, { maxPoolSize: 50 })
      .then((_) =>
        console.log("Connected DB done!", connectString, countConnect())
      )
      .catch((err) => console.log(`Error connect!${err}`));
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
