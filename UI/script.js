import { authInit, authorize } from "./auth.js";
// import { Card } from "./card.js";

const myLists = document.getElementById("myLists");
const allCards = document.getElementById("allCards");
const frontCard = document.getElementById("frontCard");
const backCard = document.getElementById("backCard");
const card = document.getElementById("card");
const solvedCards = document.getElementById("solvedCards");
const unSolvedCards = document.getElementById("unSolvedCards");
const userName = document.getElementById("userName");
const logoutBtn = document.getElementById("logoutBtn");
const allCardsCount = document.getElementById("allCardsCount");
const cardsSolvedCount = document.getElementById("cardsSolvedCount");
const cardsUnsolvedCount = document.getElementById("cardsUnsolvedCount");

const cards = [];
let genWord = null;
let currentCard = null;
const unsolvedCards = [];

const requestWords = async (listId) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/lists/${listId}/words`,
      {
        method: "GET",
        headers: {
          Authorization: localStorage.token,
        },
      }
    );
    const body = await response.json();
    if (body.error !== undefined) {
      alert(data.error);
    }
    return body.Words;
  } catch (error) {
    console.log(error);
  }
};
const loadCards = (event) => {
  const listId = event.target.getAttribute("listid");
  requestWords(listId).then((words) => {
    cards.splice(0, cards.length);
    cards.push(...words);
    genWord = cardSwitcher(cards);
    getCard();
    showCard();
    solvedCards.innerHTML = "";
    unSolvedCards.innerHTML = "";
    cardsSolvedCount.textContent = "";
    unsolvedCards.splice(0, unsolvedCards.length);
    cardsUnsolvedCount.textContent = "";
  });
};

const getCard = () => {
  allCardsCount.textContent = cards.length;
  let a = genWord.next();
  if (!a.done) {
    currentCard = a.value;
  } else {
    currentCard = null;
  }
};

const showCard = () => {
  if (!currentCard) {
    card.classList.add("d-none");
    frontCard.innerHTML = "";
    backCard.innerHTML = "";
    return;
  }
  card.classList.remove("d-none");
  frontCard.innerHTML = currentCard.word;
  backCard.innerHTML = currentCard.meaning;
};

const nextCard = () => {
  getCard();
  showCard();
};

function* cardSwitcher(arr) {
  for (let card = cards.pop(); card; card = cards.pop()) {
    yield card;
  }
}

const createListNode = async (listId, listName) => {
  let listWords = "";
  let words = await requestWords(listId);

  words.forEach((word) => {
    listWords += `${word.word}<br>`;
  });
  return `
<div class="accordion accordion-flush" id="accordionFlushExample_${listId}">
  <div class="accordion-item ">
    <h2 class="accordion-header " id="flush-headingOne ">
    <button class="accordion-button collapsed bg-success bg-opacity-10 fs-5 fw-semibold" type="button"  data-bs-target="#flush-collapseOne_${listId}"    aria-controls="flush-collapseOne_${listId}" listid="${listId}">
    ${listName}
    </button>
    </h2>
  <div id="flush-collapseOne_${listId}" class="accordion-collapse collapse" aria-labelledby="flush-headingOne" data-bs-parent="#accordionFlushExample_${listId}">
  <div class="accordion-body">${listWords}</div>
</div>
</div>
</div>`;
};

const showMyLists = async (lists) => {
  let liLists = "";
  for (let i = 0; i < lists.length; i++) {
    let listNode = await createListNode(lists[i].id, lists[i].name);
    liLists += listNode;
  }

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
        return;
      }
      showMyLists(data.Lists);
    })
    .catch((error) => console.log(error));
};

const doAfterLoad = () => {
  renderLists();
  userName.textContent = localStorage.getItem("userName");
};

authInit(doAfterLoad);

const allowDrop = (event) => {
  event.preventDefault();
};

const drag = (event) => {
  event.dataTransfer.setData("id", event.target.id);
  event.target.classList.remove("is-flipped");
};

const drop = (event) => {
  let itemId = event.dataTransfer.getData("id");
  let target = event.target;
  while (target !== solvedCards && target !== unSolvedCards) {
    target = target.parentElement;
  }
  target.innerHTML = "";
  let clonedCard = document.getElementById(itemId).cloneNode(true);
  clonedCard.classList.remove("is-flipped");
  clonedCard.removeAttribute("draggable");
  clonedCard.removeAttribute("id");
  target.append(clonedCard);

  if (target === solvedCards) {
    let a = +cardsSolvedCount.textContent;
    cardsSolvedCount.textContent = 1 + a;
  } else {
    unsolvedCards.push(currentCard);
    cardsUnsolvedCount.textContent = unsolvedCards.length;
  }
  nextCard();
};

solvedCards.ondragover = allowDrop;
unSolvedCards.ondragover = allowDrop;
card.ondragstart = drag;
solvedCards.ondrop = drop;
unSolvedCards.ondrop = drop;

const clearPage = () => {
  myLists.innerHTML = "";
  userName.textContent = "";
  frontCard.innerHTML = "";
  backCard.innerHTML = "";
  unSolvedCards.innerHTML = "";
  solvedCards.innerHTML = "";
  card.classList.add("d-none");
  cards.splice(0, cards.length);
  currentCard = null;
};

const logout = () => {
  localStorage.removeItem("token");
  authorize();
  clearPage();
};

myLists.addEventListener("click", loadCards);
allCards.addEventListener("click", () => {
  showCard();
  if (currentCard) card.classList.toggle("is-flipped");
});
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
logoutBtn.addEventListener("click", logout);
