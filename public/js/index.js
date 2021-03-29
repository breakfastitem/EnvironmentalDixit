/**
 * Static Vars
 */

const imageSources = ["https://drive.google.com/uc?export=view&id=1GqnHwAS71JxIP3Unr67ZEw3v0l-6Gomk"
   , "https://lh3.google.com/u/0/d/1yvvivcVUeb2Z9WAy-KghoFgbeoFg7y3P=w1920-h937-iv1"
   , "https://lh3.google.com/u/0/d/1nzKA04PAh_5KLFEBx2tK5JKlZ3_Abu8d=w1920-h937-iv1"
   , "https://lh3.google.com/u/0/d/1BLiU5GT4pNgOgYxUtXco8KTrJ1fpXWdP=w1920-h937-iv1"
   , "https://lh3.google.com/u/0/d/1m0SxXdHE4bq543JtLCpFbbgor07HsdiR=w1920-h937-iv1"
   , "https://lh3.google.com/u/0/d/1psc3KNn6o-haSnrc1yOCu0t4gnNT5bIu=w1920-h937-iv1"
   , "https://lh3.google.com/u/0/d/1dn1xRkYRb1wj8xhNSKFU03XzrdSKd7MN=w1920-h937-iv1"
   , "https://lh3.google.com/u/0/d/1F4gzNKZ822ZmiCH-JaBKRRp71WqD9tM8=w1920-h937-iv1"
   , "https://lh3.google.com/u/0/d/1nJDdawjrO8GLLpeFhkQZG6Hm3EmScjgA=w1920-h937-iv1"
   , "https://lh3.google.com/u/0/d/1AwBp9JVItAdVcoQqpb89TIgr-Us0lgdV=w1920-h937-iv1"
   , "https://lh3.google.com/u/0/d/139y97JCRhO3spqqHVPlfXDT1zgNgaEKr=w1920-h937-iv1"
   , "https://lh3.google.com/u/0/d/1vMckOxLxuw64iqL6rlRrYlzKyZ4Kq7So=w1920-h937-iv1"
   , "https://lh3.google.com/u/0/d/1johQA0mfOvc_l4qi7G0M1pvn6AA37Ifz=w1920-h937-iv1"
   , "https://lh3.google.com/u/0/d/1F-Gypag7I1xfR6OTYSc31xnkf-GfpE-i=w1920-h937-iv1"
   , "https://lh3.google.com/u/0/d/1OGOgJim2o2zIrO3AKyyKg8i-I5xVfHhS=w1920-h937-iv1"
   , "https://lh3.google.com/u/0/d/1UUinmWZpnCaawiyENy2E5Shb9sSAMoN_=w1920-h937-iv1"
   , "https://lh3.google.com/u/0/d/1LsP5Y6ZjePioWpvbEuR-Bm-ymMde3S7O=w1920-h937-iv1"
   , "https://lh3.google.com/u/0/d/1KvI1xsNUTCG17EH_5cRmyJ5M8E95roaQ=w1920-h937-iv1"
   , "https://lh3.google.com/u/0/d/1f4bUcqaBEwcECyPa-Tx2-LLDkZoTjLzd=w1920-h937-iv1"
   , "https://lh3.google.com/u/0/d/1uBxLtkGGj-WK7r5FO8Y9fBglqYKG7lMr=w1920-h937-iv1"
   , "https://lh3.google.com/u/0/d/1HKPFyGBeH8DbVg8a6PMb4d83ymXfgexR=w1920-h937-iv1"];

const imagesHtml = imageSources.map(url => `<img src=${url} alt="Clue Card" border="0" />`);

const caretSources = ["https://lh3.google.com/u/0/d/1p5Zn4m5KkNrvh-aFeq1LtH5_MlpyW0Ak", "https://lh3.google.com/u/0/d/1FgEesVcge39EkFcdgQsDXQOIZ5HVbxdh"];

const iconSources = ["https://lh3.google.com/u/0/d/1hAQpVbcLkhmx3uFND_amgVh3Yi6LjXAD",
   "https://lh3.google.com/u/0/d/1RSPwuFo5Oy0Sv1eTo5yInfmmin2rp6o9",
   "https://lh3.google.com/u/0/d/119N2ZxoBK9xImMltOdW4wICHdnLeoz-7",
   "https://lh3.google.com/u/0/d/1HCIIhnUCZjNjp6VLY3kVURHs9o6e9zfY",
   "https://lh3.google.com/u/0/d/1tHcU7VpYFHDEZAIr0Lxj3qJ_Nak-QGSm",
   "https://lh3.google.com/u/0/d/1MPgDdtMmtbJDeQAEES7_nmiEpIexWzE7"];

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

