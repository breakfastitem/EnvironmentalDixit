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
                let playerIndex = game.getPlayerIndexFromSocketId(playerSocketId);
                if (!playerIndex) return ({ "err": "playerSocketId is not a member of this game" })
                let data = game.sendData(playerIndex);
                return data;
            }
        },
        createNewGame: (inputData) => {
            let _gameID = Utility.generateID(ids);
            console.log("input data: ", inputData)
            return db.Deck.findById(inputData.deckId).then(data => {
                console.log("deck data: ", data)
                let game = new db.Game(_gameID, inputData.playerName, inputData.playerSocketId, data);
                games.push(game);

                console.log(_gameID);
                ids.push(_gameID);

                let gameData = game.sendData(0);
                return gameData;
            }).catch((err) => {
                console.log(err);
                return ({ "err": err });
            })
        },

        applyGameStateChange: (action, stateUpdate) => {
            return new Promise((resolve, reject) => {
                let gameId = stateUpdate.gameId
                let game = getGameById(gameId)
                if (!game) {
                    resolve({ "err": "Game" + gameId + " Not Found" });
                }


                console.log("game:", game)
                console.log("stateUpdate.playerSocketId:", stateUpdate.playerSocketId)
                console.log("game.getPlayerIndexFromSocketId(stateUpdate.playerSocketId):", game.getPlayerIndexFromSocketId(stateUpdate.playerSocketId))

                stateUpdate.playerIndex = game.getPlayerIndexFromSocketId(stateUpdate.playerSocketId)
                console.log(stateUpdate)
                // delete stateUpdate.playerSocketId // not needed anymore

                let err = false;

                switch (action) {
                    case "start":

                        err = game.startGame();

                        break;
                    case "clue":

                        err = game.recieveClue(stateUpdate.playerIndex, stateUpdate.roundData.cardArray[0].cardIdentifier, stateUpdate.roundData.clue);

                        break;
                    case "fake":

                        game.recieveFake(stateUpdate.playerIndex, stateUpdate.cardIdentifier);

                        break;
                    case "vote":

                        game.recieveVote(stateUpdate.playerIndex, stateUpdate.cardIndex);

                        break;
                    case "next":

                        game.newRound();

                        break;
                    case "join":

                        err = game.addPlayer(stateUpdate.playerName);

                        break;
                }
                if (err) {
                    resolve({ "err": err });
                }

                let playerIndex = stateUpdate.playerIndex
                if (playerIndex != undefined) {
                    data = game.sendData(stateUpdate.playerIndex);
                } else {
                    data = game.sendData(434);
                }

                resolve(data);
            });
        }
    }
};