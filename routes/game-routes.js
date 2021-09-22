const Utility = require("../util/Utility");

module.exports = function (app, db) {

    let ids = [];
    let games = [];


    // if game doesn't exist will return undefined.
    function getGameById(gameId) {
        return games.filter(tempGame => tempGame.gameID == gameId)[0];
    }

    //Get Functions
    return {
        getUpdatedGameState: (gameId, playerSocketId) => {
            let game = getGameById(gameId)
            if (!game) {
                return ({ "err": "Game" + gameId + " Not Found" });
            } else {
                let data = game.sendData(playerSocketId);
                return data;
            }
        },
        startNewGame: (socketId) => {
            let _gameID = Utility.generateID(ids);

            db.Deck.findById(req.body.id)
                .then(data => {
                    let game = new db.Game(_gameID, req.body.playerName, data);
                    games.push(game);

                    console.log(_gameID);
                    ids.push(_gameID);

                    let gameData = game.sendData(socketId);
                    return gameData;
                })
                .catch(() => {
                    console.log(err);
                    return ({ "err": err });
                });
        },
        //PUT functions
        applyGameStateChange: (stateUpdate, res) => {
            let gameId = stateUpdate.gameId
            let game = getGameById(gameId)
            if (!game) {
                return ({ "err": "Game" + gameId + " Not Found" });
            } else {

                let funct = stateUpdate.funct
                let err = false;

                switch (funct) {
                    case "start":

                        err = game.startGame();

                        break;
                    case "clue":

                        err = game.recieveClue(stateupdate.playerSocketId, stateupdate.roundData.cardArray[0].cardIdentifier, stateupdate.roundData.clue);

                        break;
                    case "fake":

                        game.recieveFake(stateupdate.playerSocketId, stateupdate.cardIdentifier);

                        break;
                    case "vote":

                        game.recieveVote(stateupdate.playerSocketId, stateupdate.cardIndex);

                        break;
                    case "next":

                        game.newRound();

                        break;
                    case "join":

                        err = game.addPlayer(stateupdate.playerName);

                        break;
                }
                if (err) {
                    return { "err": err };
                }

                let playerSocketId = stateUpdate.funct
                if (playerSocketId != undefined) {
                    data = game.sendData(stateupdate.playerSocketId);
                } else {
                    data = game.sendData(434);
                }

                return data;
            }
        }
    }
};