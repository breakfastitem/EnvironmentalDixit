/**
 * Static Vars
 */
const imagesHtml = [`<img src="https://i.ibb.co/VLzCKBK/img-1.jpg" alt="img-1" border="0" />`
   , `<img src="https://i.ibb.co/dD32KfH/img-2.jpg" alt="img-2" border="0"/>`
   , `<img src="https://i.ibb.co/6vmww86/img-3.jpg" alt="img-3" border="0"/>`
   , `<img src="https://i.ibb.co/QCcnSFL/img-4.jpg" alt="img-4" border="0"/>`
   , `<img src="https://i.ibb.co/nMvYFgx/img-5.jpg" alt="img-5" border="0"/>`
   , `<img src="https://i.ibb.co/HVdVwkp/img-6.jpg" alt="img-6" border="0"/>`
   , `<img src="https://i.ibb.co/jLh6ns1/img-7.jpg" alt="img-7" border="0"/>`
   , `<img src="https://i.ibb.co/vJYq4Tk/img-8.jpg" alt="img-8" border="0"/>`
   , `<img src="https://i.ibb.co/MVFP12S/img-9.jpg" alt="img-9" border="0"/>`
   , `<img src="https://i.ibb.co/VLzCKBK/img-1.jpg" alt="img-1" border="0"/>`
   , `<img src="https://i.ibb.co/dD32KfH/img-2.jpg" alt="img-2" border="0"/>`
   , `<img src="https://i.ibb.co/6vmww86/img-3.jpg" alt="img-3" border="0"/>`
   , `<img src="https://i.ibb.co/QCcnSFL/img-4.jpg" alt="img-4" border="0"/>`
   , `<img src="https://i.ibb.co/nMvYFgx/img-5.jpg" alt="img-5" border="0"/>`
   , `<img src="https://i.ibb.co/HVdVwkp/img-6.jpg" alt="img-6" border="0"/>`
   , `<img src="https://i.ibb.co/jLh6ns1/img-7.jpg" alt="img-7" border="0"/>`
   , `<img src="https://i.ibb.co/vJYq4Tk/img-8.jpg" alt="img-8" border="0"/>`
   , `<img src="https://i.ibb.co/MVFP12S/img-9.jpg" alt="img-9" border="0"/>`];

let GameObject = {
   gameId: "",
   playerCount: "0",
   gameState: "pre",
   players: []
}

let cardOrder = [];

let gameID;

let playerIndex;

let gameManager;

let roundStarted = false;

let interval;

/**
* Static Functions
*/
function updatePlayerScores(playerCount, playerObjects) {
   const scoreBar = $("#scoreBar");
   scoreBar.empty();

   for (let i = 0; i < playerCount; i++) {
      let player = playerObjects[i];

      let scoreInfo = $(`<p id="name-${i + 1}">${player.name}</p>
      <p>Score: <span id="score-${i + 1}">${player.score}</span></p>
      <hr>`);

      scoreBar.append(scoreInfo);

   }

}

Array.prototype.shuffle = function () {
   var i = this.length, j, temp;
   if (i == 0) return this;
   while (--i) {
      j = Math.floor(Math.random() * (i + 1));
      temp = this[i];
      this[i] = this[j];
      this[j] = temp;
   }
   return this;
}

function initializeUpdateInterval() {
   interval =setInterval(() => {

      $.ajax({
         method: "get",
         url: "/game/pull",
         data: { gameId: gameID }

      }).then(function (response) {

         if (GameObject != response) {
            GameObject = response;

            switch (GameObject.gameState) {
               case "join":
                  updatePlayerScores(GameObject.playerCount, GameObject.players);
                  break;

               case "mainCard":
                  console.log(GameObject);
                  //TODO :: If it is players turn to pick offer them a choice
                  
                     const hand = $("#hand");
                     hand.empty();

                     for (let i = 0; i < GameObject.players[playerIndex].handCount; i++) {
                        
                        let imgIdentifier = GameObject.players[playerIndex].cards[i];
                        let card = $(imagesHtml[imgIdentifier]);

                        card.attr("class", "playerCard");
                        card.attr("id", `img-${imgIdentifier}`);

                        console.log(card + imgIdentifier);
                        hand.append(card);
                     }

                     startNewRound(GameObject.turnOrder[GameObject.roundCount]);

                  break;
            }

         }

      });

   }, 2000);

}

