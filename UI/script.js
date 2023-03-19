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
const createListBtn = document.getElementById("createListBtn");
const contexMenu = document.getElementById("contexMenu");

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
  getCard(); // взять(выложить) первую карту
  showCard(); // рисует слова на карточке (HTML)
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
 *  Сохраняет индекс текущего листа в глобальную переменную currentListIndex
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
  // имя функции не отражает ее назначения
  if (!currentCard) {
    card.classList.add("d-none");
    frontCard.innerHTML = ""; // innerHTML должен применяться только для передачи HTML кода
    backCard.innerHTML = ""; // для текста только textContent
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
  <div class="listitem">
  <div
    class="bg-success bg-opacity-10 fs-4 fw-semibold"
    listid="${listId}"
  >
    ${listName}
  </div>
  <div class="wordlist">${listWords}</div>
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

const renderLists = async () => {
  return fetch("http://localhost:3000/api/lists", {
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
  lists.splice(0, lists.length);
  currentListName.textContent = "";
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
  clearPage();
  authorize();
};

const save = async (newWords, newList) => {
  let editedListId = lists[currentListIndex].id;
  const promises = newWords.map((word) => {
    if (word.state === "deleted") {
      return deletedSave(lists[currentListIndex].id, word);
    }
    if (word.state === "updated") {
      return updatedSave(lists[currentListIndex].id, word);
    }
    if (word.state === "created") {
      return createdSave(lists[currentListIndex].id, word);
    }
  });

  promises.push(changeListName(lists[currentListIndex].id, newList));

  Promise.all(promises)
    .then(() => {
      clearPage();
      renderLists() // запрос листов и отображение их; для каждого листа запрос слов и отображение их
        .then(() => {
          requestWords(editedListId) // запрос слов для редактируемого листа
            .then(setCards) // выгрузка слов в массив cards
            .then(startLesson)
            .then(() => {
              updateCurrentListIndex(editedListId);
              currentListName.textContent = newList;
            });
        });
    })
    .catch((error) => alert(error));
};

const saveNewList = (newList, newWords) => {
  fetch(`http://localhost:3000/api/lists`, {
    method: "POST",
    headers: {
      Authorization: localStorage.token,
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({ name: newList }),
  })
    .then((response) => response.json())
    .then((body) => {
      if (body.error !== undefined) {
        alert(body.error);
      }
      const newListId = body.listId;
      return newListId;
    })
    .then((newListId) => {
      const promises = newWords.map((word) => {
        return createdSave(newListId, word);
      });
      Promise.all(promises).then(() => {
        clearPage();
        renderLists();
      });
    });
};

const deletedSave = async (listId, word) => {
  return fetch(`http://localhost:3000/api/lists/${listId}/words/${word.id}`, {
    method: "DELETE",
    headers: {
      Authorization: localStorage.token,
    },
  })
    .then((response) => response.json())
    .then((body) => {
      if (body.error !== undefined) {
        alert(body.error);
      }
    });
};

const updatedSave = async (listId, word) => {
  return fetch(`http://localhost:3000/api/lists/${listId}/words/${word.id}`, {
    method: "PUT",
    headers: {
      Authorization: localStorage.token,
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({
      wordParams: { word: word.word, meaning: word.meaning },
    }),
  })
    .then((response) => response.json())
    .then((body) => {
      if (body.error !== undefined) {
        alert(body.error);
      }
    });
};

const createdSave = async (listId, word) => {
  return fetch(`http://localhost:3000/api/lists/${listId}/words/`, {
    method: "POST",
    headers: {
      Authorization: localStorage.token,
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({
      word: word.word,
      meaning: word.meaning,
      studied: false,
    }),
  })
    .then((response) => response.json())
    .then((body) => {
      if (body.error !== undefined) {
        alert(body.error);
      }
    });
};

const deleteList = async (listId) => {
  return fetch(`http://localhost:3000/api/lists/${listId}`, {
    method: "DELETE",
    headers: {
      Authorization: localStorage.token,
    },
  })
    .then((response) => response.json())
    .then((body) => {
      if (body.error !== undefined) {
        alert(body.error);
      }
    });
};

myLists.addEventListener("click", (event) => {
  if (event.target.hasAttribute("listid")) {
    frontCard.textContent = "";
    backCard.textContent = "";
    card.style.transition = "0s";
    card.classList.remove("is-flipped");

    let listId = Number(event.target.getAttribute("listid"));
    updateCurrentListIndex(listId);
    currentListName.textContent = lists[currentListIndex].name;
    requestWords(listId)
      .then(setCards)
      .then(startLesson)
      .then(() => {
        card.removeAttribute("style");
      });
  }
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
  if (currentListIndex !== -1) {
    requestWords(lists[currentListIndex].id).then((words) => {
      editList(lists[currentListIndex].name, words, (newList, newWords) => {
        let previousListName = lists[currentListIndex].name;
        if (newWords.length || newList !== previousListName) {
          save(newWords, newList);
        }
      });
    });
  }
});

createListBtn.addEventListener("click", () => {
  editList("New List", [], (newList, newWords) => {
    saveNewList(newList, newWords);
  });
});

myLists.addEventListener("contextmenu", (event) => {
  contexMenu.style.top = `${event.clientY}px`;
  contexMenu.style.left = `${event.clientX}px`;
  contexMenu.style.display = "block";
  event.preventDefault();
  // console.log(event.target);
  contexMenu.setAttribute("listid", event.target.getAttribute("listid"));
});

contexMenu.addEventListener("click", (event) => {
  contexMenu.style.display = "none";
  // console.log(event.target.getAttribute("listid"));
  deleteList(event.target.getAttribute("listid")).then(() => {
    clearPage();
    renderLists();
  });
});

document.addEventListener("click", () => {
  contexMenu.style.display = "none";
});
