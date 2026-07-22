(function () {
  var CART_KEY = "movewise_cart";
  var statusMessage = "";

  function readCart() {
    try {
      var parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (_err) {
      return [];
    }
  }

  function writeCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }

  function aggregateItems(items) {
    var grouped = {};

    items.forEach(function (item) {
      var name = (item && item.name) || "Item";
      var price = Number((item && item.price) || 0);
      var key = name + "::" + price.toFixed(2);
      if (!grouped[key]) {
        grouped[key] = { name: name, price: price, quantity: 0 };
      }
      grouped[key].quantity += 1;
    });

    return Object.keys(grouped).map(function (key) {
      return grouped[key];
    });
  }

  function renderCheckout() {
    var items = readCart();
    var groupedItems = aggregateItems(items);
    var list = document.querySelector("[data-checkout-list]");
    var totalEl = document.querySelector("[data-checkout-total]");
    var statusEl = document.querySelector("[data-checkout-status]");
    if (!list || !totalEl) {
      return;
    }

    if (statusEl) {
      statusEl.textContent = statusMessage;
    }

    if (groupedItems.length === 0) {
      list.innerHTML = "<li>Your cart is empty. Add items from Agent Coaching or Agent Resources.</li>";
      totalEl.textContent = "0.00";
      return;
    }

    var total = 0;
    list.innerHTML = "";

    groupedItems.forEach(function (item) {
      var price = Number(item.price || 0);
      var quantity = Number(item.quantity || 1);
      total += price * quantity;
      var li = document.createElement("li");
      li.className = "checkout-item";
      li.innerHTML = "<span>" + (item.name || "Item") + (quantity > 1 ? " (x" + quantity + ")" : "") + "</span><strong>$" + (price * quantity).toFixed(2) + "</strong>";
      list.appendChild(li);
    });

    totalEl.textContent = total.toFixed(2);
  }

  function updateStatusFromQuery() {
    var params = new URLSearchParams(window.location.search);
    var status = params.get("status");
    if (status === "success") {
      writeCart([]);
      statusMessage = "Payment complete. Thank you. A receipt will be sent by Stripe.";
    } else if (status === "cancelled") {
      statusMessage = "Checkout cancelled. Your cart is still saved.";
    }
  }

  async function startStripeCheckout() {
    var button = document.querySelector("[data-checkout-button]");
    var items = aggregateItems(readCart());
    if (items.length === 0) {
      statusMessage = "Your cart is empty.";
      renderCheckout();
      return;
    }

    if (button) {
      button.disabled = true;
      button.textContent = "Opening Stripe...";
    }

    statusMessage = "Creating your secure Stripe checkout session...";
    renderCheckout();

    try {
      var response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: items }),
      });

      var payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to start checkout.");
      }

      if (!payload.url) {
        throw new Error("Stripe checkout URL was not returned.");
      }

      window.location.href = payload.url;
    } catch (err) {
      statusMessage = "Checkout error: " + (err && err.message ? err.message : "Please try again.");
      if (button) {
        button.disabled = false;
        button.textContent = "Continue to Stripe Checkout";
      }
      renderCheckout();
    }
  }

  function bindActions() {
    var checkoutButton = document.querySelector("[data-checkout-button]");
    var clearButton = document.querySelector("[data-checkout-clear]");

    if (checkoutButton) {
      checkoutButton.addEventListener("click", startStripeCheckout);
    }

    if (clearButton) {
      clearButton.addEventListener("click", function () {
        writeCart([]);
        statusMessage = "Cart cleared.";
        renderCheckout();
      });
    }
  }

  function init() {
    updateStatusFromQuery();
    renderCheckout();
    bindActions();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
