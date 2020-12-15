const express = require("express");
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://ehrman:dixit@cluster0.jfqke.mongodb.net/GameData?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
mongoose.set("returnOriginal", false);


//Game Data schema
const gameData = new mongoose.Schema({
    gameID: String,
    playerCount: Number,
    gameState: String,
    players: [{ name: String, score: Number, cards: [String],host: Boolean }],
    roundCount: Number,
    turnOrder: [Number]
});

const Game = mongoose.model('Game', gameData);

//Mongoose Connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function () {
//     // we're connected!
// });


//use the application off of express.
const app = express();

app.use(express.static(__dirname + '/public'));

//define the route for "/"
app.get("/", (request, response) => {
    //show this file when the "/" is requested
    response.sendFile(__dirname + "/index.html");
});

//adds player to the game object
//TODO:// if playername already exists dont add new player
//TODO::// only add if game is in join mode
app.get("/game/join", (req, res) => {
    let _playerCount = 0;
    let _player = { name: req.query.playerName, score: 0, cards: [""], host: false };

    let _players = [];

    Game.find({ gameID: req.query.gameId }, function (err, game) {
        if (err) return console.error(err);

        _players = game[0].players;

        _playerCount = game[0].playerCount;


        if(_playerCount<7){
            _players.push(_player);
            _playerCount++;


            Game.findOneAndUpdate({ gameID: req.query.gameId }, { playerCount: _playerCount, players: _players }, function (err, game) {
                if (err) return console.error(err);

                res.send(game);
            });

        }else{
            res.send(undecided);
        }

        
    });

});

//TODO: Create checks to see if game exists already
app.get("/game/new", (req, res) => {

    const _game = new Game({ gameID: req.query.gameId, playerCount: 1, gameState: "join", players: [{ name: req.query.playerName, score: 0, cards: [""] ,host: true}],roundCount:0,turnOrder: [0] });

    _game.save(function (err) {
        if (err) return console.error(err);
    });

    res.send(_game);

});

app.get("/game/pull", (req, res) => {

    Game.find({ gameID: req.query.gameId }, function (err, game) {

        if (err) return console.error(err);

        res.send(game[0]);
    });
});


app.get("/game/start", (req, res) => {

    Game.find({ gameID: req.query.gameId }, function (err, game) {

        if (err) return console.error(err);

        _gameState = game[0].gameState= "mainCard";

        Game.findOneAndUpdate({ gameID: req.query.gameId }, { gameState: _gameState, turnOrder: req.query.playerOrder}, function (err, game) {
            if (err) return console.error(err);

            res.send(game);
        });
    });
});

//start the server
app.listen(8080);

console.log("server at http://localhost:8080  ...");