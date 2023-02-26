const compression = require("compression");
const handlebars = require("express-handlebars");
const express = require("express");
const { default: helmet } = require("helmet");
const morgan = require("morgan");
const app = express();

// TODO: init middleware
app.use(morgan('combined'));
app.use(helmet());
app.use(compression());

//template engine
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
// TODO: init db
// require("./databases/init.mongodb.lv0");
require("./dbs/init.mongodb");
const { countConnect, checkOverload } = require("./helpers/check.connect");
// checkOverload();
// countConnect();
// const { checkOverload } = require("./helpers/check.connect");

// TODO: init routes
app.get("/", (req, res, next) => {
    return res.status(200).json({
        message: "Welcome Node JS eCommerce",
    });
});
// TODO: handing error

module.exports = app;