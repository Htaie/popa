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

 const otherUser = {
    socket: socket,
    nickname: randomNickname,
    likedAnime: [],
 }

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
// расписываю сначала было some но чат гпт сказал что это не совсем правильно его юзать
// потому сказал юзать фор ич , я попробовал найти одинаковые аниме и эта функция мне 
// выдала что аниме совпали если попробовать с двумя разными ониме то напишет после двух 
// лайков от двух юзеров сообщение второго условия это уже что-то как будто!
   otherUser.likedAnime.forEach((anime1) => {
    return user.likedAnime.forEach((anime2) => {
     if (anime1.id === anime2.id) {
      console.log(`Аниме с id ${anime1.id} совпало:`);
      console.log(`Изображение: ${anime1.image}`);
      user.socket.emit("matchingAnime", {
       nickname: user.nickname,
       image: anime1.image,
       name: anime1.name,
      });
      otherUser.socket.emit("matchingAnime", {
        nickname: otherUser.nickname,
        image: anime2.image,
        name: anime2.name,
      })
      isMatchFound = true;

      return true; // Stop iterating further
     };
    
     if (!isMatchFound) {
        console.log("No matching anime found.");
       }
    });
   });
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
