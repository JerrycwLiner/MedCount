const form = document.querySelector("#cost-form");
const costInput = document.querySelector("#cost");
const message = document.querySelector("#message");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const value = costInput.value.trim();
  const cost = Number(value);

  if (value === "" || !Number.isFinite(cost) || cost < 0) {
    message.textContent = "請輸入有效且不小於 0 的費用。";
    message.classList.add("error");
    costInput.focus();
    return;
  }

  const formattedCost = new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 2
  }).format(cost);

  message.textContent = `藥品費用：${formattedCost}`;
  message.classList.remove("error");
});
