const swiper = document.querySelector("#swiper");
const like = document.querySelector("#like");
const dislike = document.querySelector("#dislike");

const user = {
 likedAnime: [],
};
const serializedData = JSON.stringify(user);

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
  appendNewCard();

  function getRandomImageData() {
   const randomIndex = Math.floor(Math.random() * dataDisplay.length);
   const randomImage = dataDisplay[randomIndex];
   return {
    imageUrl: randomImage.image,
    animeId: randomImage.id,
    name: randomImage.name,
   };
  }
  function appendNewCard() {
   const { animeId, imageUrl, name } = getRandomImageData();
   const card = new Card({
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
   swiper.append(card.element);
   const cards = swiper.querySelectorAll(".card:not(.dismissing)");
   cards.forEach((card, index) => {
    card.style.setProperty("--i", index);
   });
  }
 })
 .catch((error) => {
  console.error("Fetch error:", error);
 });
