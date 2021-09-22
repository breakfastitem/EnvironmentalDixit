
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");


if (process.env.NODE_ENV === "production") {
    if (process.env.MONGO_DB_URL) { // use the MONGO_DB_URL environemnt variable if available:
        mongoose.connect(`mongodb+srv://${process.env.NAME}:${process.env.PASSWORD}@${process.env.MONGO_DB_URL}`, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
    } else {
        // otherwise use the original production heroku server:
        mongoose.connect(`mongodb+srv://${process.env.NAME}:${process.env.PASSWORD}@cluster0.jfqke.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
    }

} else if (process.env.NODE_ENV === 'development') {

    /* ---- For local testing: ----- */
    mongoose.connect('mongodb://localhost/test?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

} else if (process.env.NODE_ENV === undefined) {
    console.log("Uh oh! The NODE_ENV environment variable isn't set. Please set it to 'development' for testing or 'production' for the main server. (see the \"For local testing\" comment in server.js for details)")
}

//models
const db = require("./models");


//for Heroku
const PORT = process.env.PORT || 5001;


//use the application off of express.
const app = express();

//Set up IO connection
const server = require('http').createServer(app);
const io = require('socket.io')(server);

//middleWare for post and pull
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//use files in public page
app.use(express.static(__dirname + '/public'));


//routes
require("./routes/html-routes")(app);
require("./routes/api-routes")(app, db);
const gameRoutes = require("./routes/game-routes")(app, db);

io.on('connection', socket => {
    console.log("a User connected");

    socket.on("start-new-game", () => {
        gameRoutes.startNewGame(socket.id);
    })

    socket.on("update-game-state", (data) => {
        if (!data.playerSocketId) {
            console.log("using server socket id for player because playerSocketId was not in update game state data object:", socket.id, playerSocketId)
            data.playerSocketId = socket.id;
        }
        for (const socket of sockets) {
            gameRoutes.applyGameStateChange(data)
        })

    socket.on("new-chat-message", (messageObject) => {
        console.log("chat message:", messageObject);
        io.emit("broadcast-message", messageObject);
    });



    socket.on("game-update", (messageObject) => {
        console.log("game state update: ", messageObject);
        io.emit("broadcast-game-update", messageObject);
    });
});


//start the server
server.listen(PORT, () => {
    console.log(`server at http://localhost:${PORT}  ...`);
});