
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { Chess } = require("chess.js");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.json());
app.use(express.static("public"));

app.get("/api/status", (req, res) => {
  res.json({
    name: "SCHOOL ARENA",
    status: "online",
    games: ["chess", "checkers", "tic-tac-toe"]
  });
});

const games = {};

io.on("connection", socket => {
  socket.on("createGame", ({ gameId }) => {
    if (!gameId || games[gameId]) return;

    games[gameId] = {
      chess: new Chess(),
      players: [socket.id]
    };

    socket.join(gameId);
    socket.emit("gameCreated", { gameId });
  });

  socket.on("joinGame", ({ gameId }) => {
    const game = games[gameId];
    if (!game || game.players.length >= 2) return;

    if (!game.players.includes(socket.id)) {
      game.players.push(socket.id);
    }

    socket.join(gameId);
    socket.emit("gameJoined", {
      fen: game.chess.fen(),
      turn: game.chess.turn()
    });
  });

  socket.on("makeMove", ({ gameId, move }) => {
    const game = games[gameId];
    if (!game || !game.players.includes(socket.id)) return;

    try {
      const result = game.chess.move(move);
      if (!result) return;

      io.to(gameId).emit("boardUpdate", {
        fen: game.chess.fen(),
        move: result.san,
        turn: game.chess.turn(),
        over: game.chess.isGameOver()
      });
    } catch (error) {
      socket.emit("moveError", "Noto‘g‘ri yurish");
    }
  });

  socket.on("disconnect", () => {
    for (const id in games) {
      games[id].players =
        games[id].players.filter(p => p !== socket.id);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("SCHOOL ARENA server running on " + PORT);
});
