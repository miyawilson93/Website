(function () {
  var CART_KEY = "movewise_cart";

  function readCart() {
    try {
      var parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (_err) {
      return [];
    }
  }

  function renderCheckout() {
    var items = readCart();
    var list = document.querySelector("[data-checkout-list]");
    var totalEl = document.querySelector("[data-checkout-total]");
    if (!list || !totalEl) {
      return;
    }

    if (items.length === 0) {
      list.innerHTML = "<li>Your cart is empty. Add items from Agent Coaching or Agent Resources.</li>";
      totalEl.textContent = "0.00";
      return;
    }

    var total = 0;
    list.innerHTML = "";

    items.forEach(function (item) {
      var price = Number(item.price || 0);
      total += price;
      var li = document.createElement("li");
      li.className = "checkout-item";
      li.innerHTML = "<span>" + (item.name || "Item") + "</span><strong>$" + price.toFixed(2) + "</strong>";
      list.appendChild(li);
    });

    totalEl.textContent = total.toFixed(2);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderCheckout);
  } else {
    renderCheckout();
  }
})();
