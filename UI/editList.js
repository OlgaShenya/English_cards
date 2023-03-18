const fragment = `<div class="modal fade " data-bs-backdrop="static" tabindex="-1" id="edit_form" data-bs-keyboard="false" aria-labelledby="staticBackdropLabel"  aria-hidden="true">
<div class="modal-dialog modal-xl">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title fs-2 fw-bold" contenteditable="true" id="listName">"1"</h5>
        <button type="button" class="btn-close btn-outline-success text-dark fs-4 fw-semibold" data-bs-dismiss="modal" aria-label="Close" style="border: 1px solid black"></button>
      </div>
      <div class="modal-body" id="modalBody">
  
      </div>      
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-success text-dark fs-4 fw-semibold" data-bs-dismiss="modal">Close</button>
        <button id="BtnSaveChanges" type="button" class="btn btn-outline-success text-dark fs-4 fw-semibold" data-bs-dismiss="modal">Save changes</button>
      </div>
    </div>
  </div>
</div>`;

const div = document.createElement("div");
div.innerHTML = fragment;
document.body.appendChild(div);

const edit_form = new bootstrap.Modal(document.getElementById("edit_form"));
const modalBody = document.getElementById("modalBody");
const BtnSaveChanges = document.getElementById("BtnSaveChanges");
const listNameNode = document.getElementById("listName");
const newWords = {};

const resetModalBody = () => {
  modalBody.innerHTML = `<span id="addWordBtn" class="bi bi-plus" style="font-size: 40px; -webkit-text-stroke-width: 3px; color: rgb(0, 128, 55);"></span>`;
};
resetModalBody();
const addWordBtn = document.getElementById("addWordBtn");

const createWordNode = (
  id = Date.now(),
  word = "word",
  meaning = "meaning"
) => {
  let listNode = document.createElement("div");
  listNode.id = `${id}`;
  listNode.classList.add("row", "mt-4", "ms-1");
  listNode.innerHTML = `<span removeWordBtn targetRow="${id}" class="bi bi-x-lg col col-1" style="font-size: 20px; -webkit-text-stroke-width: 3px; color: rgb(255, 0, 0);"></span>
  <span class="col col-4 fs-4" contenteditable="true">${word}</span>
  <span class="col col-4 fs-4 text-break text-wrap" contenteditable="true">${meaning}</span>
  <div class="crossout"></div>
  <hr>
  `;
  return listNode;
};

const createWordList = (words) => {
  let list = [];
  resetModalBody();
  words.forEach((element) => {
    let listNode = createWordNode(element.id, element.word, element.meaning);
    list.push(listNode);
  });
  modalBody.prepend(...list);
};

const deleteWord = (target, crossout) => {
  crossout.style.display = "block";
  target.classList.remove("bi-x-lg");
  target.classList.add("bi-reply-fill");
  target.style["-webkit-text-stroke-width"] = "1px";
  let container = target.parentNode;
  newWords[container.id] = {
    word: container.children[1].textContent,
    meaning: container.children[2].textContent,
    state: "deleted",
  };
};

const restoreWord = (target, crossout) => {
  crossout.style.display = "none";
  target.classList.add("bi-x-lg");
  target.classList.remove("bi-reply-fill");
  target.style["-webkit-text-stroke-width"] = "3px";
};

const addWord = (target) => {
  const newWordNode = createWordNode();
  newWordNode.setAttribute("new", "");
  target.before(newWordNode);
};

const saveChanges = () => {
  const newWordsArr = [];
  for (let [key, value] of Object.entries(newWords)) {
    newWordsArr.push({ id: +key, ...value });
  }
  return newWordsArr;
};

export const editList = (listName, words, saveCallback) => {
  listNameNode.textContent = listName;
  function func() {
    BtnSaveChanges.removeEventListener("click", func);
    let resultWordList = saveChanges();
    saveCallback(listNameNode.textContent || listName, resultWordList);
  }
  BtnSaveChanges.addEventListener("click", func);

  for (const prop of Object.getOwnPropertyNames(newWords)) {
    delete newWords[prop];
  }

  createWordList(words);

  edit_form.show();
};

modalBody.addEventListener("focusin", (event) => {
  localStorage.setItem("w", event.target.textContent);
});

modalBody.addEventListener("focusout", (event) => {
  if (event.target.textContent === "") {
    event.target.textContent = localStorage.getItem("w");
    return;
  }
  let container = event.target.parentNode;
  if (container.hasAttribute("new")) {
    newWords[container.id] = {
      word: container.children[1].textContent,
      meaning: container.children[2].textContent,
      state: "created",
    };
  } else {
    newWords[container.id] = {
      word: container.children[1].textContent,
      meaning: container.children[2].textContent,
      state: "updated",
    };
  }
});

modalBody.addEventListener("click", ({ target }) => {
  if (target.hasAttribute("removeWordBtn")) {
    if (target.parentNode.hasAttribute("new")) {
      delete newWords[target.parentNode.id];
      modalBody.removeChild(target.parentNode);
      return;
    }
    const crossout = target.parentNode.getElementsByClassName("crossout")[0];
    const styles = window.getComputedStyle(crossout);
    if (styles.display === "none") {
      deleteWord(target, crossout);
    } else {
      restoreWord(target, crossout);
    }
  } else if (target.id === "addWordBtn") {
    addWord(target);
  }
});
