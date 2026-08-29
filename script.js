const form = document.querySelector("#cost-form");
const costInput = document.querySelector("#cost");
const message = document.querySelector("#message");
const clearButton = document.querySelector("#clear-button");
const calculateButton = document.querySelector("#calculate-button");
const confirmationCheckboxes = Array.from(
  document.querySelectorAll(".confirmation-option input")
);

const updateCalculateButton = () => {
  calculateButton.disabled = !confirmationCheckboxes.every(
    (checkbox) => checkbox.checked
  );
};

confirmationCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", updateCalculateButton);
});

clearButton.addEventListener("click", () => {
  costInput.value = "";
  confirmationCheckboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
  updateCalculateButton();
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
  title.textContent = "擷取結果(務必再次確認劑量)";
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
  const adjustedTotal = Math.ceil((total * 1.08) / 10) * 10;
  const totals = document.createElement("div");
  totals.className = "result-totals";
  const originalTotalLine = document.createElement("p");
  originalTotalLine.textContent = `費用原總額：${total.toLocaleString("zh-TW", {
    maximumFractionDigits: 10
  })}`;
  const adjustedTotalLine = document.createElement("p");
  adjustedTotalLine.className = "adjusted-total";
  const adjustedTotalLabel = document.createElement("span");
  adjustedTotalLabel.className = "tooltip-trigger";
  adjustedTotalLabel.tabIndex = 0;
  adjustedTotalLabel.setAttribute("aria-describedby", "adjusted-total-tooltip");
  adjustedTotalLabel.textContent = "規則後總額";
  const tooltip = document.createElement("span");
  tooltip.id = "adjusted-total-tooltip";
  tooltip.className = "tooltip";
  tooltip.setAttribute("role", "tooltip");
  tooltip.textContent = `規則：
1. 總額x1.08後無條件十進位
2. 「沒有」超過口服藥內建費用者，至少需以「內建」費用key價、或視情況上調費用
3. 「有」超過內建費用者，則至少需以「計算後」的價格key價、或視情況上調費用
4. 若為「回診拿藥」或「拿以前的藥」的病患，舊制藥費若高於新制藥費，則以「價高者」計算`;
  adjustedTotalLine.append(
    adjustedTotalLabel,
    document.createTextNode(`：${adjustedTotal.toLocaleString("zh-TW")}`),
    tooltip
  );
  totals.append(originalTotalLine, adjustedTotalLine);

  message.append(title, list, totals);
  message.classList.remove("error");
});
