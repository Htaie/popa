const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = process.env.PORT || 8080;

app.use(express.static("public"));

app.get("/", (req, res) => {
 res.sendFile(__dirname + "/templates/index.html");
});

const connectedUsers = {};

io.on("connection", (socket) => {
 console.log("Пользователь подключился");

 const randomNickname = generateRandomNickname();

 const user = {
  socket: socket,
  nickname: randomNickname,
  likedAnime: [],
 };

 connectedUsers[socket.id] = user;

 const usernames = Object.values(connectedUsers).map((u) => u.nickname);
 io.emit("userList", usernames);

 socket.on("sendArray", (serializedData) => {
  connectedUsers[socket.id].likedAnime = serializedData.likedAnime;

  compareLikedAnime(connectedUsers[socket.id].likedAnime);
 });

 socket.on("disconnect", () => {
  delete connectedUsers[socket.id];

  const usernames = Object.values(connectedUsers).map((u) => u.nickname);
  io.emit("userList", usernames);
 });


 function compareLikedAnime(data) {
  Object.values(connectedUsers).forEach((otherUser) => {
   let isMatchFound = false;

//    otherUser.likedAnime.some((anime1) => {
//     return user.likedAnime.some((anime2) => {
//      if (anime1.id === anime2.id) {
//       console.log(`Аниме с id ${user.nickname} совпало:`);
//       console.log(`Изображение: ${anime1.image}`);
//       user.socket.emit("matchingAnime", {
//        nickname: user.nickname,
//        image: anime1.image,
//        name: anime1.name,
//       });
//       isMatchFound = true;

//       return true; // Stop iterating further
//      }
//     });
//    });

   if (!isMatchFound) {
    console.log("No matching anime found.");
   }
  });
 }
});

server.listen(port, () => {
 console.log("Listening app at http://localhost:" + port);
});

function generateRandomNickname() {
 const adjectives = ["Happy", "Silly", "Clever", "Funny", "Adventurous"];
 const nouns = ["Cat", "Dog", "Penguin", "Elephant", "Lion"];

 const randomAdjective =
  adjectives[Math.floor(Math.random() * adjectives.length)];
 const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

 return randomAdjective + randomNoun;
}
