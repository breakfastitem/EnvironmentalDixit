/**
 * Static Vars
 */


let GameObject = {
   gameId: "",
   playerCount: "0",
   gameState: "pre",
   players: []
}

let gameID;

let playerIndex;

let gameManager;

let roundStarted=false;

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

Array.prototype.shuffle = function() {
   var i = this.length, j, temp;
   if ( i == 0 ) return this;
   while ( --i ) {
      j = Math.floor( Math.random() * ( i + 1 ) );
      temp = this[i];
      this[i] = this[j];
      this[j] = temp;
   }
   return this;
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
                  updatePlayerScores(GameObject.playerCount, GameObject.players);
                  break;

               case "mainCard":
                  //TODO :: If it is players turn to pick offer them a choice
                  if(!roundStarted){
                     startNewRound(GameObject.turnOrder[GameObject.roundCount]);
                     roundStarted=true;
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

function startNewRound(dealerIndex){

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
      display = $(`<p> ${dealerIndex} The StoryTeller will submit a clue and image shortly...</p>`);
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
         let playerOrder=[];

         for(let i=1;i<=GameObject.playerCount;i++){
            playerOrder.push(i);
         }

         playerOrder.shuffle();
         
   
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