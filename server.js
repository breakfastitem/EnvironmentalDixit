const express = require("express");
const mongoose = require("mongoose");
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}


// setup database connection based on current NODE_ENV variable
if (process.env.NODE_ENV === "production") {
    if (process.env.MONGO_DB_URL) { // use the MONGO_DB_URL environemnt variable if available:
        mongoose.connect(`mongodb+srv://${process.env.NAME}:${process.env.PASSWORD}@${process.env.MONGO_DB_URL}`, { useNewUrlParser: true, useUnifiedTopology: true });
    } else {
        // otherwise use the original production heroku server:
        mongoose.connect(`mongodb+srv://${process.env.NAME}:${process.env.PASSWORD}@cluster0.jfqke.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });
    }

} else if (process.env.NODE_ENV === 'development') {

    /* ---- For local testing: ----- */
    mongoose.connect('mongodb://localhost/test?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

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

    // sends all connected players of the current game the updated game state representation specific to that player
    // TODO: !!!! Make sure only players of the CURRENT/SAME game get sent updates (probably already happens because  getPlayerIndexFromSocketId in getUpdatedGameState will give an error)
    async function broadcastGameUpdate(data) {
        console.log("Broadcasting game update: ", data)
        // return all Socket instances
        const sockets = await io.fetchSockets();
        for (const othersocket of sockets) {
            // skip the player socket connection that sent the update (since we already replied to them in a callback):
            if (socket.id != othersocket.id) {
                data.playerSocketId = othersocket.id

                let theGameState = gameRoutes.getUpdatedGameState(data.gameId, othersocket.id)
                console.log("sending update to socket " + othersocket.id + ": ", theGameState)
                if (theGameState && !theGameState.err) othersocket.emit("game-update", theGameState)
            }
        }
    }

    socket.on("create-new-game", (data, callback) => {
        data.playerSocketId = socket.id
        gameRoutes.createNewGame(data).then((gameState) => {
            console.log(data, "new game state:", gameState);
            callback(gameState);
            // Since no other players exist yet, no need for broadcast
        })
    });

    socket.on("join-game", (data, callback) => {
        data.playerSocketId = socket.id
        gameRoutes.applyGameStateChange("join", data).then((gameState) => {
            console.log(data, "new game state:", gameState);
            callback(gameState);
            broadcastGameUpdate(data).then() // "then" only so the async function gets called and we can use await keyword;;
        })
    });

    socket.on("start-game", (data, callback) => {
        data.playerSocketId = socket.id
        gameRoutes.applyGameStateChange("start", data).then((gameState) => {
            console.log(data, "new game state:", gameState);
            callback(gameState);
            broadcastGameUpdate(data).then() // "then" only so the async function gets called and we can use await keyword;
        })
    });

    socket.on("new-chat-message", (messageObject) => {
        console.log("chat message:", messageObject);
        io.emit("broadcast-chat-message", messageObject);
    });

});


//start the server
server.listen(PORT, () => {
    console.log(`server at http://localhost:${PORT}  ...`);
});