//For display purposes
let dealerName;

//For caret switch

let isRules = true;
let isScores = true;

/**
* Static Functions
*/
function displayImageInViewer(cardId) {

   $("#img-viewer").empty();
   let button = $("<button id='exit-button'>X</button>");
   let card = $(imagesHtml[cardId]);
   $("#img-viewer").append(button);
   $("#img-viewer").append(card);
   $("#lightBox").show();

}

function updateGameObjectFromResponse(serverResponse) {
   let keys = Object.keys(serverResponse);

   for (let i = 0; i < keys.length; i++) {
      GameObject[keys[i]] = serverResponse[keys[i]];
   }

}

function updatePlayerScores(playerCount, playerObjects) {
   const scoreBar = $("#scores");
   scoreBar.empty();

   for (let i = 0; i < playerCount; i++) {
      let player = playerObjects[i];

      let scoreInfo = $(`
      <div class="row">
         <div class="col-lg-5 col-md-2">
            <img class="player-icon" src=${iconSources[i]}></img>
         </div> 
         <div class="col-lg-7 col-md-10">
            <p id="name-${i + 1}">${player.name} </p>
            <p>Score: <span id="score-${i + 1}">${player.score}</span></p>
         </div>
      </div>
      <hr>`);

      scoreBar.append(scoreInfo);

   }

}

