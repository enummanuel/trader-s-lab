/* ================================
   MOBILE SIDEBAR
================================ */

(function () {

    const sidebar = document.querySelector(".app-sidebar");

    if (!sidebar) {
        return;
    }


    /* Create hamburger button */

    const menuButton =
        document.createElement("button");

    menuButton.type = "button";
    menuButton.className = "mobile-menu-button";

    menuButton.setAttribute(
        "aria-label",
        "Open navigation menu"
    );

    menuButton.setAttribute(
        "aria-expanded",
        "false"
    );

    menuButton.innerHTML = `
        <span></span>
    `;


    /* Create overlay */

    const overlay =
        document.createElement("div");

    overlay.className =
        "mobile-sidebar-overlay";


    document.body.appendChild(menuButton);
    document.body.appendChild(overlay);


    /* Open / close */

    function openMobileMenu() {

        document.body.classList.add(
            "mobile-menu-open"
        );

        menuButton.setAttribute(
            "aria-expanded",
            "true"
        );

        menuButton.setAttribute(
            "aria-label",
            "Close navigation menu"
        );
    }


    function closeMobileMenu() {

        document.body.classList.remove(
            "mobile-menu-open"
        );

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

        menuButton.setAttribute(
            "aria-label",
            "Open navigation menu"
        );
    }


    function toggleMobileMenu() {

        if (
            document.body.classList.contains(
                "mobile-menu-open"
            )
        ) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }


    menuButton.addEventListener(
        "click",
        toggleMobileMenu
    );


    overlay.addEventListener(
        "click",
        closeMobileMenu
    );


    /* Close after selecting a page */

    sidebar
        .querySelectorAll(".app-nav-link, .logout-link")
        .forEach(function (link) {

            link.addEventListener(
                "click",
                closeMobileMenu
            );

        });


    /* Close with Escape */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {
                closeMobileMenu();
            }

        }
    );


    /* Reset when returning to desktop */

    window.addEventListener(
        "resize",
        function () {

            if (window.innerWidth > 768) {
                closeMobileMenu();
            }

        }
    );

})();