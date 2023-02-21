const express = require('express');
const { default: helmet } = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const app = express();
//init middle
app.use(morgan("dev"))
app.use(helmet())
app.use(compression())
//init DB

//init routes
app.get('/', (req, res, next) => {
    const strCom = 'ManhCT'
    return res.status(200).json({
        message: 'Welcome',
        metadata: strCom.repeat(10000)
    })
})
//handle errors
module.exports = app;