
const Player = require("./Player");
const Utility = require("./Utility");
/**
 *  const _game = new Game({ gameID: _gameID, playerCount: 1, cardCount: 45, cardOrder: [], gameState: "join", 
 * players:[], roundCount: 0, turnOrder: [0], roundData: { playersActed: 0, clue: "", cardArray: [] } });
 */

//Temp may not work on export


class Game {

    //Creates the game as an object. This will match what the current schema calls are doing.
    constructor(gameID, playerName, cardCount) {

        //Initialize game

        this.cardCount = cardCount;

        this.gameID = gameID;

        this.player = new Player(playerName, true);

        this.players = [this.player];

        this.playerCount = 1;

        this.gameState = "join";

    }


    //Adds player to players if there are less than six players
    addPlayer(name) {
        if (this.playerCount < 6) {
            let player = new Player(name, false);

            this.players.push(player);

            this.playerCount++;

            //Success
            return true;
        }

        //Too many players.
        return false;
    }

    startGame(settings) {
        //TODO:: Flush out  settings
        this.settings = settings;
        this.deckID = settings.deckID;

        if (this.playerCount > 3) {

            let playerOrder = [];
            let cardOrder = [];

            for (let i = 1; i <= this.playerCount; i++) {
                playerOrder.push(i);
            }
            playerOrder = Utility.shuffle(playerOrder);



            for (let i = 0; i < this.cardCount; i++) {
                cardOrder.push(i);
            }
            cardOrder = Utility.shuffle(cardOrder);

            this.playerOrder = playerOrder;
            this.cardOrder = cardOrder;
            this.gameState = "mainCard";

            this.dealCards();

            return true;
        }

        return false;

    }
    //Always restart interval and push method after calling
    dealCards() {

        //for each player
        for (let i = 0; i < this.playerCount; i++) {
            //Give the player 6 cards
            while (this.players[i].handCount < 6) {

                let tempNum = this.cardOrder.pop();

                this.players[i].cards.push(tempNum);
                this.players[i].handCount++;
            }
        }

    };

}

module.exports = Game;