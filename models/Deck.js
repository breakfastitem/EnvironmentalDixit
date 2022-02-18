const mongoose= require("mongoose");
const Schema = mongoose.Schema;

const deckSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    cardUrls: {
        type: [String],
        required: true
    },
    cardInfoArray: {
        type: [{ title: String, description: String }],
        required: false
    }
});

const deckModel = mongoose.model("Deck", deckSchema)

module.exports= deckModel;