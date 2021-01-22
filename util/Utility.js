function shuffle(array) {
    let _array = array;
    var i = _array.length, j, temp;
    if (i == 0) return _array;
    while (--i) {
        j = Math.floor(Math.random() * (i + 1));
        temp = _array[i];
        _array[i] = _array[j];
        _array[j] = temp;
    }
    return _array;
};
//returns players array with updated scores
function determineScores(players, roundData, tellerIndex) {

    let tempArray = roundData.cardArray.filter(card => card.playerIndex == tellerIndex);

    let tellerCard = tempArray[0];

    if (tellerCard.votes == 0 || tellerCard.votes == players.length - 1) {
        for (let i = 0; i < players.length; i++) {
            //add other score points
            if (i != tellerIndex) {
                players[i].score += 2;
                for (let j = 0; j < roundData.cardArray.length; j++) {
                    if (roundData.cardArray[j].playerIndex == i) {
                        players[i].score += roundData.cardArray[j].votes;
                    }
                }
            }
        }
    } else {
       
        players[tellerIndex].score += 3;
        let voterIndexes = tellerCard.voterIndexes;
        //Everyone who voted for correct card also gets points
        for (let i = 0; i < voterIndexes.length; i++) {
            players[voterIndexes[i]].score += 3;

        }
        //add other score points
        for (let i = 0; i < players.length; i++) {
            if (i != tellerIndex) {
                for (let j = 0; j < roundData.cardArray.length; j++) {
                    if (roundData.cardArray[j].playerIndex == i) {
                        players[i].score += roundData.cardArray[j].votes;
                    }
                }
            }
        }

    }
    return players;
};
//Generates a unique string of four capital letters
function generateID(ids) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    let id = "";
    let validId = false;

    while (!validId) {
        while (id.length < 4) {
            let index = Math.floor(Math.random() * alphabet.length);

            id += alphabet[index];

        }
        validId = ids.indexOf(id) == -1;
    }

    //TODO::// Check and add to a id list so there are no double ids
    ids.push(id);

    return id;

}


module.exports = { shuffle, determineScores,generateID };
