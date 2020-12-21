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
   gameState: "none",
   players: []
}
//Holds shuffled card values
let cardOrder = [];

let gameID;
//PLayer index in players on gameobject
let playerIndex;

let gameManager;
//precents gameobject from being updated if not needed
let boardInstantiated = 0;
//Interval to be cleared and initialized
let interval;

//whichever card thats selected in round window is here, Identifies this cards position in imageshtml array
let cardIdentifier;
//same as cardidentifier excpet for the vote
let voteCardIdentifier;

//For fake card sellection
let fakeCardSubmited = false;

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
   interval = setInterval(() => {

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

                  //TODO :: If it is players turn to pick offer them a choice
                  if (boardInstantiated < 1) {
                     const hand = $("#hand");
                     hand.empty();

                     for (let i = 0; i < GameObject.players[playerIndex].handCount; i++) {

                        let imgIdentifier = GameObject.players[playerIndex].cards[i];
                        let card = $(imagesHtml[imgIdentifier - 1]);

                        card.attr("class", "playerCard");
                        card.attr("id", `img-${i}`);

                        console.log(imgIdentifier);
                        hand.append(card);
                     }

                     startNewRound(GameObject.turnOrder[GameObject.roundCount]);
                     boardInstantiated++;
                  }

                  break;
               case "fakeCards":
                  //Everyone but dealer has this display
                  if (boardInstantiated < 2 && GameObject.turnOrder[GameObject.roundCount] - 1 != playerIndex) {
                     //Display board info
                     let board = $("#board");
                     board.empty();

                     let display = $(`<p>Pick an image that matches the clue.</p>
                    <h2>${GameObject.roundData.clue}</h2>
                    <button id="submit-fake">Submit</button>
                     `);

                     cardIdentifier = GameObject.players[playerIndex].cards[0] - 1;
                     let card = $(imagesHtml[cardIdentifier]);

                     card.attr("class", "playerCard");
                     card.attr("id", `selected-card`);

                     board.append(display);
                     board.append(card);

                     boardInstantiated++;
                  }

                  break;
               case "vote":
                  if (boardInstantiated < 3 && GameObject.turnOrder[GameObject.roundCount] - 1 != playerIndex) {
                     //Display board info
                     let board = $("#board");
                     board.empty();

                     let display = $(`<p>Vote for the image you most think represents the clue.</p>
                    <h2>${GameObject.roundData.clue}</h2>
                    <button id="submit-vote">Submit</button>
                     `);
                     board.append(display);
                     //TODO:: Make cards that are displayed random
                     for (let i = 0; i < GameObject.roundData.cardArray.length; i++) {
                        let card = $(imagesHtml[GameObject.roundData.cardArray[i].cardIdentifier]);
                        card.attr("class", "voteCard");
                        card.attr("id", `vote-${i}`);

                        board.append(card);

                     }

                     board.append("<hr>");

                     let card = $(imagesHtml[GameObject.roundData.cardArray[0].cardIdentifier]);

                     card.attr("class", "playerCard");
                     card.attr("id", `selected-card`);

                     voteCardIdentifier = 0;

                     board.append(card);



                     boardInstantiated++;
                  } else if (GameObject.turnOrder[GameObject.roundCount] - 1 == playerIndex) {
                     let board = $("#board");
                     board.empty();

                     let display = $(`<p> The other players are voting. </p>`);
                     board.append(display);

                     //TODO:: Make cards that are displayed randomLY
                     for (let i = 0; i < GameObject.roundData.cardArray.length; i++) {
                        let card = $(imagesHtml[GameObject.roundData.cardArray[i].cardIdentifier]);
                        card.attr("class", "playerCard");
                        card.attr("id", `vote-${i}`);

                        board.append(card);

                     }
                     boardInstantiated++;
                  }
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

   if (dealerIndex - 1 == playerIndex) {
      display = $(`<p>Choose an image, and write a clue related to said image.</p>
      <form>
      <input id="clue-input"></input>
      <button id="submit-clue">submit</button>
      </form>`);

      //Auto Displays first card in selcted area.
      cardIdentifier = GameObject.players[playerIndex].cards[0] - 1;
      let card = $(imagesHtml[cardIdentifier]);

      card.attr("class", "voteCard");
      card.attr("id", `selected-card`);
      // img-${GameObject.players[playerIndex].cards[0]} 
      //Appends information to board
      board.append(display);
      board.append(card);

   } else {
      display = $(`<p> Player ${dealerIndex} The StoryTeller will submit a clue and image shortly...</p>`);
      board.append(display);
   }

}

//Always restart interval and push method after calling
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
   }

};
function displayVoteSelection(cardIndex) {

   //if random var will from different variable

   voteCardIdentifier = GameObject.roundData.cardArray[cardIndex].cardIdentifier;

   $("img").remove("#selected-card");

   let card = $(imagesHtml[voteCardIdentifier]);

   card.attr("class", "playerCard");
   card.attr("id", `selected-card`);

   $("#board").append(card);
};