function displayCards() {
   const hand = $("#hand");
   hand.empty();

   for (let i = 0; i < GameObject.hand.length; i++) {

      let imgIdentifier = GameObject.hand[i];
      let cardDiv = $("<div>");
      cardDiv.attr("class", "col-lg-2 col-md-4 col-sm-6 hand-card-div");
      cardDiv.attr("id", `card-${i}`);

      let card = $(imagesHtml[imgIdentifier]);

      card.attr("class", "player-card");
      card.attr("id", `img-${i}`);

      cardDiv.append(card);

      hand.append(cardDiv);
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
                  // localStorage.setItem("gameId", gameID);
                  // localStorage.setItem("index", playerIndex);
                  // localStorage.setItem("GameObject", GameObject);
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

                     let display = $(`<p>Pick a card from your deck that best matches the clue.</p>
                      <h2 class="inline"> ${GameObject.clue} </h2> 
                      <button class="submit-fake-vote" id="submit-fake">Submit</button>
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

                     let display = $(`<p>Vote for the card you believe to be the StoryTeller’s card.</p>
                    <h2 class="inline"> ${GameObject.clue} </h2> 
                    <button class="submit-fake-vote" id="submit-vote">Submit</button>
                    `);

                     board.append(display);

                     let row = $("<div class='row'>");

                     for (let i = 0; i < GameObject.roundCards.length; i++) {

                        let card = $(imagesHtml[GameObject.roundCards[i]]);
                        card.attr("class", "voteCard");
                        card.attr("id", `vote-${i}`);

                        if (i == 0) {
                           card.attr("class", "voteCard vote-selected");
                           voteCardIndex = 0;
                        }

                        let div = $(`<div class="voteDiv col-sm-12 col-md-4 col-lg-2" id=voteDiv-${i}></div>`);

                        div.append(card);

                        row.append(div);

                     }
                     board.append(row);

                     boardInstantiated++;

                  } else if (boardInstantiated < 3 && GameObject.turnOrder[GameObject.roundCount] - 1 == playerIndex) {
                     let board = $("#board");
                     board.empty();

                     let display = $(`<p> The other players are voting. </p>`);
                     board.append(display);

                     let row = $("<div class='row'>");

                     for (let i = 0; i < GameObject.roundCards.length; i++) {

                        let card = $(imagesHtml[GameObject.roundCards[i]]);
                        card.attr("class", "voteCard");
                        card.attr("id", `vote-${i}`);

                        let div = $(`<div class="voteDiv col-sm-12 col-md-4 col-lg-2" id=voteDiv-${i}></div>`);

                        div.append(card);

                        row.append(div);

                     }
                     board.append(row);
                     boardInstantiated++;
                  }
                  break;

               case "endDisplay":
                  if (boardInstantiated < 4) {
                     let board = $("#board");

                     board.empty();

                     let header = $(`<h2> Votes This Round </h2>
                  <p>${dealerName} was the StoryTeller</p>`);
                     board.append(header);
                     let row = $("<div class='row'></div>");

                     //Display cards with owner and votes
                     for (let i = 0; i < GameObject.playerCount; i++) {
                        let cardData = GameObject.roundData.cardArray[i];
                        let display = $(`<div class="col-sm-12 col-md-4 col-lg-2"><p>${GameObject.players[cardData.playerIndex].name}</p> 
                        <div class="voteCard" id="card-${i}">${imagesHtml[cardData.cardIdentifier]}</div>
                        <p>Votes: ${cardData.votes}</p></div>`);

                        GameObject.roundCards[i] = cardData.cardIdentifier;

                        row.append(display);
                     }
                     $("#board").append(row);

                     updatePlayerScores(GameObject.playerCount, GameObject.players);
                     //if host
                     if (playerIndex == 0) {
                        let button = $(`<button id="new-Round">next round</button>`);
                        board.append(button);
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
   cardIdentifier = GameObject.hand[0];

   dealerName = GameObject.players[dealerIndex - 1].name;

   if (dealerIndex - 1 == playerIndex) {
      display = $(`<p>Choose a card from your deck and enter a clue that relates to it.</p>
      <form>
      <textarea id="clue-input" rows="4" cols="50"></textarea>
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
      display = $(`<p> ${dealerName} is the StoryTeller and will submit a clue shortly...</p>`);
      board.append(display);
   }

}

function displayVoteSelection(cardRoundIndex) {
   //clicks are only enabled when the player is not a dealer
   if (GameObject.turnOrder[GameObject.roundCount] - 1 != playerIndex && GameObject.gameState == "vote") {

      $(`#vote-${voteCardIndex}`).attr("class", "voteCard");
      //if random var will from different variable
      voteCardIndex = cardRoundIndex;

      $(`#vote-${voteCardIndex}`).attr("class", "voteCard vote-selected");

   }
};

function displayBoardError(errorMessage) {
   const board = $("#board");

   const messageDiv = $(`
   
   <div class="col-12 error-message">
      <hr class="error-line">
         <p> ${errorMessage} </p>
      <hr class="error-line">
   </div>
  `);


   board.append(messageDiv);

   let timeout = setTimeout(() => {
      board.children().last().remove();
   }, 10000);

}

function playerNameValidations(playerName) {
   if (playerName === "") {
      displayBoardError("Please Enter a Player Name");
      return false;
   }

   if (playerName.length > 10) {
      displayBoardError("Player Name must have a less than 10 characters");
      return false;
   }

   return true;
}
/**
 * Event Listeners
 */

//Clicks

$("#lightBox").on("click", "#exit-button", function (event) {
   $("#lightBox").hide();
});

$("#board").on("click", function (event) {
   event.preventDefault();
   const id = event.target.id;

   let playerName;

   switch (id) {

      case "join-button":
         gameID = $("#id-input").val().trim().toUpperCase();
         playerName = $("#name-input").val().trim();


         //Validation Checks
         if (gameID === "") {
            displayBoardError("Enter a gameID to Join Existing game");
            return;
         }

         if (!playerNameValidations(playerName)) {
            return;
         }


         //Get game from game id
         $.ajax({
            method: "put",
            url: "/game/join",
            data: { gameId: gameID, playerName: playerName }
         }).then(function () {

            //Update code display
            $("#code").text(gameID);

            $.ajax({
               method: "get",
               url: `/game/pull/${gameID}/25`,

            }).then(function (response) {
               if (response) {
                  updateGameObjectFromResponse(response);

                  playerIndex = GameObject.playerCount - 1;

                  updatePlayerScores(GameObject.playerCount, GameObject.players);

                  initializeUpdateInterval();

                  displayJoinPhase(false);
               }
            });

         })
            .catch(err => {
               if (err.status === 404) {
                  displayBoardError("Game Not Found");
               }
               if (err.status === 400) {
                  displayBoardError("Too many players are already in game. Max is six.");
               }
               if (err.status === 399) {
                  displayBoardError(`The name ${playerName} is taken, please choose another name.`);
               }
               if (err.status === 377) {
                  displayBoardError(`Cannot join game that has already been started.`);
               }
            });
         break;

      case "new-button":

         playerName = $("#name-input").val().trim();

         if (!playerNameValidations(playerName)) {
            return;
         }


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

         }).catch(err => {
            if (err.status === 400) {
               displayBoardError("Must have a minimum of 3 players.");
            }
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

               let display = $("<p>The other players are selecting cards to match your clue...</p>");
               board.append(display);

               //Start the update interval that was paused to deal cards
               initializeUpdateInterval();
            });

         }).catch((err) => {
            if (err.status === 400) {
               displayBoardError("Clue cannot be empty.");
            }
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

               let display = $("<p>Other players are still selecting a card...</p>");
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

               let display = $("<p>Other players are still voting...</p>");
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

      //light button handler
      default:
         if (id.split("-")[0] === "lbutton") {
            let i = id.split("-")[1];
            displayImageInViewer(GameObject.roundCards[i]);
            break;
         }
         if (id.split("-")[0] === "vote") {
            let i = id.split("-")[1];
            displayVoteSelection(i);
            break;
         }
         break;

   }

});

