const express = require("express");
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://ehrman:dixit@cluster0.jfqke.mongodb.net/GameData?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
mongoose.set("returnOriginal", false);


//Game Data schema
const gameData = new mongoose.Schema({
    gameID: String,
    playerCount: Number,
    cardCount: Number,
    cardOrder: [Number],
    gameState: String,
    players: [{ name: String, score: Number, cards: [Number], handCount: Number, host: Boolean }],
    roundCount: Number,
    turnOrder: [Number],
    roundData: { playersActed: Number, clue: String, cardArray: [{ playerIndex: Number, cardIdentifier: Number, votes: Number, voterIndexes: [Number] }] }
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

//use files in public page
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
    let _player = { name: req.query.playerName, score: 0, handCount: 0, cards: [], host: false };

    let _players = [];

    Game.find({ gameID: req.query.gameId }, function (err, game) {
        if (err) return console.error(err);

        _players = game[0].players;

        _playerCount = game[0].playerCount;


        if (_playerCount < 7) {
            _players.push(_player);
            _playerCount++;


            Game.findOneAndUpdate({ gameID: req.query.gameId }, { playerCount: _playerCount, players: _players }, function (err, game) {
                if (err) return console.error(err);

                res.send(game);
            });

        } else {
            res.send(undefined);
        }

    });

});

//TODO: Create checks to see if game exists already
app.get("/game/new", (req, res) => {

    const _game = new Game({ gameID: req.query.gameId, playerCount: 1, cardCount: 18, cardOrder: [], gameState: "join", players: [{ name: req.query.playerName, score: 0, handCount: 0, cards: [], host: true }], roundCount: 0, turnOrder: [0], roundData: { playersActed: 0, clue: "", cardArray: [] } });

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

        _gameState = game[0].gameState = "mainCard";

        Game.findOneAndUpdate({ gameID: req.query.gameId }, { gameState: _gameState, players: req.query.players, turnOrder: req.query.playerOrder, cardOrder: req.query.cardOrder }, function (err, game) {
            if (err) return console.error(err);

            res.send(game);
        });
    });
});

app.get("/game/clue", (req, res) => {
    Game.find({ gameID: req.query.gameId }, function (err, game) {

        if (err) return console.error(err);

        _gameState = game[0].gameState = "fakeCards";

        Game.findOneAndUpdate({ gameID: req.query.gameId }, { gameState: _gameState, roundData: req.query.roundData }, function (err, game) {
            if (err) return console.error(err);

            res.send(game);
        });
    });

});

app.get("/game/fake", (req, res) => {
    Game.find({ gameID: req.query.gameId }, function (err, game) {

        if (err) return console.error(err);

        let roundData = game[0].roundData;
        let _gameState = "fakeCards";

        roundData.playersActed++;
        let cardObject = { playerIndex: req.query.playerIndex, cardIdentifier: req.query.cardIdentifier, votes: 0 };
        roundData.cardArray.push(cardObject);

        if (roundData.playersActed == game[0].playerCount) {

            _gameState = "vote";
            roundData.playersActed = 0;
        }

        Game.findOneAndUpdate({ gameID: req.query.gameId }, { gameState: _gameState, roundData: roundData }, function (err, game) {
            if (err) return console.error(err);

            res.send(game);
        });
    });
});

app.get("/game/vote", (req, res) => {
    Game.find({ gameID: req.query.gameId }, function (err, game) {

        if (err) return console.error(err);

        let roundData = game[0].roundData;
        let _gameState = "vote";

        roundData.playersActed++;

        roundData.cardArray[req.query.cardIndex].votes++;
        roundData.cardArray[req.query.cardIndex].voterIndexes.push(req.query.playerIndex);
        let _players;
        if (roundData.playersActed == game[0].playerCount - 1) {
            //Determin scores with game state information
            _players = determineScores(game[0].players, game[0].roundData);
            _gameState = "endDisplay";
        } else {
            _players = game[0].players;
        }

        Game.findOneAndUpdate({ gameID: req.query.gameId }, { players: _players, gameState: _gameState, roundData: roundData }, function (err, game) {
            if (err) return console.error(err);

            res.send(game);
        });
    });
});

app.get("/game/next", (req, res) => {
    Game.find({ gameID: req.query.gameId }, function (err, game) {

        if (err) return console.error(err);

        _gameState = game[0].gameState = "mainCard";
        _roundCount= game[0].roundCount+1;

        Game.findOneAndUpdate({ gameID: req.query.gameId }, { gameState: _gameState, roundCount: _roundCount }, function (err, game) {
            if (err) return console.error(err);

            res.send(game);
        });
    });

});


//returns players array with updated scores
function determineScores(players, roundData) {
    //find host card
    let hostIndex = roundData.cardArray[0].playerIndex;
    //If host fails
    if (roundData.cardArray[0].votes == 0 || roundData.cardArray[0].votes == players.length - 1) {
        for (let i = 0; i < players.length; i++) {
            //add otehr score points
            if (i != hostIndex) {
                players[i].score += 2;
                for (let j = 1; j < roundData.cardArray.length; j++) {
                    if (roundData.cardArray[j].playerIndex == i) {
                        players[i].score += roundData.cardArray[j].votes;
                    }
                }
            }
        }
    } else {
        players[hostIndex].score += 3;
        let voterIndexes = roundData.cardArray[0].voterIndexes;
        //Everyone who voted for correct card also gets points
        for (let i = 0; i < voterIndexes.length; i++) {
            players[voterIndexes[i]].score += 3;

        }
        //add other score points
        for (let i = 0; i < players.length; i++) {
            if (i != hostIndex) {
                for (let j = 1; j < roundData.cardArray.length; j++) {
                    if (roundData.cardArray[j].playerIndex == i) {
                        players[i].score += roundData.cardArray[j].votes;
                    }
                }
            }
        }

    }
    return players;
};

//start the server
app.listen(8080);

console.log("server at http://localhost:8080  ...");