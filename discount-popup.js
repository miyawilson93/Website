(function () {
  var POPUP_SEEN_KEY = "movewise_discount_popup_seen";

  function buildModal() {
    if (window.sessionStorage.getItem(POPUP_SEEN_KEY) === "1") {
      return;
    }

    window.sessionStorage.setItem(POPUP_SEEN_KEY, "1");

    var modal = document.createElement("div");
    modal.className = "discount-modal is-visible";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Limited time discount offer");

    modal.innerHTML = [
      '<div class="discount-modal-card">',
      '  <h2 class="discount-modal-title">Limited time only: 25% off any purchase</h2>',
      '  <p class="discount-modal-text">Enter your email below to unlock your discount code immediately.</p>',
      '  <form class="discount-modal-form" id="discount-form">',
      '    <input class="discount-modal-input" id="discount-email" type="email" required placeholder="Enter your email address" aria-label="Email address" />',
      '    <button class="discount-modal-button" type="submit">Get My Code</button>',
      "  </form>",
      '  <div class="discount-modal-code" id="discount-code">Your discount code: WiseMoves25</div>',
      '  <button class="discount-modal-close" id="discount-close" type="button">Close</button>',
      "</div>",
    ].join("\n");

    document.body.appendChild(modal);

    var form = document.getElementById("discount-form");
    var codeBox = document.getElementById("discount-code");
    var closeBtn = document.getElementById("discount-close");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (form.checkValidity()) {
        codeBox.classList.add("is-visible");
      }
    });

    closeBtn.addEventListener("click", function () {
      modal.classList.remove("is-visible");
      setTimeout(function () {
        modal.remove();
      }, 120);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildModal);
  } else {
    buildModal();
  }
})();
