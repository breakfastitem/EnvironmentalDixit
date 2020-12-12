/**
 * Static Vars
 */
var GameObject = {
   gameId: "",
   playerCount: "0",
   gameState: "pre",
   players: []
}

let gameID;

/**
* Static Functions
*/
function initializePlayerScores(playerCount, playerObjects) {
   var scoreBar = $("#scoreBar");
   scoreBar.empty();

   for (var i = 0; i < playerCount; i++) {
      var player = playerObjects[i];

      var scoreInfo = $(`<p id="name-${i + 1}">${player.name}</p>
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

         GameObject = response;

         initializePlayerScores(GameObject.playerCount, GameObject.players);

      });

   }, 2000);

}

function displayJoinPhase(isHost) {
   const board = $("#board");

   let display;

   board.empty();

   if (isHost) {
      display = $(`<p>Start the game when all players have joined.</p>
      <button id="start-button">Start Game</button>`);

   } else {
      display = $(`<p>Waiting For the Host...</p>`);

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

               console.log(response);

               GameObject = response;

               initializePlayerScores(GameObject.playerCount, GameObject.players);

               initializeUpdateInterval();

               displayJoinPhase(false);

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
         console.log("Clicked");

         break;

   }


});
// $("#join-button").on("click", function (event) {
//    event.preventDefault();

//    gameID= $("#id-input").val();
//    const  playerName =$("#name-input").val();

//    //Get game from game id

//    if(gameID != "" && playerName!=""){
//       $.ajax({
//          method: "get",
//          url: "/game/join",
//          data: {gameId: gameID, playerName: playerName}
//       }).then(function (response) {

//          console.log(response);

//          GameObject=response;

//          initializePlayerScores(GameObject.playerCount, GameObject.players);

//          initializeUpdateInterval();

//          displayJoinPhase(false);

//       });
//    }else{
//       console.log("ERROR No input");
//    }

// });

// $("#new-button").on("click", function(event){
//    event.preventDefault();

//    gameID= $("#id-input").val();
//    const  playerName =$("#name-input").val();

//    if(gameID != ""){

//       $.ajax({
//          method: "get",
//          url: "/game/new",
//          data: {gameId: gameID, playerName: playerName}

//       }).then(function (response) {

//          GameObject=response;

//          initializePlayerScores(GameObject.playerCount, GameObject.players);
//          initializeUpdateInterval();

//          displayJoinPhase(true);

//         //TODO:DO Something after creating game

//       });
//    }else{
//       console.log("ERROR No input");
//    }

// });

$("#id-input").on("change", function (event) {
   var value = $("#id-input").val();

   if (value.length > 4) {
      $("#id-input").val(value.substring(0, 4));
   }

});

/**
 * main
 */