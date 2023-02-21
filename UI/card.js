export class Card {
  constructor(word) {
    this.Word = word;
    this.hide = true;
  }
  flip() {
    this.hide = !this.hide;
    return this.get();
  }
  get() {
    return `<p>${
      this.hide ? this.Word.word : this.Word.word + "<br>" + this.Word.meaning
    }</p>`;
  }
}