$("#hand").on("click", (event) => {
   const targetID = event.target.id;

   let type = targetID.split("-")[0];
   handNum = targetID.split("-")[1];
   if (type == "lbutton") {
      displayImageInViewer(GameObject.hand[handNum]);
   }

   if ((GameObject.turnOrder[GameObject.roundCount] - 1 == playerIndex && GameObject.gameState === "mainCard") || (GameObject.turnOrder[GameObject.roundCount] - 1 != playerIndex && GameObject.gameState === "fakeCards" && !fakeCardSubmited)) {


      if (type == "img") {
         cardIdentifier = GameObject.hand[handNum];
         $("img").remove("#selected-card");

         let card = $(imagesHtml[cardIdentifier]);

         card.attr("class", "player-card");
         card.attr("id", `selected-card`);

         $("#board").append(card);
      }

   }

});

//Prevents more than four characters from being entered in id input
$("#id-input").on("change", function (event) {
   const value = $("#id-input").val();

   if (value.length > 4) {
      $("#id-input").val(value.substring(0, 4));
   }

});

//Pertains to dropdown menu
$(".caret").on("click", function (event) {

   const varId = event.target.id.split("-")[0];


   if (event.target.src == caretSources[0]) {
      $(`#${event.target.id}`).attr("src", caretSources[1]);
   } else {
      $(`#${event.target.id}`).attr("src", caretSources[0]);
   }

   if (varId == "rules") {
      isRules = !isRules;
   } else {
      isScores = !isScores;
   }


   if ((varId == "rules" && isRules) || (varId == "scores" && isScores)) {
      $(`#${varId}`).hide();
   } else {
      $(`#${varId}`).show();
   }

});

//Hovers
$("#board").on({
   mouseenter: (event) => {

      let handIdentifier = event.target.id.split("-")[1];
      $(`.lightbox-button`).remove();

      let img = $(`<img class='lightbox-button' id="lbutton-${handIdentifier}" src='https://lh3.google.com/u/0/d/1PmWUnfvCGbDVvUHH2CCldLUBt1PDi4dv'></img>`);
      $(`#voteDiv-${handIdentifier}`).append(img);
   }
}, ".voteCard");

$("#hand").on({
   mouseenter: (event) => {

      let handIdentifier = event.target.id.split("-")[1];
      $(`.lightbox-button`).remove();

      let img = $(`<img class='lightbox-button' id="lbutton-${handIdentifier}" src='https://lh3.google.com/u/0/d/1PmWUnfvCGbDVvUHH2CCldLUBt1PDi4dv'></img>`);
      $(`#card-${handIdentifier}`).append(img);
   }
}, ".player-card");

//Pertains to overlay to allow for light box click


/**
 * main
 */
$("#lightBox").hide();
$("#rules").hide();

//If in active game reload game settings
// gameID = localStorage.getItem("gameId");

// if (gameID != null) {
//    playerIndex = localStorage.getItem("index");
//    GameObject = localStorage.getItem("GameObject");
// }