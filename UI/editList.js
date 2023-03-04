const fragment = `<div class="modal fade " data-bs-backdrop="static" tabindex="-1" id="edit_form" data-bs-keyboard="false" aria-labelledby="staticBackdropLabel"  aria-hidden="true">

</div>`;

const div = document.createElement("div");
div.innerHTML = fragment;
document.body.appendChild(div);

const edit_form = new bootstrap.Modal(document.getElementById("edit_form"));

export const editList = (list, words, save) => {
  // edit_form.show();
  list.name = "rrrrrrr";

  for (let i = 0; i < 20; i++) {
    words.push({
      word: i,
      meaning: i,
      ListId: list.id,
      created: true,
    });
  }

  words[0].removed = true;
  words[2].removed = true;
  console.log(words);
  words[1].word = "2222";
  words[1].updated = true;
  words.push({
    word: "Mew",
    meaning: "мяу",
    ListId: list.id,
    created: true,
  });
  words.forEach((element) => {
    delete element.studied;
  });
  save(list, words);
};
