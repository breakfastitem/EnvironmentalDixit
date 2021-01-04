const Game = require("../util/Game");

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

            expect(game.gameState).toBe("join");
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

            it("Function startGame() changes gamestate to main card", () => {
                let game = new Game("AAAA", "jimmy", 45);
                game.addPlayer("Billy");
                game.addPlayer("Johnny");
                game.addPlayer("Andrew");
                let settings = "settings";
                game.startGame(settings);

                expect(game.gameState).toBe("mainCard");
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

        describe("recieveClue(cardID,clue)", () => {

            let game = new Game("AAAA", "jimmy", 45);
            game.addPlayer("Billy");
            game.addPlayer("Johnny");
            game.addPlayer("Andrew");
            let settings = { deckID: "DeckIdentifier" };
            game.startGame(settings);
            
            it("Must add clue to round data.", () => {
                game.recieveClue(2, "clue");
                let actual = game.roundData.clue;
                let expected = "clue";
                expect(actual).toBe(expected);
            });

        });

    });
    describe("Get Functions", () => {

        describe("Send Data (playerIndex)", () => {
            let game = new Game("AAAA", "jimmy", 45);
            game.addPlayer("Billy");
            it("In join phase player recieves player count and there own player object. Host Player.", () => {

                let data = game.sendData(0);

                expect(data).toBe({ gameState: "join", playerCount: 2, players: [{ name: "jimmy", score: 0 }, { name: "Billy", score: 0 }] });
            });
            game.addPlayer("Johnny");
            game.addPlayer("Andrew");

            let settings = "settings";
            game.startGame(settings);

            it("In main card phase senddata sends player hand ids.", () => {

                let data = game.sendData(0);
                let actual = data.cards != undefined;
                let expected = true;

                expect(actual).toBe(expected);

            });
        });


    });
});

