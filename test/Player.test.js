const Player = require("../util/Player");
describe("Player", ()=>{
    it("Constructor creates object ",() => {
        let player = new Player( "jimmy",false);

        expect(player.name).toBe("jimmy");
    });
})