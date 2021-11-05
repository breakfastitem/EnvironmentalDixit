const Player = require("./Player");
const Utility = require("../util/Utility");


class Game {

    //Creates the game as an object. This will match what the current schema calls are doing.
    constructor(gameID, playerName, playerSocketID, deck) {

        //Initialize game

        this.cardCount = deck.cardUrls.length;

        this.deckUrls = deck.cardUrls;

        this.deckName = deck.name;

        this.gameID = gameID;

        let player = new Player(playerName, true);

        this.players = [player];

        this.playerCount = 1;

        this.gameStage = "join";

        this.roundData = {};

        this.roundCount = 0;

        this.turnOrder = [];

        this.playerIndexToSocketIdMap = {};
        this.playerIndexToSocketIdMap[playerSocketID] = 0;

    }

    getPlayerIndexFromSocketId(playerSocketID) {
        return this.playerIndexToSocketIdMap[playerSocketID]
    }

    //Assumes name has been validated Error checks here are referenced to gamestate and other players.
    //Adds player to players if there are less than six players
    addPlayer(name, playerSocketID) {

        if (this.gameStage != "join") {
            return { err: "addPlayer called when gameStage was not 'join', was " + this.gameStage };
        }

        if (this.playerCount >= 6) {
            //Too many players.
            return { err: "Too many players (max 6)" };
        }

        let found = false;

        this.players.forEach(player => {
            if (player.name.toLowerCase() === name.toLowerCase()) {
                found = true;
            }
        });

        if (found) {
            return { err: "A player with that name already joined." };
        }

        let player = new Player(name, false);

        this.players.push(player);
        var playerIndex = this.players.length - 1
        this.playerIndexToSocketIdMap[playerSocketID] = playerIndex // store the player index in the map

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
        this.gameStage = "mainCard";

        this.dealCards();

        return false;

    }

    recieveClue(playerSocketId, cardID, clue) {
        if (clue == "") {
            return { err: "No clue provided" };
        }

        if (this.gameStage == "mainCard") {
            this.roundData = { playersActed: 1, clue: clue, cardArray: [{ playerIndex: playerIndex, cardIdentifier: cardID, votes: 0, voterIndexes: [] }] };

            this.gameStage = "fakeCards";
        }

        return false;

    }

    recieveFake(playerIndex, cardID) {
        if (this.gameStage == "fakeCards") {
            this.roundData.playersActed = this.roundData.playersActed + 1;
            let card = { playerSocketId: playerSocketId, cardIdentifier: cardID, votes: 0, voterIndexes: [] }
            this.roundData.cardArray.push(card);

            if (this.roundData.playersActed == this.playerCount) {

                //Randomizes so host card isnt displayed first

                this.roundData.playersActed = 1;
                this.gameStage = "vote";

                this.roundData.cardArray = Utility.shuffle(this.roundData.cardArray);

            }

            return true;
        }

        return false;

    }

    recieveVote(playerIndex, cardIndex) {
        if (this.gameStage == "vote") {
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


                this.gameStage = "endDisplay";
            }

            return true;
        }

        return false;

    }

    newRound() {
        if (this.gameStage == "endDisplay") {
            this.removeUsedCardsFromHand();
            this.roundCount = this.roundCount + 1;
            this.dealCards();
            this.gameStage = "mainCard";

            return true;
        }

        return false;
    }

    sendData(playerIndex) {
        let data;
        switch (this.gameStage) {
            case "join":
                data = { cardUrls: this.deckUrls, gameID: this.gameID, gameStage: this.gameStage, playerCount: this.playerCount, players: this.players, turnOrder: this.turnOrder, roundCount: this.roundCount };

                break;
            case "mainCard":
                data = { gameStage: this.gameStage, playerCount: this.playerCount, players: this.players, roundCount: this.roundCount };

                data.hand = this.players[playerSocketId].cards;
                data.turnOrder = this.turnOrder;
                break;
            case "fakeCards":
                data = { gameStage: this.gameStage, clue: this.roundData.clue };

                data.hand = this.players[playerSocketId].cards;
                data.turnOrder = this.turnOrder;

                break;
            case "vote":
                data = { gameStage: this.gameStage, turnOrder: this.turnOrder, roundCount: this.roundCount };

                let tempArray = this.roundData.cardArray;

                let filtered = tempArray.filter(card => card.playerSocketId != playerSocketId);

                data.roundCards = [];

                for (let i = 0; i < filtered.length; i++) {
                    data.roundCards.push(filtered[i].cardIdentifier);
                }

                break;

            case "endDisplay":
                data = { gameStage: this.gameStage, players: this.players, roundData: this.roundData, roundCount: this.roundCount };
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