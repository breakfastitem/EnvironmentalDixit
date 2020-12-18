/**
 * This class contains master card list and methods for game mangement
 */
class GameManager {

    constructor() {
        this.cardCount = 9;

        this.cardList = [];

        for (let i = 0; i < this.cardCount; i++) {
            this.cardList.push(i);
        }
        this.shuffleArray(this.cardList);
    }
    shuffleArray(array) {

        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

}

module.exports = GameManager;