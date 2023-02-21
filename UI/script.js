import { Init } from "./auth.js";
// import { Card } from "./card.js";

const myLists = document.getElementById("myLists");
const allCards = document.getElementById("allCards");
const head = document.getElementById("head");

Init();
const cards = [];
let genWord = null;
let currentCard = null;

const loadCards = (event) => {
  const listId = event.target.getAttribute("listid");
  fetch(`http://localhost:3000/api/lists/${listId}/words`, {
    method: "GET",
    headers: {
      Authorization: localStorage.token,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error !== undefined) {
        alert(data.error);
        return;
      }
      cards.push(...data.Words);
      cards.forEach((element) => {
        element.flipped = false;
      });
      genWord = cardSwitcher(cards);
      getCard();
      showCard();
    })
    .catch((error) => console.log(error));
};

const getCard = () => {
  let a = genWord.next();
  if (!a.done) {
    currentCard = a.value;
  } else {
    currentCard = null;
  }
};

const showCard = () => {
  if (currentCard === null) {
    allCards.innerHTML = "";
    return;
  }
  if (!currentCard.flipped) {
    allCards.innerHTML = currentCard.word;
  } else {
    allCards.innerHTML = currentCard.meaning;
  }
  currentCard.flipped = !currentCard.flipped;
};

const nextCard = () => {
  getCard();
  showCard();
};

function* cardSwitcher(arr) {
  for (let i = 0; i < arr.length; i++) {
    yield arr[i];
  }
}

const showMyLists = (lists) => {
  let liLists = "";
  lists.forEach((element) => {
    liLists += `
    <div class="accordion accordion-flush" id="accordionFlushExample_${element.id}">
      <div class="accordion-item ">
        <h2 class="accordion-header " id="flush-headingOne ">
        <button class="accordion-button collapsed bg-success bg-opacity-10 fs-5 fw-semibold" type="button"  data-bs-target="#flush-collapseOne_${element.id}"    aria-controls="flush-collapseOne_${element.id}" listid="${element.id}">
        ${element.name}
        </button>
        </h2>
      <div id="flush-collapseOne_${element.id}" class="accordion-collapse collapse" aria-labelledby="flush-headingOne" data-bs-parent="#accordionFlushExample_${element.id}">
      <div class="accordion-body">Placeholder <br>content <br>for this <br>accordion, <br>which is <br>intended </div>
    </div>
  </div>
  </div>`;
  });
  myLists.innerHTML = liLists;
};

const renderLists = () => {
  fetch("http://localhost:3000/api/lists", {
    method: "GET",
    headers: {
      Authorization: localStorage.token,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error !== undefined) {
        alert(data.error);
      }
      showMyLists(data.Lists);
    })
    .catch((error) => console.log(error));
};

renderLists();

myLists.addEventListener("click", loadCards);
allCards.addEventListener("click", showCard);
head.addEventListener("click", nextCard);
myLists.addEventListener("mouseover", (event) => {
  const target = event.target.parentElement.nextElementSibling;
  if (!target) return;
  target.classList.add("show");
});
myLists.addEventListener("mouseout", (event) => {
  const target = event.target.parentElement.nextElementSibling;
  if (!target) return;
  target.classList.remove("show");
});
