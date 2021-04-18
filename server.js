
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");


mongoose.connect(`mongodb+srv://${process.env.NAME}:${process.env.PASSWORD}@cluster0.jfqke.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
    , { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

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