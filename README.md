# EnvironmentalDixit

## Table of Contents
[Description](#description)

[Installation](#installation)

[Usage](#usage)

[Testing](#testing)

[Credits](#credits)

## Description
This repository contains the code for a server implementation of the online game dixit. The game is 3-6 players and features will be added soon to allow users to upload there own decks.

## Installation
Download the respository. In directory run npm install.

setup .env file

NAME=[deck admin username]

PASSWORD=[Password]

API_KEY=[flickr api key]

https://www.flickr.com/services/api/

## Usage
After installation run node server.js or npm run start. Then navigate to the port the server is looking at. The first player that connects creates the lobby, which generates a roomcode. All subsequent players connect to the room code. 

Deployed to https://peaceful-dusk-06372.herokuapp.com/ for test usage.

## Testing

run the test script in the json package. npm run test.
This tests specifically the Game.js object and how it handles game calls.

## Credits
Code By Andrew Ehrman.

### Components Used
Node

npm packages
jest
nodemon

inquirer
mongoose
express