/**
 * Event Listeners
 */


$("#board").on("click", function (event) {
   event.preventDefault();
   const id = event.target.id;

   let playerName;

   console.log(event.target.class);

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



         for (let i = 1; i <= GameObject.cardCount; i++) {
            cardOrder.push(i);
         }
         cardOrder.shuffle();

         //Deal Cards
         dealCards();

         $.ajax({
            method: "get",
            url: "/game/start",
            data: { gameId: gameID, players: GameObject.players, playerOrder: playerOrder, cardOrder: cardOrder }
         }).then(function (response) {

            //starts the first round
            GameObject = response;

            startNewRound(GameObject.turnOrder[GameObject.roundCount]);
            //Start the update interval that was paused to deal cards
            initializeUpdateInterval();

         });

         break;

      case "submit-clue":
         //Stop interval to prevent overwriting push data
         clearInterval(interval);
         const clue = $("#clue-input").val().trim();

         console.log("clue: " + clue);

         const roundData = { playersActed: 1, clue: clue, cardArray: [{ playerIndex: playerIndex, cardIdentifier: cardIdentifier, votes: 0 }] };

         console.log("roundData: " + roundData);

         $.ajax({
            method: "get",
            url: "/game/clue",
            data: { gameId: gameID, roundData: roundData }
         }).then(function (response) {

            GameObject = response;

            //Update story teller display
            let board = $("#board");

            board.empty();

            let display = $("<p>All other playings are selecting cards to match your clue...</p>");
            board.append(display);

            //Start the update interval that was paused to deal cards
            initializeUpdateInterval();

         });

         break;

      case "submit-fake":
         clearInterval(interval);

         $.ajax({
            method: "get",
            url: "/game/fake",
            data: { gameId: gameID, cardIdentifier: cardIdentifier, playerIndex: playerIndex }
         }).then(function (response) {

            //To prevent selected cards appending
            fakeCardSubmited = true;

            GameObject = response;

            //Update story teller display
            let board = $("#board");

            board.empty();

            let display = $("<p>Other playings are still selecting card...</p>");
            board.append(display);

            //Start the update interval that was paused to deal cards
            initializeUpdateInterval();

         });
         break;

      case "vote-0":
         displayVoteSelection(0);
         break;
      case "vote-1":
         displayVoteSelection(1);
         break;
      case "vote-2":
         displayVoteSelection(2);
         break;
      case "vote-3":
         displayVoteSelection(3);
         break;
      case "vote-4":
         displayVoteSelection(4);
         break;
      case "vote-5":
         displayVoteSelection(5);
         break;

   }

});

$("#hand").on("click", (event) => {
   if ((GameObject.turnOrder[GameObject.roundCount] - 1 == playerIndex && GameObject.gameState === "mainCard") || (GameObject.turnOrder[GameObject.roundCount] - 1 != playerIndex && GameObject.gameState === "fakeCards" && !fakeCardSubmited)) {
      const targetID = event.target.id;

      let type = targetID.split("-")[0];
      let handNum = targetID.split("-")[1];

      if (type == "img") {
         $("img").remove("#selected-card");

         cardIdentifier = GameObject.players[playerIndex].cards[handNum] - 1;
         let card = $(imagesHtml[cardIdentifier]);

         card.attr("class", "playerCard");
         card.attr("id", `selected-card`);

         $("#board").append(card);
      }

   }


});


//Prevents more than for characters from being entered in id input
$("#id-input").on("change", function (event) {
   const value = $("#id-input").val();

   if (value.length > 4) {
      $("#id-input").val(value.substring(0, 4));
   }

});

/**
 * main
 */