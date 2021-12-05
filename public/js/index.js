/**
 * Static Variables
 */

const socket = io({});

const caretSources = ["./images/misc/up-caret-symbol.png", "./images/misc/down-caret-symbol.png"];

const iconSources = ["./images/playerIcons/Car.png",
   "./images/playerIcons/House.png",
   "./images/playerIcons/Power-plant.png",
   "./images/playerIcons/Cow.png",
   "./images/playerIcons/Tree.png",
   "./images/playerIcons/Refrigerator.png"];

const iconColors = ["#cb393d",
   "#bbc2ad",
   "#ffeb5d",
   "#942804",
   "#84c36e",
   "#ffaf46"];

/**
 * Variables that change over gameplay
 */

let gameID;
let GameObject = {
   gameId: "",
   playerCount: "0",
   players: []
}

// filled after join and deck information is given
let imageSources;

//Holds shuffled card values
let cardOrder = [];

// the curen't players index in the players array on gameobject
let playerIndex;

let gameManager;
// prevents gameobject from being updated if not needed
let boardInstantiated = 0;
// Interval to be cleared and initialized
let interval;

//whichever card thats selected in round window is here, Identifies this cards position in imagesources array
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

let isRules = false;
let isScores = true;
let isChat = false;

/**
 * static Functions
 */


function displayWaitingRoomPhase(isHost) {
   const startingForm = $("#game-start-form");
   startingForm.empty()

   let display;

   if (isHost) {
      display = $(`<div><p>Click start when all players have joined.<br/><button id="start-full-game-button">Start Game</button></p><div id="joined-player-list"></div></div>`);
   } else {
      display = $(`<div><p>Waiting For the Host...</p><div id="joined-player-list"></div></div>`);
   }

   startingForm.append(display);
   $("#start-full-game-button").on("click", startFullGame)
   updatePlayerScores(GameObject.playerCount, GameObject.players);
}

function hideWaitingRoomPhase() {
   $("header").hide()
   $("#game-start-form").hide()
   $("#start-about-links").hide()
   $("#game-layout-container").show();
}


function startFullGame() {

   $.ajax({
      method: "put",
      url: "/game/start",
      data: { gameId: gameID, playerIndex: playerIndex }
   }).then((response) => {

      updateGameObjectFromResponse(response);

      // startNewRound(GameObject.turnOrder[GameObject.roundCount]);

      // hide the ui resposible for creating / joining games
      hideWaitingRoomPhase();
      updatePlayerScores(GameObject.playerCount, GameObject.players);

   }).catch(err => {
      if (err.status === 400) {
         displayBoardError("Must have a minimum of 3 players.");
      }
   });

}

function startNewRound(dealerIndex) {

   clearBoard();
   const board = $("#board");

   let display;
   cardIdentifier = GameObject.hand[0];

   dealerName = GameObject.players[dealerIndex - 1].name;

   if (dealerIndex - 1 == playerIndex) {
      display = $(`<p>Choose a card from your deck and enter a clue that relates to it.</p>
      <form class="d-flex flex-row align-items-center">
      <textarea id="clue-input" rows="4" cols="50"></textarea>
      <button id="submit-clue">submit</button>
      </form>`);

      //Auto Displays first card in selcted area.
      let card = $(getImageHtml(cardIdentifier));

      card.attr("class", "voteCard");
      card.attr("id", `selected-card`);
      //Appends information to board
      board.append(display);
      board.append(card);

   } else {
      display = $(`<p> ${dealerName} is the StoryTeller and will submit a clue shortly...</p>`);
      board.append(display);
   }

}

let lastGameStage = null;

