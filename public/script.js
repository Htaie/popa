const swiper = document.querySelector("#swiper");
const like = document.querySelector("#like");
const dislike = document.querySelector("#dislike");

const user = {
 likedAnime: [],
};
const serializedData = JSON.stringify(user);

const likeButton = document.getElementById('like-button');
const dislikeButton = document.getElementById('dislike-button');

fetch("https://api.jikan.moe/v4/top/anime")
 .then((response) => {
  if (!response.ok) {
   throw new Error("Network response was not ok");
  }
  return response.json();
 })
 .then((data) => {
  const dataDisplay = data.data.map((elem) => {
   return {
    id: elem.mal_id,
    image: elem.images.jpg.large_image_url,
    name: elem.title,
   };
  });

  if (likeButton) {
    likeButton.addEventListener('click', () => {
      const { animeId, imageUrl, name } = getRandomImageData();
      user.likedAnime.push({ id: animeId, image: imageUrl, name: name });
      socket.emit('sendArray', user);
      swiper.querySelector('.my-card:not(.dismissing)').classList.add('like-swipe');
    });
  }
  
  if (dislikeButton) {
    dislikeButton.addEventListener('click', () => {
      console.log('button dislike');
      swiper.querySelector('.my-card:not(.dismissing)').classList.add('dislike-swipe');
    });
  }

  function getRandomImageData() {
   const randomIndex = Math.floor(Math.random() * dataDisplay.length);
   const randomImage = dataDisplay[randomIndex];
   return {
    imageUrl: randomImage.image,
    animeId: randomImage.id,
    name: randomImage.name,
   };
  }
  appendNewCard();

  function appendNewCard() {
   const { animeId, imageUrl, name } = getRandomImageData();
   const myCard = new ACard({
    imageUrl: imageUrl,
    onDismiss: appendNewCard,
    onLike: () => {
     like.style.animationPlayState = "running";
     like.classList.toggle("trigger");
     user.likedAnime.push({ id: animeId, image: imageUrl, name: name });
     socket.emit("sendArray", user);
    },
    onDislike: () => {
     dislike.style.animationPlayState = "running";
     dislike.classList.toggle("trigger");
    },
   });
   swiper.append(myCard.element);
   const myCards = swiper.querySelectorAll(".my-card:not(.dismissing)");
   myCards.forEach((myCard, index) => {
    myCard.style.setProperty("--i", index);
   });
  }

  for (let i = 0; i < 4; i++) {
    appendNewCard();
  }
 })
 .catch((error) => {
  console.error("Fetch error:", error);
 });
