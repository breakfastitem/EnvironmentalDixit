if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const fetch = require("node-fetch");


module.exports = function (app, db) {

    //POST Functions
    app.post("/api/deck", (req, res) => {

        if (req.body.passphrase == "thunderbird") {
            var url = req.body.alblumUrl

            fetch(`https://www.flickr.com/services/rest/?method=flickr.urls.lookupUser&api_key=${process.env.API_KEY}&url=${encodeURIComponent(url)}&format=json&nojsoncallback=1`)
                .then(response => response.json())
                .then(data => {
                    var userId, setName;

                    userId = data.user.id
                    setName = url.split("/")[6];


                    console.log(`https://www.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=${process.env.API_KEY}&photoset_id=${setName}&user_id=${userId}&format=json&nojsoncallback=1`)
                    return fetch(`https://www.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=${process.env.API_KEY}&photoset_id=${setName}&user_id=${userId}&format=json&nojsoncallback=1`)
                }).then(response => response.json())
                .then(data => {
                    let tempArray = data.photoset.photo.map(photo => {
                        return `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_b.jpg`;
                    });

                    console.log({ name: req.body.name, cardUrls: tempArray })

                    const deck = new db.Deck({ name: req.body.name, cardUrls: tempArray });

                    deck.save()
                        .catch(err => console.log(err))

                    res.send(tempArray);

                })
                .catch(err => {
                    console.log("Deck api or Flicker api error:", err);
                    res.sendStatus(err.code);
                });
        } else {
            res.sendStatus(400);
        }

    });

    app.get("/api/decks", (req, res) => {
        db.Deck.find({})
            .then(data => {
                res.send(data);
            });
    });

}