
const Player = require("./Player");
/**
 *  const _game = new Game({ gameID: _gameID, playerCount: 1, cardCount: 45, cardOrder: [], gameState: "join", 
 * players: 
 * [{ name: req.body.playerName, score: 0, handCount: 0, cards: [], host: true }], roundCount: 0, turnOrder: [0], roundData: { playersActed: 0, clue: "", cardArray: [] } });
 */
class Game {

    //Creates the game as an object. This will match what the current schema calls are doing.
    constructor(gameID,playerName, cardCount) {

        //Initialize game

        this.cardCount = cardCount;

        this.gameID = gameID;

        this.player = new Player(playerName,true);

        this.players=[this.player];  
        
        this.gameState="join";

    }

}

module.exports = Game;