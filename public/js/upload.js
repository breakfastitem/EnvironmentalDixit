/**
 * event listner
 */
$("#password-form").on("submit", (event) => {
    event.preventDefault();
    let body = {};
    body["name"] = $("#name-input").val().trim();

    if (body.name == "") {
        console.log("Please input Deck name.");
        return;
    }


    let urlArray = $("#url-input").val().trim().split('/');
    console.log(urlArray);


    body["passphrase"] = $("#password-input").val().trim();
    body["set"] = urlArray[6];
    body["user"] = urlArray[4];
    body["name"] = $("#name-input").val().trim();


    $.ajax({
        method: "POST",
        url: "/api/deck",
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