require("dotenv").config();
const fetch = require("node-fetch");

module.exports = function (app, db) {

    //POST Functions
    app.post("/api/deck", (req, res) => {

        if (req.body.passphrase == "thunderbird") {
            fetch(`https://www.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=${process.env.API_KEY}&photoset_id=${req.body.set}&user_id=${req.body.user}&format=json&nojsoncallback=1`)
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    let tempArray = data.photoset.photo.map(photo => {
                        return `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_b.jpg`;
                    });

                    const deck = new db.Deck({ name: req.body.name, cardUrls: tempArray });

                    deck.save()
                        .catch(err => console.log(err))

                    res.send(tempArray);

                })
                .catch(err => {
                    res.sendStatus(err.code);
                });
        } else {
            res.sendStatus(400);
        }

    });

}