function handleGameUpdate() {

   $.ajax({
      method: "get",
      url: `/game/pull/${gameID}/${playerIndex}`,
      error: () => {
         location.reload();
      }

   }).then((serverResponse) => {

      if (GameObject != serverResponse) {
         if (serverResponse.gameState != GameObject.gameState) lastGameStage = GameObject.gameState

         updateGameObjectFromResponse(serverResponse);

         switch (GameObject.gameState) {
            case "join":
               gameID = GameObject.gameID;

               updatePlayerScores(GameObject.playerCount, GameObject.players);
               break;

            case "mainCard":

               hideWaitingRoomPhase();
               fakeCardSubmited = false;

               displayCards();

               startNewRound(GameObject.turnOrder[GameObject.roundCount]);
               boardInstantiated++;

               if (boardInstantiated == 4) {
                  boardInstantiated = 0;
               }

               break;
            case "fakeCards":

               //Everyone but dealer has this display

               if (GameObject.turnOrder[GameObject.roundCount] - 1 != playerIndex) {
                  //Display board info
                  let board = $("#board");
                  board.empty();

                  let display = $(`<p>Pick a card from your deck that best matches the clue.</p>
                         <h2 class="inline"> ${GameObject.clue} </h2>
                         <button class="submit-fake-vote" id="submit-fake">Submit</button>
                       `);

                  cardIdentifier = GameObject.hand[0];
                  let card = $(getImageHtml(cardIdentifier));

                  card.attr("class", "player-card hand-card-active");
                  card.attr("id", `selected-card`);

                  board.append(display);
                  board.append(card);

                  boardInstantiated++;
                  hideWaitingRoomPhase();
               }

               break;
            case "vote":
               if (GameObject.turnOrder[GameObject.roundCount] - 1 != playerIndex) {
                  //Display board info
                  let board = $("#board");
                  board.empty();

                  // clear hand so as not to confuse people between voting cards and hand cards
                  const hand = $("#hand");
                  hand.empty();

                  let display = $(`<p>Vote for the card you believe to be the StoryTeller’s card.</p>
                       <h2 class="inline"> ${GameObject.clue} </h2>
                       <button class="submit-fake-vote" id="submit-vote">Submit</button>
                       `);

                  board.append(display);

                  let row = $("<div class='row splay-deck'>");

                  for (let i = 0; i < GameObject.roundCards.length; i++) {

                     let cardDiv = $(`<div class="hand-card-div voteDiv" id=voteDiv-${i}></div>`);
                     cardDiv.css({ "z-index": (10 - i).toString() });

                     let card = $(getImageHtml(GameObject.roundCards[i]));
                     card[0].onload = function () {
                        cardDiv.on("mouseenter", () => {
                           cardDiv.addClass("hand-card-active");
                           cardDiv.css({ "max-width": `${this.width}px` });//"margin-left": `${100 - this.width}px` //`calc(${90 - this.width}px - 100% / 6 + 120px)`
                        });
                        cardDiv.on("mouseleave", () => {
                           if (i == voteCardIndex) return;
                           cardDiv.removeClass("hand-card-active");
                           cardDiv.css({ "max-width": '' });//"margin-left": `${100 - this.width}px` //`calc(${90 - this.width}px - 100% / 6 + 120px)`
                        });
                     }
                     card.attr("class", "voteCard ");
                     card.attr("id", `vote-${i}`);

                     if (i == 0) {
                        cardDiv.addClass("vote-selected");
                        cardDiv.addClass("hand-card-active")
                        voteCardIndex = 0;
                     }

                     cardDiv.append(card);

                     row.append(cardDiv);

                  }
                  board.append(row);

                  boardInstantiated++;

               } else if (GameObject.turnOrder[GameObject.roundCount] - 1 == playerIndex) {
                  let board = $("#board");
                  board.empty();

                  // clear hand so as not to confuse people between voting cards and hand cards
                  const hand = $("#hand");
                  hand.empty();

                  let display = $(`<p> The other players are voting. </p>`);
                  board.append(display);

                  let row = $("<div class='row splay-deck'>");

                  for (let i = 0; i < GameObject.roundCards.length; i++) {

                     let cardDiv = $(`<div class="hand-card-div voteDiv" id=voteDiv-${i}></div>`);
                     cardDiv.css({ "z-index": (10 - i).toString() });

                     let card = $(getImageHtml(GameObject.roundCards[i]));
                     card[0].onload = function () {
                        cardDiv.on("mouseenter", () => {
                           cardDiv.addClass("hand-card-active");
                           cardDiv.css({ "max-width": `${this.width}px` });//"margin-left": `${100 - this.width}px` //`calc(${90 - this.width}px - 100% / 6 + 120px)`
                        });
                        cardDiv.on("mouseleave", () => {
                           if (i == voteCardIndex) return;
                           cardDiv.removeClass("hand-card-active");
                           cardDiv.css({ "max-width": '' });//"margin-left": `${100 - this.width}px` //`calc(${90 - this.width}px - 100% / 6 + 120px)`
                        });
                     }
                     card.attr("class", "voteCard ");
                     card.attr("id", `vote-${i}`);

                     cardDiv.append(card);

                     row.append(cardDiv);

                  }
                  board.append(row);
                  boardInstantiated++;
               }
               break;

            case "endDisplay":
               if (true) {
                  let board = $("#board");

                  board.empty();

                  let header = $(`<h2> Votes This Round </h2>
                     <p>${dealerName} was the StoryTeller</p>`);
                  board.append(header);
                  let row = $("<div class='row' style='justify-content: center;'></div>");

                  //Display cards with owner and votes
                  for (let i = 0; i < GameObject.playerCount; i++) {
                     let cardData = GameObject.roundData.cardArray[i];
                     let display = $(`<div class="votesDisplayCard"><p>${GameObject.players[cardData.playerIndex].name}</p>
                           <div class="voteCard" id="vote-${i}">${getImageHtml(cardData.cardIdentifier)}</div>
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

}

function initializeGameUpdateListenerSocket() {
   socket.on(gameID + "-update", () => {
      handleGameUpdate();
   });
}



function displayVoteSelection(cardRoundIndex) {
   //clicks are only enabled when the player is not a dealer
   if (GameObject.turnOrder[GameObject.roundCount] - 1 != playerIndex && GameObject.gameState == "vote") {
      if (voteCardIndex != cardRoundIndex) {
         var card = $(`#vote-${voteCardIndex}`)
         card.parent().removeClass("vote-selected");
         card.parent().removeClass("hand-card-active");
         card.parent().css({ "max-width": '' });

         //if random var will from different variable
         voteCardIndex = cardRoundIndex;

         card = $(`#vote-${voteCardIndex}`)
         card.parent().addClass("vote-selected");
         card.parent().addClass("hand-card-active");
         card.parent().css({ "max-width": `${card.width}px` });
      }
   }
};


function clearBoard() {
   const board = $("#board");
   board.empty();
}

function setDeckUrls(urls) {
   imageSources = urls;
}

function getImageHtml(cardIndex) {
   return `<img src="${imageSources[cardIndex]}" alt="Art Card" border="0" />`;
};

function updateGameObjectFromResponse(serverResponse) {
   let keys = Object.keys(serverResponse);

   if (serverResponse.players && serverResponse.players.length != serverResponse.players.length) {
      GameObject.playerCount = serverResponse.players.length;
   }

   for (let i = 0; i < keys.length; i++) {
      GameObject[keys[i]] = serverResponse[keys[i]];
   }

}

function displayImageInViewer(cardId) {
   $("#img-viewer").empty();
   let button = $("<button id='exit-button'>X</button>");
   let card = $(getImageHtml(cardId));
   $("#img-viewer").append(button);
   $("#img-viewer").append(card);
   $("#lightBox").show();
}

function updatePlayerScores(playerCount, playerObjects) {
   const scoreBar = $("#scores");
   scoreBar.empty();

   const playerBar = $("#joined-player-list")
   if (playerBar) playerBar.empty();

   for (let i = 0; i < playerCount; i++) {
      let player = playerObjects[i];

      let scoreInfo = $(`
      <div class="row m-0">
            <img class="player-icon" src=${iconSources[i]}></img>
         <span id="name-${i + 1}" style="color:${iconColors[i]}; margin-bottom:0">${player.name} </span>
         <span id="score-${i + 1}" style="margin-top:3px">${player.score}</span></p>
      </div>`);

      scoreBar.append(scoreInfo);

      if (playerBar) {
         playerBar.append($(`
      <div class="joined-player-item">
         <img class="player-icon" src=${iconSources[i]}></img>
         <p>${player.name}</p>
      </div>`))
      }

   }

}

function displayCards() {
   const hand = $("#hand");
   hand.empty();

   let lastCardImgElement = null;
   for (let i = 0; i < GameObject.hand.length; i++) {

      let imgIdentifier = GameObject.hand[i];
      let cardDiv = $("<div>");
      cardDiv.attr("class", "hand-card-div");
      cardDiv.attr("id", `card-${i}`);
      cardDiv.css({ "z-index": (10 - i).toString() });

      let card = $(getImageHtml(imgIdentifier));


      card[0].onload = function () {

         cardDiv.on("mouseenter", () => {
            cardDiv.addClass("hand-card-active");
            cardDiv.css({ "max-width": `${this.width}px` });//"margin-left": `${100 - this.width}px` //`calc(${90 - this.width}px - 100% / 6 + 120px)`
         });
         cardDiv.on("mouseleave", () => {
            if (i == selectedHandCardIndex) return;
            cardDiv.removeClass("hand-card-active");
            cardDiv.css({ "max-width": '' });//"margin-left": `${100 - this.width}px` //`calc(${90 - this.width}px - 100% / 6 + 120px)`
         });
      }
      if (i == 0) {
         cardDiv.addClass("vote-selected");
         cardDiv.addClass("hand-card-active");
      }

      card.attr("class", "player-card");
      card.attr("id", `img-${i}`);

      cardDiv.append(card);

      hand.append(cardDiv);
   }
}

function displayBoardError(errorMessage) {
   const board = $("#error-bar");

   const messageDiv = $(`

   <div class="col-12 error-message">
      <hr class="error-line">
         <p> ${errorMessage} </p>
      <hr class="error-line">
   </div>
  `);


   board.append(messageDiv);

   let timeout = setTimeout(() => {
      board.children().last().remove(".error-message");
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


$("#lightBox").on("click", "#exit-button", (event) => {
   $("#lightBox").hide();
});


// Chat event listeners
$("#chat-form").on("submit", (event) => {
   event.preventDefault();
   let currentRoom = gameID || "global-waiting-room-id";
   let input = $("#chat-input");
   socket.emit("new-chat-message", {
      roomId: currentRoom,
      playerIndex: (gameID !== "global-waiting-room-id" ? playerIndex : -1),
      message: input.val()
   });
   input.val("");
});

$("#board").on("click", (event) => {
   event.preventDefault();
   const id = event.target.id;

   switch (id) {


      case "submit-clue":
         //Stop interval to prevent overwriting push data
         clearInterval(interval);
         const clue = $("#clue-input").val().trim();

         const roundData = { playersActed: 1, clue: clue, cardArray: [{ playerIndex: playerIndex, cardIdentifier: cardIdentifier, votes: 0, voterIndexes: [] }] };

         $.ajax({
            method: "put",
            url: "/game/clue",
            data: { gameId: gameID, roundData: roundData, playerIndex: playerIndex }
         }).then((response) => {
            updateGameObjectFromResponse(response);

            //update hand with removed card
            $(`#img-${handNum}`).parent().remove()

            //Update story teller display
            let board = $("#board");

            board.empty();

            let display = $("<p>The other players are selecting cards to match your clue...</p>");
            board.append(display);
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
         }).then((response) => {

            //To prevent selected cards appending
            fakeCardSubmited = true;

            updateGameObjectFromResponse(response);


            //update hand with removed card
            $(`#img-${handNum}`).parent().remove()

            //Update story teller display
            let board = $("#board");

            board.empty();

            let display = $("<p>Other players are still selecting a card...</p>");
            board.append(display);
         });

         break;

      case "submit-vote":
         clearInterval(interval);

         $.ajax({
            method: "put",
            url: "/game/vote",
            data: { gameId: gameID, cardIndex: voteCardIndex, playerIndex: playerIndex }
         }).then((response) => {
            //To prevent selected cards appending
            fakeCardSubmited = true;

            updateGameObjectFromResponse(response);


            //Update story teller display
            let board = $("#board");

            board.empty();

            let display = $("<p>Other players are still voting...</p>");
            board.append(display);

         });

         break;
      case "new-Round":
         clearInterval(interval);

         boardInstantiated = 0;
         fakeCardSubmited = false;


         $.ajax({
            method: "put",
            url: "/game/next",
            data: { gameId: gameID, players: GameObject.players, cardOrder: GameObject.cardOrder, playerIndex: playerIndex }
         }).then(function (response) {

            updateGameObjectFromResponse(response);

            displayCards();

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

let selectedHandCardIndex = 0
$("#hand").on("click", (event) => {
   const targetID = event.target.id;
   let type = targetID.split("-")[0];
   handNum = targetID.split("-")[1];
   if (type == "lbutton") {
      displayImageInViewer(GameObject.hand[handNum]);
   }


   if ((GameObject.turnOrder[GameObject.roundCount] - 1 == playerIndex && GameObject.gameState === "mainCard")
      || (GameObject.turnOrder[GameObject.roundCount] - 1 != playerIndex && GameObject.gameState === "fakeCards" && !fakeCardSubmited)) {

      if (type == "img") {
         cardIdentifier = GameObject.hand[handNum];
         $("#selected-card").remove();

         if (selectedHandCardIndex != handNum) {
            var handCard = $(`#card-${selectedHandCardIndex}`)
            handCard.removeClass("vote-selected");
            handCard.removeClass("hand-card-active");
            handCard.css({ "max-width": '' });

            var handCard = $(`#card-${handNum}`)
            handCard.addClass("vote-selected");
            handCard.addClass("hand-card-active");
            handCard.css({ "max-width": `${handCard.children().first().width}px` });

            selectedHandCardIndex = handNum
         }

         let card = $(getImageHtml(cardIdentifier));

         // card.attr("class", "player-card");
         card.attr("id", `selected-card`);

         $("#board").append(card);
      }

   }

});

// Toggle show/hide of the scores in the sidebar
$("#scores-caret").on("click", function (event) {
   isScores = !isScores;
   if (isScores) {
      $("#scores-caret").children(".caret").attr("src", caretSources[1])
      $(`#scores`).show();
   } else {
      $("#scores-caret").children(".caret").attr("src", caretSources[0])
      $(`#scores`).hide();
   }
});

//Prevents more than four characters from being entered in id input
$("#id-input").on("change", function (event) {
   const value = $("#id-input").val();

   if (value.length > 4) {
      $("#id-input").val(value.substring(0, 4));
   }

});

let showCardZoomIconOnHoverJqueryEventConfig = {
   mouseenter: (event) => {

      let handIdentifier = event.target.id.split("-")[1];
      $(`.lightbox-button`).remove();

      let img = $(`<img class='lightbox-button' id="lbutton-${handIdentifier}" src='./images/misc/zoom.jpg'></img>`);
      $(`#card-${handIdentifier}`).append(img);
   }
}
$("#board").on(showCardZoomIconOnHoverJqueryEventConfig, ".hand-card-div");
$("#hand").on(showCardZoomIconOnHoverJqueryEventConfig, ".player-card");

// Handle Player Clicking the Create Game Button and create a new game room.
$("#create-game-button").on("click", () => {
   let deckId = $("#deck-select").val();

   if (deckId === "") {
      displayBoardError("Please Select a Deck");
      return;
   }

   playerName = $("#newgame-name-input").val().trim();

   if (!playerNameValidations(playerName)) {
      return;
   }


   $.ajax({
      method: "POST",
      url: "/game/new",
      data: {
         playerName: playerName,
         id: deckId
      }

   }).then((response) => {
      playerIndex = 0;

      updateGameObjectFromResponse(response);

      setDeckUrls(response.cardUrls);

      //Get gameId from server
      gameID = GameObject.gameID;

      //Update join code display
      $("#code").text(gameID);
      $("#code-label").show();

      // Select the game id on screen
      // (for debug / copying the join code)
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(document.getElementById("code"));
      selection.removeAllRanges();
      selection.addRange(range);

      initializeGameUpdateListenerSocket();

      displayWaitingRoomPhase(true);
   }).catch(err => {
      console.log(err.status)
   });

})

// Handle Player Clicking the Join Game Button and joining an exsiting game
$("#join-existing-game-button").on("click", function () {
   // join an existing game
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

   $.ajax({
      method: "put",
      url: "/game/join",
      data: { gameId: gameID, playerName: playerName }
   }).then((response) => {

      //Update code display
      $("#code").text(gameID);
      $("#code-label").show();

      updateGameObjectFromResponse(response);
      setDeckUrls(response.cardUrls);

      playerIndex = GameObject.playerCount - 1;

      initializeGameUpdateListenerSocket();

      displayWaitingRoomPhase(false);

   }).catch(err => {
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

})

socket.on("broadcast-chat-message", (messageObject) => {
   let currentRoom = gameID || "global-waiting-room-id";
   if (messageObject.roomId === currentRoom) {
      let messageHTML = $(`
            <p class="broadcast-chat-message"><em style="color:${messageObject.playerIndex >= 0 ? iconColors[messageObject.playerIndex] : "#fff"}">${(messageObject.playerIndex >= 0 ? GameObject.players[messageObject.playerIndex].name + ": " : "")}</em>${messageObject.message}</p>
      </div>`);
      $("#chat-messages").append(messageHTML);
   }
});

/**
 * Main
 */

$("#lightBox").hide();

//get deck from database
$.ajax({
   method: "GET",
   url: "/api/decks"
}).then(data => {
   let selector = $("#deck-select");
   data.forEach(deck => {
      let option = $(`<option value=${deck._id}>${deck.name}</option>`);
      selector.append(option);
   });
});






