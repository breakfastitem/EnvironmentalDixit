const { response } = require("express");
const express = require("express");
const Utility = require("./util/Utility");

const GameObject = require("./util/Game");


//for Heroku
const PORT = process.env.PORT || 5000;

let ids = [];
let games = [];

//use the application off of express.
const app = express();

//middleWare for post and pull
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//use files in public page
app.use(express.static(__dirname + '/public'));


//define the route for "/"
app.get("/", (request, response) => {
    //show this file when the "/" is requested
    response.sendFile(__dirname + "/index.html");
});

//Get Functions
app.get("/game/pull/:gameid/:playerIndex", (req, res) => {
    let gameId;

    switch (req.params.gameid) {
        case "new":
            gameId = ids[ids.length - 1];

            break;

        default:
            gameId = req.params.gameid;

            break;

    }

    let tempArray = games.filter(game => game.gameID == gameId);

    if (tempArray.length == 0) {
        res.sendStatus(400, "Game" + gameId + " Not Found");
    } else {
        let game = tempArray[0];

        let data = game.sendData(req.params.playerIndex);

        res.send(data);
    }

});


//POST Functions
app.post("/game/new", (req, res) => {

    _gameID = Utility.generateID(ids);

    let game = new GameObject(_gameID, req.body.playerName, 27);
    games.push(game);

    console.log(_gameID);
    ids.push(_gameID);

    //TODO:: Instead of this emit a web socket broadcast
    res.sendStatus(200);

});

//PUT functions
app.put("/game/:funct", (req, res) => {
    let funct = req.params.funct;
    let game = games.filter(tempGame => tempGame.gameID == req.body.gameId)[0];

    if (game === undefined) {
        res.sendStatus(404);
        return;
    }

    let err = false;

    switch (funct) {
        case "start":

            err = game.startGame("");

            break;
        case "clue":

            game.recieveClue(req.body.playerIndex, req.body.roundData.cardArray[0].cardIdentifier, req.body.roundData.clue);

            break;
        case "fake":

            game.recieveFake(req.body.playerIndex, req.body.cardIdentifier);
            break;
        case "vote":

            game.recieveVote(req.body.playerIndex, req.body.cardIndex);
            break;
        case "next":

            game.newRound();
            break;
        case "join":

            err = game.addPlayer(req.body.playerName);
            break;
    }
    if (err) {
        res.sendStatus(err);
        return;
    }
    res.sendStatus(200);
});

//start the server
app.listen(PORT);

console.log(`server at http://localhost:${PORT}  ...`);