const Game = require("../models/Game");

describe("Game", () => {
    describe("Constructor", () => {
        it("Constructor creates object.", () => {
            let game = new Game("AAAA", "jimmy", 45);

            expect(game.gameID).toBe("AAAA");
        });
        it("When creating a new game the first player is host", () => {
            let game = new Game("AAAA", "jimmy", 45);

            expect(game.players[0].isHost).toBe(true);
        });
        it("game has player count when created", () => {
            let game = new Game("AAAA", "jimmy", 45);

            expect(game.cardCount).toBe(45);
        });
        it("Initial game state should be join", () => {
            let game = new Game("AAAA", "jimmy", 45);

            expect(game.gameStage).toBe("join");
        });
    });

    describe("Put Functions", () => {
        describe("addPlayer(playerName)", () => {
            let game = new Game("AAAA", "jimmy", 45);
            game.addPlayer("Sam");
            it("Function addPlayer(name) adds player to players object", () => {
                expect(game.players[1].name).toBe("Sam");
            });
            game.addPlayer("Billy");
            game.addPlayer("Johnny");
            game.addPlayer("Andrew");

            it("Function addPlayer(name) returns true if operation was succesful", () => {
                let isSuccessful = game.addPlayer("Timmy");
                let expected = true;
                expect(isSuccessful).toBe(expected);
            });
            it("Function addPlayer(name) returns false if adding a 7th player", () => {
                let isSuccessful = game.addPlayer("Too many");
                let expected = false;
                expect(isSuccessful).toBe(expected);
            });
        });

        describe("Start Game (settings)", () => {

            it("Function startGame() changes gamestage to main card", () => {
                let game = new Game("AAAA", "jimmy", 45);
                game.addPlayer("Billy");
                game.addPlayer("Johnny");
                game.addPlayer("Andrew");
                let settings = "settings";
                game.startGame(settings);

                expect(game.gameStage).toBe("mainCard");
            });
            it("Excepts settings parameters including deck information", () => {
                let game = new Game("AAAA", "jimmy", 45);
                game.addPlayer("Billy");
                game.addPlayer("Johnny");
                game.addPlayer("Andrew");
                let settings = { deckID: "DeckIdentifier" };
                game.startGame(settings);
                expect(game.deckID).toBe("DeckIdentifier");
            });
            it("Fails if start game before at least 3 players", () => {
                let game = new Game("AAAA", "jimmy", 45);
                game.addPlayer("Billy");
                let settings = { deckID: "DeckIdentifier" };

                let actual = game.startGame(settings);
                let expected = false;

                expect(actual).toBe(expected);
            });
        });

        describe("recieveClue(playerIndex,cardID,clue)", () => {

            let game = new Game("AAAA", "jimmy", 45);
            game.addPlayer("Billy");
            game.addPlayer("Johnny");
            game.addPlayer("Andrew");
            let settings = { deckID: "DeckIdentifier" };
            game.startGame(settings);

            game.recieveClue(0, 2, "clue");

            it("Must add clue to round data.", () => {

                let actual = game.roundData.clue;
                let expected = "clue";
                expect(actual).toBe(expected);
            });
            it("Must change gamestage to fakecards", () => {

                let expected = "fakeCards";
                expect(game.gameStage).toBe(expected);
            });
            it("Must fail if gamestage is not main card", () => {
                let actual = game.recieveClue(0, 2, "clue");
                let expected = false;

                expect(actual).toBe(expected);
            });

        });

        describe("recieveFake(playerIndex,cardID)", () => {
            let game = new Game("AAAA", "jimmy", 45);
            game.addPlayer("Billy");
            game.addPlayer("Johnny");

            let settings = { deckID: "DeckIdentifier" };
            game.startGame(settings);

            game.recieveClue(0, 2, "clue");


            game.recieveFake(0, 3);

            it("tracks players acted", () => {

                let actual = game.roundData.playersActed;
                let expected = 2;

                expect(actual).toBe(expected);
            });

            it("tracks Card Data", () => {
                let actual = game.roundData.cardArray[1].cardIdentifier;
                let expected = 3;

                expect(actual).toBe(expected);
            });

            it("if all players acted change game state", () => {
                game.recieveFake(1, 4);

                let actual = game.gameStage;
                let expected = "vote";

                expect(actual).toBe(expected);
            });
            it("if Not in fake card phase returns false", () => {
                let actual = game.recieveFake(1, 4);
                let expected = false;

                expect(actual).toBe(expected);
            });
            it("After phase is over reset playersActed for voting", () => {
                let actual = game.roundData.playersActed;
                let expected = 1;

                expect(actual).toBe(expected);
            });

        });

        describe("recieveVote(playerIndex,cardIndex)", () => {
            let game = new Game("AAAA", "jimmy", 45);
            game.addPlayer("Billy");
            game.addPlayer("Johnny");

            let settings = { deckID: "DeckIdentifier" };
            game.startGame(settings);

            game.recieveClue(game.turnOrder[0]-1, 11, "Clue");
            game.recieveFake(game.turnOrder[1]-1, 12);
            game.recieveFake(game.turnOrder[2]-1, 13);

            game.recieveVote(game.turnOrder[1]-1, 0);

            it("tally votes in card object", () => {

                let actual = game.roundData.cardArray[0].votes;
                let expected = 1;

                expect(actual).toBe(expected);

            });
            it("when all votes are tallied update gameStage to end display", () => {
                game.recieveVote(game.turnOrder[2]-1, 0);
                let actual = game.gameStage;
                let expected = "endDisplay";

                expect(actual).toBe(expected);

            });
            it("properly calculates the score", () => {
                game.recieveVote(game.turnOrder[2]-1, 1);
                let tempArray = game.roundData.cardArray.filter(card => card.playerIndex == game.turnOrder[0] - 1);
                let hostVotes = tempArray[0].votes;


                let expected;
                if (hostVotes == 1) {
                    expected = 3;
                } else {
                    expected = 0;
                }


                let actual = game.players[game.turnOrder[0] - 1].score;


                expect(actual).toBe(expected);

            });

            it("Only tallie when gamestage is vote", () => {
                let actual = game.recieveVote(1, 0);

                let expected = false;

                expect(actual).toBe(expected);

            });


        });

        describe("newRound()", () => {
            let game = new Game("AAAA", "jimmy", 45);
            game.addPlayer("Billy");
            game.addPlayer("Johnny");

            let settings = { deckID: "DeckIdentifier" };
            game.startGame(settings);

            game.recieveClue(game.turnOrder[0]-1, 11, "Clue");
            game.recieveFake(game.turnOrder[1]-1, 12);
            game.recieveFake(game.turnOrder[2]-1, 13);

            game.recieveVote(game.turnOrder[1]-1, 0);
            game.recieveVote(game.turnOrder[2]-1, 0);

            let isValid;

            it("Changes game state to clue phase, if valid", () => {
                game.newRound();
                let actual = game.gameStage;
                let expected = "mainCard";

                expect(actual).toBe(expected);
            });

            it("Increments RoundCount", () => {
                let actual = game.roundCount;
                let expected = 1;

                expect(actual).toBe(expected);
            });

            it("Returns False if game is not in endDisplay phase", () => {
                isValid = game.newRound();

                let actual = isValid;
                let expected = false;

                expect(actual).toBe(expected);
            });


        });

    });
    describe("Get Functions", () => {

        describe("Send Data (playerIndex)", () => {
            let game = new Game("AAAA", "jimmy", 45);
            game.addPlayer("Billy");
            let data;

            it("In join phase player recieves player count and there own player object. Host Player.", () => {

                data = game.sendData(0);

                console.log(data);

                expect(data).toStrictEqual({ gameID: "AAAA", gameStage: "join", playerCount: 2, players: [{ name: "jimmy", score: 0 }, { name: "Billy", score: 0 }] });
            });


            it("In main card phase senddata sends player there own hand", () => {
                game.addPlayer("Johnny");

                let settings = "settings";
                game.startGame(settings);
                data = game.sendData(0);

                let actual = data.hand;
                let expected = game.players[0].cards;

                expect(actual).toBe(expected);

            });
            it("In main card phase senddata sends player there own hand part(2)", () => {

                data = game.sendData(1);

                let actual = data.hand;
                let expected = game.players[1].cards;

                expect(actual).toBe(expected);

            });

            it("In the fakeCards phase sends clue", () => {
                game.recieveClue(game.turnOrder[0]-1, 11, "Clue");

                data = game.sendData(0);

                let actual = data.clue;
                let expected = "Clue";

                expect(actual).toBe(expected);

            });

            it("In the vote phase the player recieves the cardIds of all other's cards", () => {
                game.recieveFake(game.turnOrder[1]-1, 12);
                game.recieveFake(game.turnOrder[2]-1, 13);

                data = game.sendData(game.turnOrder[0]-1);

                let actual = data.roundCards;
                let testArray = game.roundData.cardArray;

                let filtered = testArray.filter(card => card.playerIndex != game.turnOrder[0] - 1);


                let expected = [filtered[0].cardIdentifier, filtered[1].cardIdentifier];

                expect(actual).toStrictEqual(expected);
            });

            it("In the vote phase the player recieves the cardIds of all other's cards part 2", () => {

                data = game.sendData(game.turnOrder[1]-1);

                let actual = data.roundCards;
                let testArray = game.roundData.cardArray;

                let filtered = testArray.filter(card => card.playerIndex != game.turnOrder[1] - 1);


                let expected = [filtered[0].cardIdentifier, filtered[1].cardIdentifier];

                expect(actual).toStrictEqual(expected);
            });

            it("In endDisplay If both players vote for teller or against tellerthe score is resolved", () => {
                let expected;

                if (game.roundData.cardArray[0].playerIndex == game.turnOrder[0] - 1) {
                    expected = [2, 2, 2];
                    expected[game.turnOrder[0]-1]=0;
                } else{
                    expected=[2,2,2];
                    expected[game.turnOrder[0]-1]=0;
                    expected[game.roundData.cardArray[0].playerIndex] = 4;
                }

                game.recieveVote(game.turnOrder[1]-1, 0);
                game.recieveVote(game.turnOrder[2]-1, 0);

                data = game.sendData(0);

                let actual = [data.players[0].score, data.players[1].score, data.players[2].score];


                expect(actual).toStrictEqual(expected);

            });

        });


    });
});

