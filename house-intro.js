(function () {
  var intro = document.getElementById("house-intro");
  if (!intro) {
    return;
  }

  var SESSION_KEY = "movewise_house_intro_seen";
  var isMobile = window.matchMedia("(max-width: 900px)").matches;
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!isMobile || prefersReducedMotion || sessionStorage.getItem(SESSION_KEY)) {
    intro.classList.add("is-hidden");
    return;
  }

  var hasEntered = false;

  function enter() {
    if (hasEntered) {
      return;
    }
    hasEntered = true;

    sessionStorage.setItem(SESSION_KEY, "1");
    intro.classList.add("is-opening");

    window.setTimeout(function () {
      intro.classList.add("is-entering");
    }, 750);

    window.setTimeout(function () {
      intro.classList.add("is-hidden");
    }, 1550);
  }

  intro.addEventListener("click", enter);
  intro.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      enter();
    }
  });

  // Auto-enter after a short delay so the animation still plays for users who don't tap.
  window.setTimeout(enter, 2600);
})();
