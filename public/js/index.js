/**
 * Static Vars
 */
const socket = io({});

//filled after join and deck information is given
let imageSources;

let imagesHtml;

const caretSources = ["./images/misc/up-caret-symbol.png", "./images/misc/down-caret-symbol.png"];

const iconSources = ["./images/playerIcons/Car.png",
   "./images/playerIcons/House.png",
   "./images/playerIcons/Power-plant.png",
   "./images/playerIcons/Cow.png",
   "./images/playerIcons/Tree.png",
   "./images/playerIcons/Refrigerator.png"];

const iconColors = ["#e33533",
   "#a09030",
   "#2080db",
   "#a24526",
   "#22861c",
   "#d8945b"];


// document.body.innerHTML = "";
// iconSources.forEach(element => {
//    var a = new Image(100, 100)
//    a.setAttribute("src", element)
//    document.body.appendChild(a)
// });

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

let isRules = false;
let isScores = true;
let isChat = false;

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

   const playerBar = $("#joined-player-list")
   if (playerBar) playerBar.empty();

   for (let i = 0; i < playerCount; i++) {
      let player = playerObjects[i];

      let scoreInfo = $(`
      <div class="row">
         <div class="col-lg-5 col-md-2">
            <img class="player-icon" src=${iconSources[i]}></img>
         </div>
         <div class="col-lg-7 col-md-10">
            <p id="name-${i + 1}" style="color:${iconColors[i]}; margin-bottom:0">${player.name} </p>
            <p><span id="score-${i + 1}" style="margin-top:3px">${player.score}</span></p>
         </div>
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
      cardDiv.attr("class", "col-lg-2 col-md-4 col-sm-6 hand-card-div");
      cardDiv.attr("id", `card-${i}`);
      cardDiv.css({ "z-index": (10 - i).toString() });

      let card = $(imagesHtml[imgIdentifier]);

      card[0].onload = function () {
         console.log(this)
         console.log(this.width)
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

let lastGameState = null;
function initializeUpdateInterval() {
   interval = setInterval(() => {

      $.ajax({
         method: "get",
         url: `/game/pull/${gameID}/${playerIndex}`,
         error: () => {
            location.reload();
         }

      }).then(function (response) {
         console.log(response, GameObject)
         //TODO:: Varable indicating change
         if (GameObject != response) {
            if (response.gameState != GameObject.gameState) lastGameState = GameObject.gameState
            updateGameObjectFromResponse(response);

            switch (GameObject.gameState) {
               case "join":
                  //Add Response data to game object
                  gameID = GameObject.gameID;
                  // localStorage.setItem("gameId", gameID);
                  // localStorage.setItem("index", playerIndex);
                  // localStorage.setItem("GameObject", GameObject);
                  updatePlayerScores(GameObject.playerCount, GameObject.players);

                  console.log("join event")
                  // hideJoinPhase();
                  break;

               case "mainCard":

                  //TODO :: If it is players turn to pick offer them a choice
                  if (boardInstantiated < 1 || lastGameState == "endDisplay") {
                     hideJoinPhase();
                     fakeCardSubmited = false;

                     displayCards();

                     startNewRound(GameObject.turnOrder[GameObject.roundCount]);
                     boardInstantiated++;
                  }



                  if (boardInstantiated == 4) {
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

                     card.attr("class", "player-card hand-card-active");
                     card.attr("id", `selected-card`);

                     board.append(display);
                     board.append(card);

                     boardInstantiated++;
                     hideJoinPhase();
                  }

                  break;
               case "vote":
                  if (boardInstantiated < 3 && GameObject.turnOrder[GameObject.roundCount] - 1 != playerIndex) {
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

                        let cardDiv = $(`<div class="hand-card-div voteDiv col-sm-12 col-md-4 col-lg-2" id=voteDiv-${i}></div>`);
                        cardDiv.css({ "z-index": (10 - i).toString() });

                        let card = $(imagesHtml[GameObject.roundCards[i]]);
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

                  } else if (boardInstantiated < 3 && GameObject.turnOrder[GameObject.roundCount] - 1 == playerIndex) {
                     let board = $("#board");
                     board.empty();

                     // clear hand so as not to confuse people between voting cards and hand cards
                     const hand = $("#hand");
                     hand.empty();

                     let display = $(`<p> The other players are voting. </p>`);
                     board.append(display);

                     let row = $("<div class='row splay-deck'>");

                     for (let i = 0; i < GameObject.roundCards.length; i++) {

                        let cardDiv = $(`<div class="hand-card-div voteDiv col-sm-12 col-md-4 col-lg-2" id=voteDiv-${i}></div>`);
                        cardDiv.css({ "z-index": (10 - i).toString() });

                        let card = $(imagesHtml[GameObject.roundCards[i]]);
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
                  if (boardInstantiated < 4) {
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
                        <div class="voteCard" id="vote-${i}">${imagesHtml[cardData.cardIdentifier]}</div>
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

function startNewGame() {
   // start a new game:
   updatePlayerScores(GameObject.playerCount, GameObject.players);
   console.log(playerIndex);
   $.ajax({
      method: "put",
      url: "/game/start",
      data: { gameId: gameID, playerIndex: playerIndex }
   }).then((response) => {

      updateGameObjectFromResponse(response);

      startNewRound(GameObject.turnOrder[GameObject.roundCount]);

      // hide the ui resposible for creating / joining games
      hideJoinPhase()

      //Start the update interval that was paused to deal cards
      initializeUpdateInterval();
   }).catch(err => {
      if (err.status === 400) {
         displayBoardError("Must have a minimum of 3 players.");
      }
   });
}

function displayJoinPhase(isHost) {

   const startingForm = $("#game-start-form");
   startingForm.empty()

   let display;

   if (isHost) {
      display = $(`<div><p>Click start when all players have joined.<br/><button id="start-button">Start Game</button></p><div id="joined-player-list"></div></div>`);
   } else {
      display = $(`<div><p>Waiting For the Host...</p><div id="joined-player-list"></div></div>`);
   }

   startingForm.append(display);


   $("#start-button").on("click", startNewGame)
}

function hideJoinPhase() {
   $("header").hide()
   $("#game-start-form").hide()
   $("#start-about-links").hide()
   $("#board-container").show();
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

function setDeckUrls(urls) {
   imageSources = urls;
   imagesHtml = imageSources.map(url => `<img src=${url} alt="Art Card" border="0" />`);

};
/**
 * Event Listeners
 */

//Clicks

$("#lightBox").on("click", "#exit-button", function (event) {
   $("#lightBox").hide();
});

$("#join-button").on("click", function () {
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


   //Get game from game id
   $.ajax({
      method: "put",
      url: "/game/join",
      data: { gameId: gameID, playerName: playerName }
   }).then((response) => {
      //Update code display
      $("#code").text(gameID);

      updateGameObjectFromResponse(response);
      setDeckUrls(response.cardUrls);

      playerIndex = GameObject.playerCount - 1;

      updatePlayerScores(GameObject.playerCount, GameObject.players);

      initializeUpdateInterval();

      displayJoinPhase(false);



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

$("#new-game-button").on("click", function () {
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
      console.log(response);
      playerIndex = 0;

      updateGameObjectFromResponse(response);

      setDeckUrls(response.cardUrls);

      //Get gameId from server
      gameID = GameObject.gameID;

      //Update code display
      $("#code").text(gameID);
      $("#code-label").show();


      updatePlayerScores(GameObject.playerCount, GameObject.players);
      initializeUpdateInterval();

      displayJoinPhase(true);
   }).catch(err => {
      console.log(err.status)
   });

})

$("#board").on("click", function (event) {
   event.preventDefault();
   const id = event.target.id;

   let playerName;

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
         }).then(function (response) {

            updateGameObjectFromResponse(response);

            //update hand with removed card
            $(`#img-${handNum}`).parent().remove()

            //Update story teller display
            let board = $("#board");

            board.empty();

            let display = $("<p>The other players are selecting cards to match your clue...</p>");
            board.append(display);

            //Start the update interval that was paused to deal cards
            initializeUpdateInterval();

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
         }).then(function (response) {


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

            //Start the update interval that was paused to deal cards
            initializeUpdateInterval();
         });
         break;

      case "submit-vote":
         clearInterval(interval);
         $.ajax({
            method: "put",
            url: "/game/vote",
            data: { gameId: gameID, cardIndex: voteCardIndex, playerIndex: playerIndex }
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

            //Start the update interval that was paused to deal cards
            initializeUpdateInterval();

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
   console.log(targetID)
   let type = targetID.split("-")[0];
   handNum = targetID.split("-")[1];
   console.log(type, handNum)
   if (type == "lbutton") {
      displayImageInViewer(GameObject.hand[handNum]);
   }


   if ((GameObject.turnOrder[GameObject.roundCount] - 1 == playerIndex && GameObject.gameState === "mainCard") || (GameObject.turnOrder[GameObject.roundCount] - 1 != playerIndex && GameObject.gameState === "fakeCards" && !fakeCardSubmited)) {

      console.log("dddd")
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
$(".caret-header").on("click", function (event) {

   const varId = event.currentTarget.id.split("-")[0];

   console.log(event)

   if (varId == "rules") {
      isRules = !isRules;
      isChat = false;
      isScores = false;
   } else if (varId == "scores") {
      isScores = !isScores;
      isChat = false;
      isRules = false
   } else if (varId == "chat") {
      isChat = !isChat;
      isScores = false;
      isRules = false
   }

   if (isRules) {
      $("#rules-caret").children(".caret").attr("src", caretSources[1])
      $(`#rules`).show();
   } else {
      $("#rules-caret").children(".caret").attr("src", caretSources[0])
      $(`#rules`).hide();
   }
   if (isChat) {
      $("#chat-caret").children(".caret").attr("src", caretSources[1])
      $(`#chat`).show();
   } else {
      $("#chat-caret").children(".caret").attr("src", caretSources[0])
      $(`#chat`).hide();
   }
   if (isScores) {
      $("#scores-caret").children(".caret").attr("src", caretSources[1])
      $(`#scores`).show();
   } else {
      $("#scores-caret").children(".caret").attr("src", caretSources[0])
      $(`#scores`).hide();
   }

});

//Hovers
let showCardZoomIconOnHoverJqueryEventConfig = {
   mouseenter: (event) => {

      let handIdentifier = event.target.id.split("-")[1];
      $(`.lightbox-button`).remove();

      let img = $(`<img class='lightbox-button' id="lbutton-${handIdentifier}" src='./images/misc/zoom.jpg'></img>`);
      $(`#card-${handIdentifier}`).append(img);
   }
}
// $("#board").on(showCardZoomIconOnHoverJqueryEventConfig, ".player-card");
$("#board").on(showCardZoomIconOnHoverJqueryEventConfig, ".hand-card-div");
$("#hand").on(showCardZoomIconOnHoverJqueryEventConfig, ".player-card");


//Chat event listeners
$("#chat-form").on("submit", (event) => {
   event.preventDefault();
   let currentRoom = gameID || "global-waiting-room-id";
   let input = $("#chat-input");
   socket.emit("new-message", {
      roomId: currentRoom,
      playerIndex: (gameID !== "global-waiting-room-id" ? playerIndex : -1),
      message: input.val()
   });
   input.val("");
});


socket.on("message", (messageObject) => {
   let currentRoom = gameID || "global-waiting-room-id";
   if (messageObject.roomId === currentRoom) {
      let messageHTML = $(`
            <p class="message"><em style="color:${messageObject.playerIndex >= 0 ? iconColors[messageObject.playerIndex] : "#fff"}">${(messageObject.playerIndex >= 0 ? GameObject.players[messageObject.playerIndex].name + ": " : "")}</em>${messageObject.message}</p>
      </div>`);
      $("#chat-messages").append(messageHTML);
   }
});


/**
 * main
 */
$("#lightBox").hide();
$("#rules").hide();

//get deck from database
$.ajax({
   method: "GET",
   url: "/api/decks"
}).then(data => {
   let selector = $("#deck-select");
   console.log(data);
   data.forEach(deck => {
      let option = $(`<option value=${deck._id}>${deck.name}</option>`);
      selector.append(option);
   });
});

//If in active game reload game settings
// gameID = localStorage.getItem("gameId");

// if (gameID != null) {
//    playerIndex = localStorage.getItem("index");
//    GameObject = localStorage.getItem("GameObject");
// }
