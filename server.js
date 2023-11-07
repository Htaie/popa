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
   updateUsersList();
 
   socket.on("sendArray", (serializedData) => {
     connectedUsers[socket.id].likedAnime = serializedData.likedAnime;
     compareLikedAnime(connectedUsers[socket.id]); // Передаем объект пользователя
   });
 
   socket.on("disconnect", () => {
     console.log(`Пользователь ${connectedUsers[socket.id].nickname} отключился`);
     delete connectedUsers[socket.id];
     updateUsersList();
   });
 
   function compareLikedAnime(currentUser) {
      Object.values(connectedUsers).forEach((otherUser) => {
        if (otherUser.socket.id === currentUser.socket.id) {
          // Пропускаем сравнение пользователя с самим собой
          return;
        }
    
        // Ищем первое совпадение в likedAnime
        const match = currentUser.likedAnime.find(anime1 =>
          otherUser.likedAnime.some(anime2 => anime1.id === anime2.id)
        );
    
        if (match) {
          // Нашли совпадение, отправляем уведомление обоим пользователям
          console.log(`Аниме с id ${match.id} совпало:`);
          currentUser.socket.emit("matchingAnime", {
            nickname: otherUser.nickname,
            image: match.image,
            name: match.name,
          });
          otherUser.socket.emit("matchingAnime", {
            nickname: currentUser.nickname,
            image: match.image,
            name: match.name,
          });
        } else {
          console.log(`Совпадений аниме для пользователей ${currentUser.nickname} и ${otherUser.nickname} не найдено.`);
        }
      });
    }
 
   function updateUsersList() {
     const usernames = Object.values(connectedUsers).map((u) => u.nickname);
     io.emit("userList", usernames);
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
