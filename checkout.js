(function () {
  var CART_KEY = "movewise_cart";
  var statusMessage = "";
  var downloadState = {
    loading: false,
    message: "",
    links: [],
  };

  function getApiBaseUrl() {
    var meta = document.querySelector('meta[name="movewise-api-base-url"]');
    var configured = meta && meta.getAttribute("content") ? meta.getAttribute("content").trim() : "";
    var globalValue = typeof window !== "undefined" && window.MOVEWISE_API_BASE_URL ? String(window.MOVEWISE_API_BASE_URL).trim() : "";
    var rawBase = globalValue || configured;
    return rawBase ? rawBase.replace(/\/$/, "") : "";
  }

  function apiUrl(path) {
    var base = getApiBaseUrl();
    if (!base) {
      return path;
    }
    return base + path;
  }

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

    renderDigitalDelivery();

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

  function renderDigitalDelivery() {
    var card = document.querySelector("[data-delivery-card]");
    var messageEl = document.querySelector("[data-delivery-message]");
    var list = document.querySelector("[data-delivery-list]");
    if (!card || !messageEl || !list) {
      return;
    }

    if (!downloadState.loading && downloadState.links.length === 0 && !downloadState.message) {
      card.hidden = true;
      return;
    }

    card.hidden = false;
    messageEl.textContent = downloadState.message;
    list.innerHTML = "";

    downloadState.links.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "checkout-item";
      var label = item && item.label ? item.label : "Download";
      var url = item && item.url ? item.url : "#";
      li.innerHTML = "<span>" + label + "</span><a class=\"resource-link\" href=\"" + url + "\" target=\"_blank\" rel=\"noopener noreferrer\">Download</a>";
      list.appendChild(li);
    });
  }

  async function updateStatusFromQuery() {
    var params = new URLSearchParams(window.location.search);
    var status = params.get("status");
    var sessionId = params.get("session_id");
    if (status === "success") {
      writeCart([]);
      statusMessage = "Payment complete. Thank you. A receipt will be sent by Stripe.";
      if (sessionId) {
        await fetchDigitalDelivery(sessionId);
      }
    } else if (status === "cancelled") {
      statusMessage = "Checkout cancelled. Your cart is still saved.";
    }
  }

  async function fetchDigitalDelivery(sessionId) {
    downloadState.loading = true;
    downloadState.message = "Checking your digital delivery...";
    downloadState.links = [];
    renderDigitalDelivery();

    try {
      var response = await fetch(apiUrl("/api/digital-delivery?session_id=" + encodeURIComponent(sessionId)), {
        method: "GET",
      });
      var payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to load digital delivery.");
      }

      var links = Array.isArray(payload.downloads) ? payload.downloads : [];
      downloadState.links = links;
      if (links.length > 0) {
        downloadState.message = "Your purchase includes the digital downloads below.";
      } else {
        downloadState.message = "No digital downloads were attached to this purchase.";
      }
    } catch (err) {
      downloadState.message = "Digital delivery error: " + (err && err.message ? err.message : "Please contact support.");
      downloadState.links = [];
    } finally {
      downloadState.loading = false;
      renderDigitalDelivery();
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
      var response = await fetch(apiUrl("/api/create-checkout-session"), {
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
      var hint = "";
      if (getApiBaseUrl() === "") {
        hint = " If your site is static-hosted, set the API base URL in checkout.html.";
      }
      statusMessage = "Checkout error: " + (err && err.message ? err.message : "Please try again.") + hint;
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

  async function init() {
    await updateStatusFromQuery();
    renderCheckout();
    bindActions();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
