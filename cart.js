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

  function writeCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }

  function cartCount(items) {
    return items.length;
  }

  function ensureUI() {
    if (document.querySelector(".cart-drawer")) {
      return;
    }

    var overlay = document.createElement("div");
    overlay.className = "cart-overlay";

    var drawer = document.createElement("aside");
    drawer.className = "cart-drawer";
    drawer.innerHTML = [
      '<div class="cart-header">',
      '  <strong>Your Cart</strong>',
      '  <button class="cart-btn" type="button" data-cart-close>Close</button>',
      "</div>",
      '<ul class="cart-list" data-cart-list></ul>',
      '<div class="cart-footer">',
      '  <div><strong>Total: $<span data-cart-total>0.00</span></strong></div>',
      '  <div style="margin-top:0.55rem; display:flex; gap:0.5rem;">',
      '    <button class="cart-btn" type="button" data-cart-clear>Clear Cart</button>',
      "  </div>",
      "</div>",
    ].join("\n");

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    overlay.addEventListener("click", closeCart);
    drawer.addEventListener("click", function (event) {
      var target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (target.hasAttribute("data-cart-close")) {
        closeCart();
      }

      if (target.hasAttribute("data-cart-clear")) {
        writeCart([]);
        refresh();
      }

      if (target.hasAttribute("data-remove-index")) {
        var idx = Number(target.getAttribute("data-remove-index"));
        var items = readCart();
        if (!Number.isNaN(idx) && idx >= 0 && idx < items.length) {
          items.splice(idx, 1);
          writeCart(items);
          refresh();
        }
      }
    });
  }

  function openCart() {
    ensureUI();
    refresh();
    var overlay = document.querySelector(".cart-overlay");
    var drawer = document.querySelector(".cart-drawer");
    if (overlay) overlay.classList.add("is-open");
    if (drawer) drawer.classList.add("is-open");
  }

  function closeCart() {
    var overlay = document.querySelector(".cart-overlay");
    var drawer = document.querySelector(".cart-drawer");
    if (overlay) overlay.classList.remove("is-open");
    if (drawer) drawer.classList.remove("is-open");
  }

  function refresh() {
    var items = readCart();
    var countEls = document.querySelectorAll("[data-cart-count]");
    countEls.forEach(function (el) {
      el.textContent = String(cartCount(items));
    });

    var list = document.querySelector("[data-cart-list]");
    var totalEl = document.querySelector("[data-cart-total]");
    if (!list || !totalEl) {
      return;
    }

    list.innerHTML = "";

    if (items.length === 0) {
      list.innerHTML = "<li>Your cart is empty.</li>";
      totalEl.textContent = "0.00";
      return;
    }

    var total = 0;

    items.forEach(function (item, index) {
      var price = Number(item.price || 0);
      total += price;
      var li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML = [
        '<div class="cart-item-title">' + (item.name || "Item") + "</div>",
        '<div class="cart-item-row">',
        '  <span>$' + price.toFixed(2) + "</span>",
        '  <button class="cart-btn" type="button" data-remove-index="' + index + '">Remove</button>',
        "</div>",
      ].join("\n");
      list.appendChild(li);
    });

    totalEl.textContent = total.toFixed(2);
  }

  function bindOpeners() {
    document.querySelectorAll("[data-cart-open]").forEach(function (btn) {
      btn.addEventListener("click", openCart);
    });
  }

  function bindAddButtons() {
    document.querySelectorAll("[data-add-to-cart]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var name = btn.getAttribute("data-product-name") || "Item";
        var price = Number(btn.getAttribute("data-product-price") || "0");
        var items = readCart();
        items.push({ name: name, price: price });
        writeCart(items);
        refresh();
        openCart();
      });
    });
  }

  function init() {
    ensureUI();
    bindOpeners();
    bindAddButtons();
    refresh();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
