/**
 * Static Vars
 */
const imagesHtml = [`<img src="https://drive.google.com/uc?export=view&id=1GqnHwAS71JxIP3Unr67ZEw3v0l-6Gomk" alt="Utility Scale Solar" border="0" />`
   , `<img src="https://lh3.google.com/u/0/d/1yvvivcVUeb2Z9WAy-KghoFgbeoFg7y3P=w1920-h937-iv1" alt="Wind Turbines Onshore" border="0"/>`
   , `<img src="https://lh3.google.com/u/0/d/1nzKA04PAh_5KLFEBx2tK5JKlZ3_Abu8d=w1920-h937-iv1" alt="img-3" border="0"/>`
   , `<img src="https://lh3.google.com/u/0/d/1BLiU5GT4pNgOgYxUtXco8KTrJ1fpXWdP=w1920-h937-iv1" alt="img-4" border="0"/>`
   , `<img src="https://lh3.google.com/u/0/d/1m0SxXdHE4bq543JtLCpFbbgor07HsdiR=w1920-h937-iv1" alt="img-5" border="0"/>`
   , `<img src="https://lh3.google.com/u/0/d/1psc3KNn6o-haSnrc1yOCu0t4gnNT5bIu=w1920-h937-iv1" alt="img-6" border="0"/>`
   , `<img src="https://lh3.google.com/u/0/d/1dn1xRkYRb1wj8xhNSKFU03XzrdSKd7MN=w1920-h937-iv1" alt="img-7" border="0"/>`
   , `<img src="https://lh3.google.com/u/0/d/1F4gzNKZ822ZmiCH-JaBKRRp71WqD9tM8=w1920-h937-iv1" alt="img-8" border="0"/>`
   , `<img src="https://lh3.google.com/u/0/d/1nJDdawjrO8GLLpeFhkQZG6Hm3EmScjgA=w1920-h937-iv1" alt="img-9" border="0"/>`
   , `<img src="https://lh3.google.com/u/0/d/1AwBp9JVItAdVcoQqpb89TIgr-Us0lgdV=w1920-h937-iv1" alt="img-1" border="0"/>`
   , `<img src="https://lh3.google.com/u/0/d/139y97JCRhO3spqqHVPlfXDT1zgNgaEKr=w1920-h937-iv1" alt="img-2" border="0"/>`
   , `<img src="https://lh3.google.com/u/0/d/1vMckOxLxuw64iqL6rlRrYlzKyZ4Kq7So=w1920-h937-iv1" alt="img-3" border="0"/>`
   , `<img src="https://lh3.google.com/u/0/d/1johQA0mfOvc_l4qi7G0M1pvn6AA37Ifz=w1920-h937-iv1" alt="img-4" border="0"/>`
   , `<img src="https://lh3.google.com/u/0/d/1F-Gypag7I1xfR6OTYSc31xnkf-GfpE-i=w1920-h937-iv1" alt="img-5" border="0"/>`
   , `<img src="https://lh3.google.com/u/0/d/1OGOgJim2o2zIrO3AKyyKg8i-I5xVfHhS=w1920-h937-iv1" alt="img-6" border="0"/>`
   , `<img src="https://lh3.google.com/u/0/d/1UUinmWZpnCaawiyENy2E5Shb9sSAMoN_=w1920-h937-iv1" alt="img-7" border="0"/>`
   , `<img src="https://lh3.google.com/u/0/d/1LsP5Y6ZjePioWpvbEuR-Bm-ymMde3S7O=w1920-h937-iv1" alt="img-8" border="0"/>`
   , `<img src="https://lh3.google.com/u/0/d/1KvI1xsNUTCG17EH_5cRmyJ5M8E95roaQ=w1920-h937-iv1" alt="img-9" border="0"/>`
   , `<img src="https://lh3.google.com/u/0/d/1f4bUcqaBEwcECyPa-Tx2-LLDkZoTjLzd=w1920-h937-iv1" alt="img-1" border="0"/>`
   , `<img src="https://lh3.google.com/u/0/d/1uBxLtkGGj-WK7r5FO8Y9fBglqYKG7lMr=w1920-h937-iv1" alt="img-2" border="0"/>`
   , `<img src="https://lh3.google.com/u/0/d/1HKPFyGBeH8DbVg8a6PMb4d83ymXfgexR=w1920-h937-iv1" alt="img-3" border="0"/>`
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
//same as cardidentifier excpet for the vote, the index is the index in round data card array
let voteCardIndex;

//For fake card sellection
let fakeCardSubmited = false;

//for card removal
let handNum;

/**
* Static Functions
*/
function displayImageInViewer(cardId) {

   $("#img-viewer").empty();
   let card = $(imagesHtml[cardId]);
   $("#img-viewer").append(card);

}

function updateGameObjectFromResponse(serverResponse) {
   let keys = Object.keys(serverResponse);

   for (let i = 0; i < keys.length; i++) {
      GameObject[keys[i]] = serverResponse[keys[i]];
   }

}

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

function displayCards() {
   const hand = $("#hand");
   hand.empty();

   for (let i = 0; i < GameObject.hand.length; i++) {

      let imgIdentifier = GameObject.hand[i];
      let card = $(imagesHtml[imgIdentifier]);

      card.attr("class", "player-card");
      card.attr("id", `img-${i}`);
      hand.append(card);
   }
}

function initializeUpdateInterval() {
   interval = setInterval(() => {

      $.ajax({
         method: "get",
         url: `/game/pull/${gameID}/${playerIndex}`,
         error: () => {
            location.reload();
         }

      }).then(function (response) {

         //TODO:: Varable indicating change
         if (GameObject != response) {
            updateGameObjectFromResponse(response);

            switch (GameObject.gameState) {
               case "join":
                  //Add Response data to game object
                  gameID = GameObject.gameID;
                  updatePlayerScores(GameObject.playerCount, GameObject.players);
                  break;

               case "mainCard":

                  //TODO :: If it is players turn to pick offer them a choice
                  if (boardInstantiated < 1) {

                     fakeCardSubmited = false;

                     displayCards();

                     startNewRound(GameObject.turnOrder[GameObject.roundCount]);
                     boardInstantiated++;
                  }

                  if (boardInstantiated == 3) {
                     boardInstantiated = 0;
                  }

                  break;
               case "fakeCards":

                  //Everyone but dealer has this display
                  if (boardInstantiated < 2 && GameObject.turnOrder[GameObject.roundCount] - 1 != playerIndex) {
                     //Display board info
                     let board = $("#board");
                     board.empty();

                     let display = $(`<p>Pick an image that matches the clue.</p>
                    <h2>${GameObject.clue}</h2>
                    <button id="submit-fake">Submit</button>
                     `);

                     cardIdentifier = GameObject.hand[0];
                     let card = $(imagesHtml[cardIdentifier]);

                     card.attr("class", "player-card");
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
                    <h2>${GameObject.clue}</h2>
                    <button id="submit-vote">Submit</button>
                     `);
                     board.append(display);
                     //TODO:: Make cards that are displayed random
                     for (let i = 0; i < GameObject.roundCards.length; i++) {
                        let card = $(imagesHtml[GameObject.roundCards[i]]);
                        card.attr("class", "voteCard");
                        card.attr("id", `vote-${i}`);

                        board.append(card);

                     }

                     board.append("<hr>");

                     let card = $(imagesHtml[GameObject.roundCards[0]]);

                     card.attr("class", "player-card");
                     card.attr("id", `selected-card`);

                     voteCardIndex = 0;

                     board.append(card);



                     boardInstantiated++;
                  } else if (boardInstantiated < 3 && GameObject.turnOrder[GameObject.roundCount] - 1 == playerIndex) {
                     let board = $("#board");
                     board.empty();

                     let display = $(`<p> The other players are voting. </p>`);
                     board.append(display);

                     //TODO:: Make cards that are displayed randomLY
                     for (let i = 0; i < GameObject.roundCards.length; i++) {
                        let card = $(imagesHtml[GameObject.roundCards[i]]);
                        card.attr("class", "player-card");
                        card.attr("id", `vote-${i}`);

                        board.append(card);

                     }
                     boardInstantiated++;
                  }
                  break;

               case "endDisplay":
                  let board = $("#board");

                  board.empty();

                  let header = $(`<h2>End Results</h2>`);
                  board.append(header);

                  //Display cards with owner and votes
                  for (let i = 0; i < GameObject.playerCount; i++) {
                     let cardData = GameObject.roundData.cardArray[i];
                     let display = $(`<div id="result"><p>${GameObject.players[cardData.playerIndex].name}</p> ${imagesHtml[cardData.cardIdentifier]}<p> ${cardData.votes}</p></div>`);

                     $("#board").append(display);
                  }

                  updatePlayerScores(GameObject.playerCount, GameObject.players);
                  //if host
                  if (playerIndex == 0) {
                     let button = $(`<button id="new-Round">next round</button>`);
                     board.append(button);
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
   cardIdentifier = GameObject.hand[0];
   displayImageInViewer(cardIdentifier);

   if (dealerIndex - 1 == playerIndex) {
      display = $(`<p>Choose an image, and write a clue related to said image.</p>
      <form>
      <input id="clue-input"></input>
      <button id="submit-clue">submit</button>
      </form>`);

      //Auto Displays first card in selcted area.
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

function displayVoteSelection(cardRoundIndex) {
   //clicks are only enabled when the player is not a dealer
   if (GameObject.turnOrder[GameObject.roundCount] - 1 != playerIndex) {
      //if random var will from different variable
      voteCardIndex = cardRoundIndex;

      let voteCardIdentifier = GameObject.roundCards[cardRoundIndex];

      $("img").remove("#selected-card");

      let card = $(imagesHtml[voteCardIdentifier]);

      card.attr("class", "player-card");
      card.attr("id", `selected-card`);

      $("#board").append(card);
   }

};

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
            //Update code display
            $("#code").text(gameID);

            $.ajax({
               method: "put",
               url: "/game/join",
               data: { gameId: gameID, playerName: playerName }
            }).then(function () {
               $.ajax({
                  method: "get",
                  url: `/game/pull/${gameID}/25`

               }).then(function (response) {
                  if (response) {
                     updateGameObjectFromResponse(response);

                     playerIndex = GameObject.playerCount - 1;

                     updatePlayerScores(GameObject.playerCount, GameObject.players);

                     initializeUpdateInterval();

                     displayJoinPhase(false);
                  } else {
                     console.log("Game Is Full!");
                  }
               });


            });
         } else {
            console.log("ERROR No input");
         }
         break;

      case "new-button":

         playerName = $("#name-input").val();


         $.ajax({
            method: "POST",
            url: "/game/new",
            data: { playerName: playerName }

         }).then(function () {
            $.ajax({
               method: "get",
               url: `/game/pull/new/25`

            }).then(function (response) {

               playerIndex = 0;

               updateGameObjectFromResponse(response);

               //Get gameId from server
               gameID = GameObject.gameID;

               //Update code display
               $("#code").text(gameID);


               updatePlayerScores(GameObject.playerCount, GameObject.players);
               initializeUpdateInterval();

               displayJoinPhase(true);
            });

         });

         break;

      case "start-button":

         updatePlayerScores(GameObject.playerCount, GameObject.players);

         $.ajax({
            method: "put",
            url: "/game/start",
            data: { gameId: gameID }
         }).then(function () {

            $.ajax({
               method: "get",
               url: `/game/pull/${gameID}/${playerIndex}`

            }).then(function (response) {

               updateGameObjectFromResponse(response);

               startNewRound(GameObject.turnOrder[GameObject.roundCount]);

               //Start the update interval that was paused to deal cards
               initializeUpdateInterval();
            });

         });

         break;

      case "submit-clue":
         //Stop interval to prevent overwriting push data
         clearInterval(interval);
         const clue = $("#clue-input").val().trim();

         const roundData = { playersActed: 1, clue: clue, cardArray: [{ playerIndex: playerIndex, cardIdentifier: cardIdentifier, votes: 0, voterIndexes: [] }] };



         $.ajax({
            method: "put",
            url: "/game/clue",
            data: { gameId: gameID, roundData: roundData, playerIndex: playerIndex }
         }).then(function () {
            $.ajax({
               method: "get",
               url: `/game/pull/${gameID}/${playerIndex}`

            }).then(function (response) {
               updateGameObjectFromResponse(response);

               //update hand with removed card
               $("img").remove(`#img-${handNum}`);

               //Update story teller display
               let board = $("#board");

               board.empty();

               let display = $("<p>All other playings are selecting cards to match your clue...</p>");
               board.append(display);

               //Start the update interval that was paused to deal cards
               initializeUpdateInterval();
            });

         });

         break;

      case "submit-fake":
         clearInterval(interval);

         $.ajax({
            method: "put",
            url: "/game/fake",
            data: { gameId: gameID, cardIdentifier: cardIdentifier, playerIndex: playerIndex }
         }).then(function () {

            $.ajax({
               method: "get",
               url: `/game/pull/${gameID}/${playerIndex}`

            }).then(function (response) {

               //To prevent selected cards appending
               fakeCardSubmited = true;

               updateGameObjectFromResponse(response);


               //update hand with removed card
               $("img").remove(`#img-${handNum}`);

               //Update story teller display
               let board = $("#board");

               board.empty();

               let display = $("<p>Other playings are still selecting card...</p>");
               board.append(display);

               //Start the update interval that was paused to deal cards
               initializeUpdateInterval();
            });

         });
         break;

      case "submit-vote":
         clearInterval(interval);
         $.ajax({
            method: "put",
            url: "/game/vote",
            data: { gameId: gameID, cardIndex: voteCardIndex, playerIndex: playerIndex }
         }).then(function () {

            $.ajax({
               method: "get",
               url: `/game/pull/${gameID}/${playerIndex}`

            }).then(function (response) {
               //To prevent selected cards appending
               fakeCardSubmited = true;

               updateGameObjectFromResponse(response);


               //Update story teller display
               let board = $("#board");

               board.empty();

               let display = $("<p>Other playings are still voting...</p>");
               board.append(display);

               //Start the update interval that was paused to deal cards
               initializeUpdateInterval();
            });

         });

         break;
      case "new-Round":
         clearInterval(interval);

         boardInstantiated = 0;
         fakeCardSubmited = false;

         $.ajax({
            method: "put",
            url: "/game/next",
            data: { gameId: gameID, players: GameObject.players, cardOrder: GameObject.cardOrder }
         }).then(function () {
            $.ajax({
               method: "get",
               url: `/game/pull/${gameID}/${playerIndex}`

            }).then(function (response) {

               updateGameObjectFromResponse(response);

               displayCards();

               //Start the update interval that was paused to deal cards
               initializeUpdateInterval();
            });

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
   const targetID = event.target.id;

   let type = targetID.split("-")[0];
   handNum = targetID.split("-")[1];
   if(type=="img"){
      cardIdentifier = GameObject.hand[handNum];
      displayImageInViewer(cardIdentifier);
   }

   if ((GameObject.turnOrder[GameObject.roundCount] - 1 == playerIndex && GameObject.gameState === "mainCard") || (GameObject.turnOrder[GameObject.roundCount] - 1 != playerIndex && GameObject.gameState === "fakeCards" && !fakeCardSubmited)) {
     

      if (type == "img") {
         $("img").remove("#selected-card");

         let card = $(imagesHtml[cardIdentifier]);

         card.attr("class", "player-card");
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