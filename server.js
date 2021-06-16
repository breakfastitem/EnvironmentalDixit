
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");


if (process.env.NODE_ENV === "production") {

    // ---- For running in production: -----
    mongoose.connect(`mongodb+srv://${process.env.NAME}:${process.env.PASSWORD}@cluster0.jfqke.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
    , { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

} else if (process.env.NODE_ENV === 'development') {

    /* ---- For local testing: -----
    1. run the comands:
       mkdir data
       mkdir data/db
       mongod --noauth --dbpath ./data/db
    /  (note: on windows I think you use reverse slashes for the ./data/db path)
    2. create a text file in the same folder as server.js and call it ".env" (with the . at the front and no file extension).
        In that file add theses lines (to set the environment variables):
           NODE_ENV=development
           API_KEY=replace_this_with_our_flicker_api_key
    3. then run this script with node in a new terminal/prompt (ie run: "node server.js")
    */
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
require("./routes/game-routes")(app, db);

io.on('connection', socket => {
    console.log("a User connected");

    socket.on("new-message", (message) => {
        console.log(message);
        io.emit("message", message);
    });
});


//start the server
server.listen(PORT, () => {
    console.log(`server at http://localhost:${PORT}  ...`);
});