if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const fetch = require("node-fetch");


module.exports = function (app, db) {

    //POST Functions
    app.post("/api/add_deck", (req, res) => {

        try {
            if (req.body.passphrase == "thunderbird") {
                var url = req.body.alblumUrl

                fetch(`https://www.flickr.com/services/rest/?method=flickr.urls.lookupUser&api_key=${process.env.API_KEY}&url=${encodeURIComponent(url)}&format=json&nojsoncallback=1`)
                    .then(response => response.json())
                    .then(data => {
                        const userId = data.user.id
                        const setName = url.split("/")[6];

                        return fetch(`https://www.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=${process.env.API_KEY}&photoset_id=${setName}&user_id=${userId}&extras=description,tags,url_o&format=json&nojsoncallback=1`)
                    }).then(response => response.json())
                    .then(data => {
                        let cardUrlsArray = data.photoset.photo.map(photo => {
                            return photo.url_o
                        });
                        let cardInfoArray = data.photoset.photo.map(photo => {
                            // let tag = photo.tags.tag ? photo.tags.tag[0].raw : photo.tags.split(" ")[0]
                            return {
                                title: photo.title,
                                description: photo.description._content,
                            }
                        })


                        let newDeckDBDocument = { name: req.body.name, cardUrls: cardUrlsArray, cardInfoArray: cardInfoArray }
                        console.log(newDeckDBDocument)
                        const deck = new db.Deck(newDeckDBDocument);
                        deck.save().catch(err => console.log(err))

                        res.send(cardUrlsArray);

                    })
                    .catch(err => {
                        console.log("Deck api or Flicker api error:", err);
                        res.sendStatus(err.code);
                    });
            }
        } catch (error) {
            console.error("Deck api error:", error);
            res.sendStatus(500);
        }

    });

    app.post("/api/delete_deck", (req, res) => {
        if (req.body.passphrase == "thunderbird") {
            var deckName = req.body.deckName
            db.Deck.findOneAndDelete({ name: { $eq: deckName } }, (err, doc) => {
                if (err) {
                    console.log("ERROR Deleting Deck " + deckName + ": ", err)
                    res.sendStatus(500);
                } else {
                    console.log("Deleted Deck: ", deckName);
                    res.send({ status: 'success' });
                }
            });
        } else {
            res.sendStatus(400);
        }
    });

    app.get("/api/decks", (req, res) => {
        db.Deck.find({})
            .then(data => {
                data = data.map(deck => {
                    return {
                        name: deck.name,
                        _id: deck._id
                    }
                })
                res.send(data);
            });
    });
}