const Player = require("./Player");
const Utility = require("../util/Utility");


class Game {

    //Creates the game as an object. This will match what the current schema calls are doing.
    constructor(gameID, playerName, deck) {

        //Initialize game

        this.cardCount = deck.cardUrls.length;

        this.deckUrls = deck.cardUrls;

        this.deckName = deck.name;

        this.gameID = gameID;

        let player = new Player(playerName, true);

        this.players = [player];

        this.playerCount = 1;

        this.gameState = "join";

        this.roundData = {};

        this.roundCount = 0;

        this.turnOrder = [];

    }

    //Assumes name has been validated Error checks here are referenced to gamestate and other players.
    //Adds player to players if there are less than six players
    addPlayer(name, socketId) {

        if (this.gameState != "join") {
            return 377;
        }

        if (this.playerCount >= 6) {
            //Too many players.
            return 400;
        }

        let found = false;

        this.players.forEach(player => {
            if (player.name.toLowerCase() === name.toLowerCase()) {
                found = true;
            }
        });

        if (found) {
            return 399;
        }

        let player = new Player(name, false);

        this.players[socketId] = player;

        this.playerCount++;

        //Success
        return false;
    }

    startGame() {


        if (this.playerCount < 3) {
            //Not enough players
            return 400;
        }

        let cardOrder = [];

        for (let i = 1; i <= this.playerCount; i++) {
            this.turnOrder.push(i);
        }
        this.turnOrder = Utility.shuffle(this.turnOrder);



        for (let i = 0; i < this.cardCount; i++) {
            cardOrder.push(i);
        }
        cardOrder = Utility.shuffle(cardOrder);


        this.cardOrder = cardOrder;
        this.gameState = "mainCard";

        this.dealCards();

        return false;

    }

    recieveClue(playerSocketId, cardID, clue) {
        if (clue == "") {
            return 400;
        }

        if (this.gameState == "mainCard") {
            this.roundData = { playersActed: 1, clue: clue, cardArray: [{ playerSocketId: playerSocketId, cardIdentifier: cardID, votes: 0, voterIndexes: [] }] };

            this.gameState = "fakeCards";
        }

        return false;

    }

    recieveFake(playerSocketId, cardID) {
        if (this.gameState == "fakeCards") {
            this.roundData.playersActed = this.roundData.playersActed + 1;
            let card = { playerSocketId: playerSocketId, cardIdentifier: cardID, votes: 0, voterIndexes: [] }
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

    recieveVote(playerSocketId, cardIndex) {
        if (this.gameState == "vote") {
            let tempArray = this.roundData.cardArray;

            //Parses index response to account for the user submiting the missing card
            let filtered = tempArray.filter(card => card.playerSocketId != playerSocketId);
            let unfilteredCardIndex = this.roundData.cardArray.findIndex(card => card.cardIdentifier == filtered[cardIndex].cardIdentifier);


            this.roundData.playersActed = this.roundData.playersActed + 1;

            this.roundData.cardArray[unfilteredCardIndex].votes++;
            this.roundData.cardArray[unfilteredCardIndex].voterIndexes.push(playerSocketId);

            if (this.roundData.playersActed == this.playerCount) {
                //Update score


                this.players = Utility.determineScores(this.players, this.roundData, this.turnOrder[this.roundCount] - 1);


                this.gameState = "endDisplay";
            }

            return true;
        }

        return false;

    }

    newRound() {
        if (this.gameState == "endDisplay") {
            this.removeUsedCardsFromHand();
            this.roundCount = this.roundCount + 1;
            this.dealCards();
            this.gameState = "mainCard";

            return true;
        }

        return false;
    }
    sendData(playerSocketId) {
        let data;
        switch (this.gameState) {
            case "join":
                data = { cardUrls: this.deckUrls, gameID: this.gameID, gameState: this.gameState, playerCount: this.playerCount, players: this.players };

                break;
            case "mainCard":
                data = { gameState: this.gameState, playerCount: this.playerCount, players: this.players, roundCount: this.roundCount };

                data.hand = this.players[playerSocketId].cards;
                data.turnOrder = this.turnOrder;
                break;
            case "fakeCards":
                data = { gameState: this.gameState, clue: this.roundData.clue };

                data.hand = this.players[playerSocketId].cards;
                data.turnOrder = this.turnOrder;

                break;
            case "vote":
                data = { gameState: this.gameState, turnOrder: this.turnOrder, roundCount: this.roundCount };

                let tempArray = this.roundData.cardArray;

                let filtered = tempArray.filter(card => card.playerSocketId != playerSocketId);

                data.roundCards = [];

                for (let i = 0; i < filtered.length; i++) {
                    data.roundCards.push(filtered[i].cardIdentifier);
                }

                break;

            case "endDisplay":
                data = { gameState: this.gameState, players: this.players, roundData: this.roundData, roundCount: this.roundCount };
                break;
        }

        return data;

    }

    removeUsedCardsFromHand() {
        //for each player remove selected card from hand
        this.roundData.cardArray.forEach((card) => {
            this.players[card.playerSocketId].cards = this.players[card.playerSocketId].cards.filter(id => id != card.cardIdentifier);

            if (this.players[card.playerSocketId].cards == 6) {
                console.error("Used Card Not removed properly. " + this.players[card.playerSocketId].cards + " " + card.cardIdentifier);
            } else {
                this.players[card.playerSocketId].handCount = this.players[card.playerSocketId].handCount - 1;
            }

        });

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