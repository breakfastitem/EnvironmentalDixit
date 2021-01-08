
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

        let player = new Player(playerName, true);

        this.players = [player];

        this.playerCount = 1;

        this.gameState = "join";

        this.roundData = {};

        this.roundCount = 0;

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

        if (this.playerCount >= 3) {

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

    recieveClue(playerIndex, cardID, clue) {
        if (this.gameState == "mainCard") {
            this.roundData = { playersActed: 1, clue: clue, cardArray: [{ playerIndex: playerIndex, cardIdentifier: cardID, votes: 0, voterIndexes: [] }] };

            this.gameState = "fakeCards";

            return true;
        }

        return false;

    }

    recieveFake(playerIndex, cardID) {
        if (this.gameState == "fakeCards") {
            this.roundData.playersActed = this.roundData.playersActed + 1;
            let card = { playerIndex: playerIndex, cardIdentifier: cardID, votes: 0, voterIndexes: [] }
            this.roundData.cardArray.push(card);

            if (this.roundData.playersActed == this.playerCount) {

                //Randomizes so host card isnt displayed first 

                this.roundData.playersActed = 1;
                this.gameState = "vote";

                this.roundData.cardArray = Utility.shuffle(this.roundData.cardArray);
               
                

                
            }

            return true;
        }

        return false;

    }

    recieveVote(playerIndex, cardIndex) {
        if (this.gameState == "vote") {
            this.roundData.playersActed = this.roundData.playersActed + 1;

            this.roundData.cardArray[cardIndex].votes++;
            this.roundData.cardArray[cardIndex].voterIndexes.push(playerIndex);

            if (this.roundData.playersActed == this.playerCount) {
                //Update score
                
                
                this.players = Utility.determineScores(this.players,this.roundData,this.playerOrder[this.roundCount]-1);


                this.gameState = "endDisplay";
            }

            return true;
        }

        return false;

    }

    newRound() {
        if (this.gameState == "endDisplay") {
            this.roundCount = this.roundCount + 1;
            this.dealCards();
            this.gameState = "mainCard";

            return true;
        }

        return false;
    }
    sendData(playerIndex){
        let data;
        switch(this.gameState){
            case "join":
                data= { gameState: this.gameState, playerCount:this.playerCount, players: []};

                for(let i=0;i<this.playerCount;i++){
                    data.players.push({name: this.players[i].name, score: this.players[i].score});
                }

                break;
            case "mainCard":
                data = { gameState: this.gameState, playerCount:this.playerCount, players: []};
                for(let i=0;i<this.playerCount;i++){
                    data.players.push({name: this.players[i].name, score: this.players[i].score});
                }

                data.hand= this.players[playerIndex].cards;
                data.playerOrder= this.playerOrder;
                break;
            case "fakeCards":
                data = { gameState: this.gameState, clue: this.roundData.clue};
            
                data.hand = this.players[playerIndex].cards;
                data.playerOrder= this.playerOrder;

                break;
            case "vote":
                data = { gameState: this.gameState};

                let tempArray= this.roundData.cardArray;

                let filtered = tempArray.filter(card=>card.playerIndex != playerIndex);
                
                data.roundCards=[];

                for(let i=0; i<filtered.length;i++){
                    data.roundCards.push(filtered[i].cardIdentifier);
                }

                break;

            case "endDisplay":
                data= { gameState: this.gameState,players: []};
                for(let i=0;i<this.playerCount;i++){
                    data.players.push({name: this.players[i].name, score: this.players[i].score});
                }
                break;

        }

        return data;
        
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