class Player {

    //Creates the game as an object. This will match what the current schema calls are doing.
    constructor(playerName, isHost) {

        this.name = playerName;
        this.isHost =isHost;

        this.score=0;

    }

}

module.exports = Player;