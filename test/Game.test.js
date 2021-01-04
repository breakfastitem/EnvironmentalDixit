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

    describe("Utility Functions", () => {
        it("Function addPlayer(name) adds player to players object", () => {
            let game = new Game("AAAA", "jimmy", 45);
            game.addPlayer("Sam");

            expect(game.players[1].name).toBe("Sam");
        });
        describe("Start Game (settings)", () => {

            it("Function startGame() changes gamestate to main card", () => {
                let game = new Game("AAAA", "jimmy", 45);
                game.addPlayer("Billy");
                game.addPlayer("Johnny");
                game.addPlayer("Andrew");
                let settings = "";
                game.startGame(settings);

                expect(game.gameState).toBe("mainCard");
            });
            it("Excepts settings parameters including deck information", () => {
                let game = new Game("AAAA", "jimmy", 45);
                game.addPlayer("Billy");
                game.addPlayer("Johnny");
                game.addPlayer("Andrew");
                let settings = "";
                game.startGame(settings);
                expect(game.deckID).toBe("DeckIdentifier");
            });
        });

        describe("Send Data (playerIndex)", () => {
            let game = new Game("AAAA", "jimmy", 45);
            game.addPlayer("Billy");
            it("In join phase player recieves player count and there own player object. Host Player.", () => {
             
                let data = game.sendData(0);

                expect(data).toBe({gameState:"join" ,playerCount:2,players:[{name:"jimmy", score:0},{name:"Billy",score: 0}]});
            });
                game.addPlayer("Johnny");
                game.addPlayer("Andrew");

                let settings = "";
                game.startGame(settings);

            it("In main card phase senddata sends card ids.", () => {
                
                let data = game.sendData(0);
                let actual = data.cards != undefined;
                let expected =true;

                expect(actual).toBe(expected);
            });
        });

    });

});

