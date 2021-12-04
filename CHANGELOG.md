# Backend:

Rewriting Game Server+Frontend to use Socket.IO instead of HTTP Polling - Means updates can be pushed instantly and so browser game only refreshes when needed, - hopefully will solve some UI Bugs too.

### Implementation:
    1. The clients send socket.io events to the server.
        - "create-new-game"
        - "join-game"
        - "start-game"
        - "submit-clue"
        - "submit-fake"
        - "submit-vote"
        - "new-round"
        - "new-chat-message"
        - *Note: I started using the "update-game-state" event with a func param, but found it was confusing, so am replacing it with the above*

    2. The server applies the state change to the server-side game state / db

    3. Server sends the original client back the new game state changes (Only the data they need) using socketIO's callback funtionality, similar to the original http request - response structure.

    4. The server then sends all other connected sockets within that game their own state update (Only the data they need) with the socket.io event "game-update"

    The server also echos any "new-chat-message" events to all clients with the "broadcast-chat-message" event name.

### Details:
    Each game class instance stores a mapping of SocketIO IDs to the corresponding player index within the game.
    Usage:
        - game.getPlayerIndexFromSocketId(passing a socket id from socket.io)
        - when calling game.addPlayer() make sure to pass that player's socket connection id as the second param.

### TODO:
    - "start-game"
    - "submit-clue"
    - "submit-fake"
    - "submit-vote"
    - "new-round"




# Frontend:

### Oranized the code and user experience into seperate Phases:
- Joining or creating a game.
- Waiting for other players to Join
- Playing Game (could be broken down further)
- New Round

### Made hand cards look more Like a hand of cards you could be holding.
- Meant removing exisiting Bootstrap classes on the hand cards (no more wrapping)
- uses a few js events for on hover(mousein) / not (mouseout)

### TODO:
- Somehow broke "new Round", hoping the switch to SocketIO will fix it.
- Somehow broke the magnifing glass on the vote cards (to view card fullscreen)