/**
 * event listner
 */
$("#add-deck-form").on("submit", (event) => {
    event.preventDefault();
    let body = {};
    body["name"] = $("#name-input").val().trim();

    if (body.name == "") {
        displayBoardError("Please input a deck name.");
        return;
    }

    body["passphrase"] = $("#password-input").val().trim();
    body["alblumUrl"] = $("#url-input").val().trim()
    body["name"] = $("#name-input").val().trim();

    $.ajax({
        method: "POST",
        url: "/api/add_deck",
        data: body
    })
        .then(data => {
            displayBoardError("Success!", true);
            data.forEach(img => {
                let imgHTML = $(`<img src=${img} alt="Confirmation of upload" />`)
                $("#success-section").append(imgHTML);
            });
        })
        .catch(err => {
            if (err.status == 400) {
                displayBoardError("incorrect password");
            }
            console.warn("/api/add_deck error:", err);
        });
});

/**
 * event listner
 */
$("#del-deck-form").on("submit", (event) => {
    event.preventDefault();
    let body = {};
    body["passphrase"] = $("#password-input").val().trim();
    body["deckName"] = $("#deck-select").val();

    if (body["deckName"] === "") {
        alert("Please Select a Deck");
        return;
    }

    $.ajax({
        method: "POST",
        url: "/api/delete_deck",
        data: body
    })
        .then(() => {
            displayBoardError("Success!", true);
            getDecks();
        })
        .catch(err => {
            if (err.status == 400) {
                displayBoardError("incorrect password");
            } else {
                displayBoardError("Error Deleting Deck: " + err.status);
                console.warn("/api/delete_deck error:", err);
            }
        });
});

function displayBoardError(errorMessage, goodMessage) {
    const board = $("#error-bar");

    const messageDiv = $(`

    <div class="col-12 ${goodMessage ? 'alert-success' : 'error-message'}">
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

function getDecks() {
    //get deck from database
    let selector = $("#deck-select");
    selector.empty();
    $.ajax({
        method: "GET",
        url: "/api/decks"
    }).then(data => {
        data.forEach(deck => {
            let option = $(`<option value="${deck.name}">${deck.name}</option>`);
            selector.append(option);
        });
    });
}
getDecks()
