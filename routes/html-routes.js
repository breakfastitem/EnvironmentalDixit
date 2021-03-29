const path = require("path");
module.exports = function (app) {


    //define the route for "/"
    app.get("/", (request, response) => {
        //show this file when the "/" is requested
        response.sendFile(path.join(__dirname, "../index.html"));
    });
    app.get("/deck", (req, res) => {
        res.sendFile(path.join(__dirname, "../public/html/upload.html"));
    });

}