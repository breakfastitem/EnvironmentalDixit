require("dotenv").config();
const { response } = require("express");
const express = require("express");
const Utility = require("./util/Utility");
const mongoose = require("mongoose");
const fetch = require("node-fetch");

mongoose.connect(`mongodb+srv://${process.env.NAME}:${process.env.PASSWORD}@cluster0.jfqke.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
    , { useNewUrlParser: true, useUnifiedTopology: true });


//Models
const GameObject = require("./util/Game");
const Deck = mongoose.model('Deck', { cardUrls: [String], name: String });


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
app.get("/deck", (req, res) => {
    res.sendFile(__dirname + "/public/html/upload.html");
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
app.post("/api/deck", (req, res) => {

    if (req.body.passphrase == "thunderbird") {
        fetch(`https://www.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=${process.env.API_KEY}&photoset_id=${req.body.set}&user_id=${req.body.user}&format=json&nojsoncallback=1`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                let tempArray = data.photoset.photo.map(photo => {
                    return `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_b.jpg`;
                });

                const deck = new Deck({ name: req.body.name, cardUrls: tempArray });

                deck.save()
                    .catch(err => console.log(err))

                res.send(tempArray);

            })
            .catch(err => {
                res.sendStatus(err.code);
            });
    } else {
        res.sendStatus(400);
    }

});

app.post("/game/new", (req, res) => {

    _gameID = Utility.generateID(ids);

    let game = new GameObject(_gameID, req.body.playerName, 20);
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

            err = game.recieveClue(req.body.playerIndex, req.body.roundData.cardArray[0].cardIdentifier, req.body.roundData.clue);

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