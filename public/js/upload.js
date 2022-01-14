/**
 * event listner
 */
$("#add-deck-form").on("submit", (event) => {
    event.preventDefault();
    let body = {};
    body["name"] = $("#name-input").val().trim();

    if (body.name == "") {
        alert("Please input a deck name.");
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
            console.log("Success");
            data.forEach(img => {
                let imgHTML = $(`<img src=${img} alt="Confirmation of upload" />`)
                $("#success-section").append(imgHTML);
            });
        })
        .catch(err => {
            if (err.status == 400) {
                console.log("incorrect password");
            }
            console.log(err.status);
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
            alert("Success");
            getDecks();
        })
        .catch(err => {
            if (err.status == 400) {
                alert("incorrect password");
            } else {
                alert("Error Deleting Deck: " + err.status);
            }
        });
});


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
getDecks();