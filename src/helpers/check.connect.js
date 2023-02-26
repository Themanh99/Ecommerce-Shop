'use strict'

const _SECONDS = 5000;
const os = require('os');
const process = require('process');
// count connect
const mongoose = require('mongoose');
const countConnect = () => {
    const numConnections = mongoose.connections.length;
    console.log(`Number of connected::${numConnections}`);
}
// check overload
const checkOverload = () => {
    setInterval(() => {
        const numConnections = mongoose.connections.length;
        const numCores = os.cpus.length;
        const memoryUsage = process.memoryUsage().rss;
        // Vi du maximum number  = 
        const maxConnections = numCores * 5;
        console.log(`Active connection ${numConnections}`);
        console.log(`Memory useage : ${memoryUsage / 1024 / 1024} MB`)
        if (numConnections > maxConnections) {
            console.log('Overload!')
        }

    }, _SECONDS)//every 5 seconds
}
module.exports = { countConnect, checkOverload };