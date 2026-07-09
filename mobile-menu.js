(function () {
  var toggle = document.getElementById("mobile-home-toggle");
  var menu = document.getElementById("mobile-home-menu");
  var mobileNav = document.querySelector(".mobile-home-nav");
  var mobileNavBar = document.querySelector(".mobile-home-nav-bar");
  var floatingLogo = document.querySelector(".mobile-floating-logo");
  if (!toggle || !menu) {
    return;
  }

  function syncMobileNavOffset() {
    if (!mobileNav && !mobileNavBar) {
      return;
    }

    var navBottom = mobileNavBar ? mobileNavBar.getBoundingClientRect().bottom : mobileNav.getBoundingClientRect().bottom;
    var logoTop = navBottom + 8;
    var contentTop = navBottom;

    if (floatingLogo) {
      document.documentElement.style.setProperty("--mobile-logo-top", logoTop + "px");
      contentTop = logoTop + floatingLogo.offsetHeight;
    }

    document.documentElement.style.setProperty("--mobile-home-nav-offset", contentTop + "px");
  }

  function positionMenu() {
    var rect = toggle.getBoundingClientRect();
    var horizontalMargin = 8;
    var menuWidth = Math.min(Math.round(window.innerWidth * 0.72), 280);
    var left = rect.right - menuWidth;

    if (left < horizontalMargin) {
      left = horizontalMargin;
    }

    if (left + menuWidth > window.innerWidth - horizontalMargin) {
      left = window.innerWidth - horizontalMargin - menuWidth;
    }

    menu.style.width = menuWidth + "px";
    menu.style.left = left + "px";
    menu.style.top = rect.bottom + 6 + "px";
  }

  toggle.addEventListener("click", function () {
    var isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    if (isOpen) {
      positionMenu();
    }

    syncMobileNavOffset();
  });

  window.addEventListener("resize", function () {
    if (menu.classList.contains("is-open")) {
      positionMenu();
    }

    syncMobileNavOffset();
  });

  window.addEventListener("orientationchange", function () {
    if (menu.classList.contains("is-open")) {
      positionMenu();
    }

    syncMobileNavOffset();
  });

  window.addEventListener("load", syncMobileNavOffset);

  if (floatingLogo) {
    floatingLogo.addEventListener("load", syncMobileNavOffset);
  }

  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  syncMobileNavOffset();
})();
