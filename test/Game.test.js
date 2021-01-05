const Game = require("../util/Game");

describe("Mock test",()=>{

})

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

        describe("recieveClue(playerIndex,cardID,clue)", () => {

            let game = new Game("AAAA", "jimmy", 45);
            game.addPlayer("Billy");
            game.addPlayer("Johnny");
            game.addPlayer("Andrew");
            let settings = { deckID: "DeckIdentifier" };
            game.startGame(settings);

            game.recieveClue(0,2, "clue");
           
            it("Must add clue to round data.", () => {
               
                let actual = game.roundData.clue;
                let expected = "clue";
                expect(actual).toBe(expected);
            });
            it("Must change gamestate to fakecards", () => {
               
                let expected = "fakeCards";
                expect(game.gameState).toBe(expected);
            });
            it("Must fail if gamestate is not main card",()=>{
                let actual = game.recieveClue(0,2,"clue");
                let expected =false;

                expect(actual).toBe(expected);
            });

        });

        describe("recieveFake(playerIndex,cardID)", ()=>{
            let game = new Game("AAAA", "jimmy", 45);
            game.addPlayer("Billy");
            game.addPlayer("Johnny");

            let settings = { deckID: "DeckIdentifier" };
            game.startGame(settings);

            game.recieveClue(0,2, "clue");


            game.recieveFake(1,3);

            it("tracks players acted", ()=>{
              
                let actual = game.roundData.playersActed;
                let expected = 2;

                expect(actual).toBe(expected);
            });

            it("tracks Card Data", ()=>{
                let actual = game.roundData.cardArray[1].cardIdentifier;
                let expected =3;

                expect(actual).toBe(expected);
            });
            
            it("if all players acted change game state", ()=>{
                game.recieveFake(2,4);

                let actual = game.gameState;
                let expected= "vote";

                expect(actual).toBe(expected);
            });
            it("if Not in fake card phase returns false", ()=>{ 
                let actual = game.recieveFake(2,4);
                let expected= false;

                expect(actual).toBe(expected);
            });
            it("After phase is over reset playersActed for voting",()=>{
                let actual = game.roundData.playersActed;
                let expected= 1;
                
                expect(actual).toBe(expected);
            });

        });

        describe("recieveVote(playerIndex,cardIndex)",()=>{
            let game = new Game("AAAA", "jimmy", 45);
            game.addPlayer("Billy");
            game.addPlayer("Johnny");

            let settings = { deckID: "DeckIdentifier" };
            game.startGame(settings);

            game.recieveClue(0,2, "clue");
            game.recieveFake(1,3);
            game.recieveFake(2,4);

            game.recieveVote(2,0);

            it("tally votes in card object",()=>{

                let actual = game.roundData.cardArray[0].votes;
                let expected =1;

                expect(actual).toBe(expected);

            });
            it("when all votes are tallied update gameState to end display",()=>{
                game.recieveVote(1,0);
                let actual = game.gameState;
                let expected ="endDisplay";

                expect(actual).toBe(expected);

            });
            it("Only tallie when gamestate is vote",()=>{
                let actual = game.recieveVote(1,0);

                let expected =false;

                expect(actual).toBe(expected);

            });


        });
        
        describe("newRound()",()=>{
            let game = new Game("AAAA", "jimmy", 45);
            game.addPlayer("Billy");
            game.addPlayer("Johnny");

            let settings = { deckID: "DeckIdentifier" };
            game.startGame(settings);

            game.recieveClue(0,2, "clue");
            game.recieveFake(1,3);
            game.recieveFake(2,4);

            game.recieveVote(2,0);
            game.recieveVote(1,0);

            let isValid;

            it("Changes game state to clue phase, if valid",()=>{
                game.newRound();
                let actual = game.gameState;
                let expected=  "mainCard";  
                
                expect(actual).toBe(expected);
            });

            it("Increments RoundCount",()=>{
                let actual = game.roundCount;
                let expected=  1;  
                
                expect(actual).toBe(expected);
            });

            it("Returns False if game is not in endDisplay phase", ()=>{
                isValid= game.newRound();

                let actual = isValid;
                let expected= false;  
                
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

