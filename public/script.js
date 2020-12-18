/**
 * Static Vars
 */
const gameManager =require("./util/GameManager");

let GameObject = {
   gameId: "",
   playerCount: "0",
   gameState: "pre",
   players: []
}

let gameID;

let playerIndex;

/**
* Static Functions
*/
function initializePlayerScores(playerCount, playerObjects) {
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

function initializeUpdateInterval() {
   setInterval(() => {

      $.ajax({
         method: "get",
         url: "/game/pull",
         data: { gameId: gameID }

      }).then(function (response) {

         if (GameObject != response) {
            GameObject = response;

            switch (GameObject.gameState) {
               case "join":
                  initializePlayerScores(GameObject.playerCount, GameObject.players);
                  break;

               case "mainCard":
                  //TODO :: If it is players turn to pick offer them a choice
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

function startNewRound(dealerIndex){

   console.log("Hello");
   clearBoard();
   const board = $("#board");

   let display;

   if (dealerIndex==playerIndex) {
      display = $(`<p>Choose an image, and write a clue related to said image.</p>
      <form>
      <input id="clue-input"></input>
      <button id="submit">submit</button>
      </form>`);

   } else {
      display = $(`<p>The StoryTeller will submit a clue and image shortly...</p>`);
   }

   board.append(display);
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

                  initializePlayerScores(GameObject.playerCount, GameObject.players);

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

               initializePlayerScores(GameObject.playerCount, GameObject.players);
               initializeUpdateInterval();

               displayJoinPhase(true);

               //TODO:DO Something after creating game

            });
         } else {
            console.log("ERROR No input");
         }
         break;

      case "start-button":
        
         initializePlayerScores(GameObject.playerCount, GameObject.players);

         //Initialize game TODO:: MAke sure game object is updated
         let playerOrder =[GameObject.playerCount];
         //TODO:: Make Random
         for(let i=0;i<Number(GameObject.playerCount);i++){
            playerOrder[i] = i;
         };
        

         $.ajax({
            method: "get",
            url: "/game/start",
            data: { gameId: gameID, playerOrder: playerOrder }
         }).then(function (response) {

            //starts the first round
   
            GameObject=response;
            console.log(GameObject);
            startNewRound(GameObject.turnOrder[GameObject.roundCount]);

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