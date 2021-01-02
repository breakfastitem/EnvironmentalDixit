const Game= require("../util/Game");

describe("Game",()=>{
    describe("Constructor", ()=>{
        it("Constructor creates object.",() => {
            let game = new Game("AAAA", "jimmy",45);
    
            expect(game.gameID).toBe("AAAA");
        });
        it("When creating a new game the first player is host", ()=>{
            let game = new Game("AAAA", "jimmy",45);
    
            expect(game.players[0].isHost).toBe(true);
        });
        it("game has player count when created" , ()=>{
            let game = new Game("AAAA", "jimmy",45);
    
            expect(game.cardCount).toBe(45);
        });
        it("Initial game state should be join", ()=>{
            let game = new Game("AAAA", "jimmy",45);
    
            expect(game.gameState).toBe("join");
        });
    });

    describe("Utility Functions",() => {
        it("Function addPlayer(name) adds player to players object", ()=>{
            let game = new Game("AAAA", "jimmy",45);
            game.addPlayer("Sam");
    
            expect(game.players[1].name).toBe("Sam");
        });
        describe("Start Game", ()=>{
            it("Function startGame() changes gamestate to main card", ()=>{
                let game = new Game("AAAA", "jimmy",45);
                game.addPlayer("Billy");
                game.addPlayer("Johnny");
                game.addPlayer("Andrew");
                game.startGame();
        
                expect(game.gameState).toBe("mainCard");
            });
        });
       
    }); 
   
});

