require('dotenv').config()
const app = require("./src/app");

const PORT = process.env.PORT || 3058;
const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

process.on("SIGINT", () => {
    server.close(() => { console.log('Exit Server express') });
})