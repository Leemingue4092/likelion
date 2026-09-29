const list = document.querySelector("#list");
const count = document.querySelector("#count");
const template = document.querySelector("#card");
const cutList = document.querySelector("#cut-list");

let season = "all";
let field = "all";

function seasonLabel(value) {
  return value === "semester" ? "학기 중" : "방학";
}

function render() {
  const items = PROGRAMS.filter((item) => {
    const seasonOk = season === "all" || item.season === season;
    const fieldOk = field === "all" || item.fields.includes(field);
    return seasonOk && fieldOk;
  });

  list.replaceChildren();
  count.textContent = `${items.length}개`;

  for (const item of items) {
    const node = template.content.cloneNode(true);
    const card = node.querySelector(".card");
    card.dataset.season = item.season;
    node.querySelector(".badge").textContent = seasonLabel(item.season);
    node.querySelector(".status").textContent = item.status;
    node.querySelector("h3").textContent = item.name;
    node.querySelector(".summary").textContent = item.summary;
    node.querySelector(".time").textContent = item.time;
    node.querySelector(".pay").textContent = item.pay;
    node.querySelector(".who").textContent = item.who;
    node.querySelector(".note").textContent = item.note;

    const tags = node.querySelector(".tags");
    for (const key of item.fields) {
      const tag = document.createElement("span");
      tag.textContent = FIELD_LABEL[key];
      tags.append(tag);
    }

    const link = node.querySelector(".go");
    link.href = item.href;
    link.textContent = item.hrefLabel;

    if (item.extra) {
      const more = document.createElement("div");
      more.className = "extra";
      for (const [label, href] of item.extra) {
        const anchor = document.createElement("a");
        anchor.href = href;
        anchor.target = "_blank";
        anchor.rel = "noopener";
        anchor.textContent = label;
        more.append(anchor);
      }
      card.append(more);
    }

    list.append(node);
  }
}

function setPressed(buttons, selected) {
  for (const button of buttons) {
    button.classList.toggle("is-on", button === selected);
  }
}

document.querySelectorAll(".season").forEach((button) => {
  button.addEventListener("click", () => {
    season = button.dataset.season;
    setPressed(document.querySelectorAll(".season"), button);
    render();
  });
});

document.querySelectorAll(".field").forEach((button) => {
  button.addEventListener("click", () => {
    field = button.dataset.field;
    setPressed(document.querySelectorAll(".field"), button);
    render();
  });
});

for (const item of CUT) {
  const li = document.createElement("li");
  const strong = document.createElement("strong");
  strong.textContent = item.name;
  li.append(strong);
  li.append(document.createTextNode(` ${item.why}`));
  cutList.append(li);
}

render();
