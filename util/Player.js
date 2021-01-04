/**
 * { name: req.body.playerName, score: 0, handCount: 0, cards: [], host: true }
 */
class Player {

    //Creates the game as an object. This will match what the current schema calls are doing.
    constructor(playerName, isHost) {

        this.name = playerName;
        this.isHost =isHost;

        this.handCount =0;
        this.cards=[];

        this.score=0;

    }

}

module.exports = Player;