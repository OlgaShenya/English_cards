import { authInit, authorize } from "./auth.js";
import { editList } from "./editList.js";
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
const learnAllBtn = document.getElementById("learnAllBtn");
const learnUnsolvedBtn = document.getElementById("learnUnsolvedBtn");
const editListBtn = document.getElementById("editListBtn");
const currentListName = document.getElementById("currentListName");

const lists = [];
const cards = [];
let genWord = null;
let currentCard = null;
let currentListIndex = -1;
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

const startLesson = () => {
  genWord = cardSwitcher(cards);
  getCard();
  showCard();
  solvedCards.innerHTML = "";
  unSolvedCards.innerHTML = "";
  cardsSolvedCount.textContent = "";
  unsolvedCards.splice(0, unsolvedCards.length);
  cardsUnsolvedCount.textContent = "";
};

/**
 * Загрузка слов в карточки из массива слов words
 */
const setCards = (words) => {
  cards.splice(0, cards.length);
  cards.push(...words);
};

/**
 * Загружает объект текущего листа в глобальную переменную currentListIndex
 */
const updateCurrentListIndex = (listId) => {
  currentListIndex = lists.findIndex((item) => {
    return item.id === listId;
  });
};

/**
 * Кладет следующую карточку в currentCard
 * Обновляет счетчик
 */
const getCard = () => {
  let a = genWord.next();
  if (!a.done) {
    currentCard = a.value.card;
    allCardsCount.textContent = a.value.length;
  } else {
    currentCard = null;
    allCardsCount.textContent = "";
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
  for (let i = 0; i < arr.length; i++) {
    yield { card: arr[i], length: arr.length - i };
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
    <button class="accordion-button collapsed bg-success bg-opacity-10 fs-4 fw-semibold" type="button"  data-bs-target="#flush-collapseOne_${listId}"    aria-controls="flush-collapseOne_${listId}" listid="${listId}">
    ${listName}
    </button>
    </h2>
  <div id="flush-collapseOne_${listId}" class="accordion-collapse collapse" aria-labelledby="flush-headingOne" data-bs-parent="#accordionFlushExample_${listId}">
  <div class="accordion-body fs-5">${listWords}</div>
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

      lists.push(...data.Lists);
      showMyLists(lists);
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
  cardsSolvedCount.textContent = "";
  cardsUnsolvedCount.textContent = "";
  allCardsCount.textContent = "";
  unsolvedCards.splice(0, cards.length);
};

const changeListName = async (listId, newName) => {
  return fetch(`http://localhost:3000/api/lists/${listId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      Authorization: localStorage.token,
    },
    body: JSON.stringify({
      name: newName,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error !== undefined) {
        alert(data.error);
        return;
      }
    })
    .catch((error) => console.log(error));
};

const logout = () => {
  localStorage.removeItem("token");
  authorize();
  clearPage();
};

const save = async (newWords) => {
  let removed = newWords.filter((word) => word.removed);
  let updated = newWords.filter((word) => word.updated);
  let created = newWords.filter((word) => word.created);

  await removedSave(removed);
  await updatedSave(updated);
  await createdSave(created);
};

const removedSave = async (words) => {
  for (let i = 0; i < words.length; i++) {
    let response = await fetch(
      `http://localhost:3000/api/lists/${words[i].ListId}/words/${words[i].id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: localStorage.token,
        },
      }
    );
    let body = await response.json();
    if (body.error !== undefined) {
      alert(body.error);
    }
  }
};

const updatedSave = async (words) => {
  for (let i = 0; i < words.length; i++) {
    let response = await fetch(
      `http://localhost:3000/api/lists/${words[i].ListId}/words/${words[i].id}`,
      {
        method: "PUT",
        headers: {
          Authorization: localStorage.token,
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
          wordParams: { word: words[i].word, meaning: words[i].meaning },
        }),
      }
    );

    let body = await response.json();
    if (body.error !== undefined) {
      alert(body.error);
    }
  }
};

const createdSave = async (words) => {
  for (let i = 0; i < words.length; i++) {
    let response = await fetch(
      `http://localhost:3000/api/lists/${words[i].ListId}/words/`,
      {
        method: "POST",
        headers: {
          Authorization: localStorage.token,
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
          word: words[i].word,
          meaning: words[i].meaning,
        }),
      }
    );
    let body = await response.json();
    if (body.error !== undefined) {
      alert(body.error);
    }
  }
};

myLists.addEventListener("click", (event) => {
  let listId = Number(event.target.getAttribute("listid"));
  updateCurrentListIndex(listId);
  currentListName.textContent = lists[currentListIndex].name;
  requestWords(listId).then(setCards).then(startLesson);
});
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
learnAllBtn.addEventListener("click", startLesson);
learnUnsolvedBtn.addEventListener("click", () => {
  setCards(unsolvedCards);
  startLesson();
});
editListBtn.addEventListener("click", () => {
  requestWords(lists[currentListIndex].id).then((words) =>
    editList(lists[currentListIndex], [...words], (newList, newWords) => {
      save(newWords).then(() => {
        requestWords(newList.id).then(setCards).then(startLesson);
      });
      changeListName(newList.id, newList.name).then(() => {
        lists[currentListIndex].name = newList.name;
        currentListName.textContent = newList.name;
        showMyLists(lists);
      });
    })
  );
});
