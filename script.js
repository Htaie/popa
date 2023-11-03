// DOM
const swiper = document.querySelector('#swiper');
const like = document.querySelector('#like');
const dislike = document.querySelector('#dislike');

const dataDisplay= [{}]

fetch('https://api.jikan.moe/v4/top/anime')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    // Обработка полученных данных
    data.data.map(elem => {
      dataDisplay.push({id: elem.mal_id, image: elem.images.jpg.image_url})
    })

    for (let i = 0; i < 5; i++) {
      appendNewCard();
    }
  })
  .catch(error => {
    // Обработка ошибки
    console.error('Fetch error:', error);
  });


// variables
let cardCount = 0;

const user = [{}]

function getRandomImageData() {
  const randomIndex = Math.floor(Math.random() * dataDisplay.length);
  const randomImage = dataDisplay[randomIndex];
  return { imageUrl: randomImage.image, animeId: randomImage.id };
}
// functions
function appendNewCard() {
  const { animeId , imageUrl } = getRandomImageData()
  
  const card = new Card({
    imageUrl: imageUrl,

    onDismiss: appendNewCard,
    onLike: () => {
      like.style.animationPlayState = 'running';
      like.classList.toggle('trigger');
      user.push({ id: animeId, image: imageUrl, liked: true });
    },
    onDislike: () => {
      dislike.style.animationPlayState = 'running';
      dislike.classList.toggle('trigger');
      user.push({ id: animeId, image: imageUrl, liked: false });

    }
  });
  swiper.append(card.element);
  cardCount++;

  console.log(user)
  const cards = swiper.querySelectorAll('.card:not(.dismissing)');
  cards.forEach((card, index) => {
    card.style.setProperty('--i', index);
  });
}