function displayJoinPhase(isHost) {

   const board = $("#board");
   clearBoard();

   let display;

   if (isHost) {
      display = $(`<p>Start the game when all players have joined.</p>
      <button id="start-button">Start Game</button>`);

   } else {
      display = $(`<p>Waiting For the Host...</p>`);

   }

   board.append(display);
}

function clearBoard() {
   const board = $("#board");

   board.empty();
}

function startNewRound(dealerIndex) {

   clearBoard();
   const board = $("#board");

   let display;

   if (dealerIndex == playerIndex) {
      display = $(`<p>Choose an image, and write a clue related to said image.</p>
      <form>
      <input id="clue-input"></input>
      <button id="submit">submit</button>
      </form>`);

   } else {
      display = $(`<p> ${dealerIndex} The StoryTeller will submit a clue and image shortly...</p>`);
   }

   board.append(display);
}

function dealCards() {
   clearInterval(interval);

   //for each player
   for (let i = 0; i < GameObject.playerCount; i++) {
      //Give the player 6 cards
      while (GameObject.players[i].handCount < 6) {

         let tempNum = cardOrder.pop();

         GameObject.players[i].cards.push(tempNum);
         GameObject.players[i].handCount++;
      }
      console.log(GameObject.players[i].cards);
   }

   //Push New Object
}

/**
 * Event Listeners
 */

$("#board").on("click", function (event) {
   event.preventDefault();
   const id = event.target.id;

   let playerName;

   switch (id) {

      case "join-button":
         gameID = $("#id-input").val();
         playerName = $("#name-input").val();

         //Get game from game id

         if (gameID != "" && playerName != "") {
            $.ajax({
               method: "get",
               url: "/game/join",
               data: { gameId: gameID, playerName: playerName }
            }).then(function (response) {
               if (response) {
                  GameObject = response;
                  playerIndex = GameObject.playerCount - 1;

                  updatePlayerScores(GameObject.playerCount, GameObject.players);

                  initializeUpdateInterval();

                  displayJoinPhase(false);
               } else {
                  console.log("Game Is Full!");
               }


            });
         } else {
            console.log("ERROR No input");
         }
         break;

      case "new-button":
         gameID = $("#id-input").val();
         playerName = $("#name-input").val();

         if (gameID != "") {

            $.ajax({
               method: "get",
               url: "/game/new",
               data: { gameId: gameID, playerName: playerName }

            }).then(function (response) {

               GameObject = response;
               playerIndex = 0;

               updatePlayerScores(GameObject.playerCount, GameObject.players);
               initializeUpdateInterval();

               displayJoinPhase(true);

            });
         } else {
            console.log("ERROR No input");
         }
         break;

      case "start-button":

         updatePlayerScores(GameObject.playerCount, GameObject.players);

         //Initialize game TODO:: MAke sure game object is updated
         let playerOrder = [];

         for (let i = 1; i <= GameObject.playerCount; i++) {
            playerOrder.push(i);
         }
         playerOrder.shuffle();

       

         for (let i = 1; i < GameObject.cardCount; i++) {
            cardOrder.push(i);
         }
         cardOrder.shuffle();

         //Deal Cards
         dealCards();

         $.ajax({
            method: "get",
            url: "/game/start",
            data: { gameId: gameID, players: GameObject.players ,playerOrder: playerOrder, cardOrder: cardOrder }
         }).then(function (response) {

            

            //starts the first round
            GameObject = response;

            startNewRound(GameObject.turnOrder[GameObject.roundCount]);
            //Start the update interval that was paused to deal cards
            initializeUpdateInterval();

         });

         break;

   }

});

$("#id-input").on("change", function (event) {
   const value = $("#id-input").val();

   if (value.length > 4) {
      $("#id-input").val(value.substring(0, 4));
   }

});

/**
 * main
 */