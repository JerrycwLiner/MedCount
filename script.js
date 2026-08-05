const form = document.querySelector("#cost-form");
const costInput = document.querySelector("#cost");
const message = document.querySelector("#message");
const clearButton = document.querySelector("#clear-button");

clearButton.addEventListener("click", () => {
  costInput.value = "";
  message.textContent = "";
  message.classList.remove("error");
  costInput.focus();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const lines = costInput.value
    .split(/\r?\n/)
    .map((line) => line.replace(/[\u200B-\u200D\uFEFF]/g, "").trim());
  const results = [];
  let sectionStart = "";

  lines.forEach((line, index) => {
    if (!sectionStart && line) {
      sectionStart = line;
    }

    if (/單價\s*[:：]/.test(line)) {
      let previousValue = "";

      for (let previousIndex = index - 1; previousIndex >= 0; previousIndex -= 1) {
        if (lines[previousIndex]) {
          previousValue = lines[previousIndex];
          break;
        }
      }

      if (sectionStart && previousValue) {
        results.push({ name: sectionStart, value: previousValue });
      }

      sectionStart = "";
    }
  });

  message.replaceChildren();

  if (results.length === 0) {
    message.textContent = "找不到可擷取的資料，請確認內容包含「單價:」。";
    message.classList.add("error");
    costInput.focus();
    return;
  }

  const title = document.createElement("strong");
  title.textContent = "擷取結果(再次確認劑量)";
  const list = document.createElement("ol");
  list.className = "result-list";

  results.forEach((result) => {
    const item = document.createElement("li");
    const name = document.createElement("span");
    name.className = "result-name";
    name.textContent = result.name;
    item.append(name, document.createTextNode(` $：${result.value}`));
    list.append(item);
  });

  const total = results.reduce((sum, result) => {
    const numericValue = Number(result.value.replace(/[$,，\s]/g, ""));
    return Number.isFinite(numericValue) ? sum + numericValue : sum;
  }, 0);
  const totalLine = document.createElement("p");
  totalLine.className = "result-total";
  totalLine.textContent = `費用原總額：${total.toLocaleString("zh-TW", {
    maximumFractionDigits: 10
  })}`;

  message.append(title, list, totalLine);
  message.classList.remove("error");
});
