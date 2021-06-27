# EnvironmentalDixit

## Table of Contents
[Description](#description)

[Installation](#installation)

[Usage](#usage)

[Testing](#testing)

[Credits](#credits)

## Description
This repository contains the code for a server implementation of the online game dixit. The game is for 3-6 players. Players can add their own decks from Flickr alblums.

## Installation
Download or clone the respository.

### _Install Node.js_
1. Get NodeJS from: https://nodejs.org/en/download
2. In respository directory run `npm install`

### _setup .env file:_
1. Create a text file in the same folder as `server.js` and call it ".env" (with the . at the front and no file extension).
2. In that file add theses lines without the brackets (sets up the environment variables for Node):
```
NODE_ENV=[development or production]
API_KEY=[our flicker api key]
NAME=[deck admin username (IE: the MongoDB Server Username)]
PASSWORD=[MongoDB Server Password]
```
_Note: Name & Password aren't needed for development while runing with a local Mongo DB on your machine_

### _For testing with a local database (Only used when NODE_ENV=development):_
1. Install MongoDB: https://docs.mongodb.com/manual/administration/install-community/
2. In a new terminal/cmd prompt run the comands (on windows, file paths use \ instead of / (so use \ in the below cmds):
```
 mkdir data
 mkdir data/db
```

## Usage
After installation, run `npm run dev` in a new terminal/cmd prompt. Then open your browser to the address the server gives you in the terminal (something like http://localhost:5001). The first player that connects creates the lobby, which generates a roomcode. All subsequent players connect to the room code.

Deployed to https://peaceful-dusk-06372.herokuapp.com/ for test usage.

See https://www.flickr.com/services/api/ for flicker API Documentation

## Testing

run the test script in the json package. `npm run test`.
This tests specifically the Game.js object and how it handles game calls.

## Credits

### Contributors
- [Andrew Ehrman](https://github.com/breakfastitem)
- [Kyle](https://github.com/KW-M)

### Components Used
- npm production packages:
  - [node-fetch](https://www.npmjs.com/package/node-fetch)
  - socket.io
  - [mongoose](https://www.npmjs.com/package/mongoose)
  - [express](https://www.npmjs.com/package/express)
- npm development packages:
  - [jest](https://www.npmjs.com/package/jest)
  - [nodemon](https://www.npmjs.com/package/nodemon)
  - [dotenv](https://www.npmjs.com/package/dotenv)
  - [concurrently](https://www.npmjs.com/package/concurrently)
