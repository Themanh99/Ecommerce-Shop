const app = require("./src/app");
const PORT = 3100;
const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

process.on("SIGINT", () => {
    server.close(() => console.log('Exit Server express'));
})