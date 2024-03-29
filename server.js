if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");


if (process.env.NODE_ENV === "production") {
    mongoose.connect(`${process.env.MONGO_DB_URL}`, { useNewUrlParser: true, useUnifiedTopology: true });

} else if (process.env.NODE_ENV === 'development') {
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
require("./routes/game-routes")(app, db, io);

io.on('connection', socket => {
    console.log("a User connected");

    socket.on("new-chat-message", (message) => {
        console.log(message);


        io.emit("chat-message-posted", message);
    });

});


//start the server
server.listen(PORT, () => {
    console.log(`server at http://localhost:${PORT}  ...`);
});