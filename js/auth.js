const protectedPages = [
    "dashboard.html",
    "journal.html",
    "performance.html",
    "analytics.html",
    "team.html",
    "settings.html"
];

const currentPage = window.location.pathname.split("/").pop();

const session = localStorage.getItem("tradersLabSession");

if (
    protectedPages.includes(currentPage) &&
    !session
) {
    window.location.href = "login.html";
}


// ======================================================
// SIGN UP PAGE
// ======================================================

const signupForm = document.getElementById("signup-form");
const signupMessage = document.getElementById("signup-message");

function showSignupMessage(message, type) {
    signupMessage.textContent = message;
    signupMessage.className = `auth-message ${type}`;
}

if (signupForm) {
    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document
            .getElementById("name")
            .value
            .trim();

        const email = document
            .getElementById("email")
            .value
            .trim()
            .toLowerCase();

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirm-password").value;


        if (!name || !email || !password || !confirmPassword) {
            showSignupMessage(
                "Please complete all fields.",
                "error"
            );

            return;
        }


        if (password.length < 8) {
            showSignupMessage(
                "Password must be at least 8 characters.",
                "error"
            );

            return;
        }


        if (password !== confirmPassword) {
            showSignupMessage(
                "Passwords do not match.",
                "error"
            );

            return;
        }


        // Get all registered users
        let users = JSON.parse(
            localStorage.getItem("tradersLabUsers")
        ) || [];


        // Check whether this email already exists
        const existingUser = users.find(function (user) {
            return user.email === email;
        });


        if (existingUser) {
            showSignupMessage(
                "An account with this email already exists. Please log in.",
                "error"
            );

            return;
        }


        // Create new user
        const user = {
            id: crypto.randomUUID(),
            name: name,
            email: email,
            password: password
        };


        // Add user to users array
        users.push(user);


        // Save all users
        localStorage.setItem(
            "tradersLabUsers",
            JSON.stringify(users)
        );


        showSignupMessage(
            "Account created successfully. Redirecting...",
            "success"
        );


        setTimeout(function () {
            window.location.href = "login.html";
        }, 800);
    });
}


// ======================================================
// LOGIN PAGE
// ======================================================

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

function showLoginMessage(message, type) {
    loginMessage.textContent = message;
    loginMessage.className = `auth-message ${type}`;
}

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document
            .getElementById("email")
            .value
            .trim()
            .toLowerCase();

        const password =
            document.getElementById("password").value;


        if (!email || !password) {
            showLoginMessage(
                "Please enter your email and password.",
                "error"
            );

            return;
        }


        // Get all registered users
        const users = JSON.parse(
            localStorage.getItem("tradersLabUsers")
        ) || [];


        if (users.length === 0) {
            showLoginMessage(
                "No account found. Please create an account first.",
                "error"
            );

            return;
        }


        // Find matching user
        const user = users.find(function (user) {
            return (
                user.email === email &&
                user.password === password
            );
        });


        if (!user) {
            showLoginMessage(
                "Incorrect email or password.",
                "error"
            );

            return;
        }


        // Create session for this specific user
        localStorage.setItem(
            "tradersLabSession",
            JSON.stringify({
                loggedIn: true,
                userId: user.id,
                email: user.email
            })
        );


        showLoginMessage(
            "Login successful. Redirecting...",
            "success"
        );


        setTimeout(function () {
            window.location.href = "dashboard.html";
        }, 800);
    });
}


// ======================================================
// CURRENT USER
// ======================================================

const currentSession = JSON.parse(
    localStorage.getItem("tradersLabSession")
);


if (currentSession && currentSession.userId) {

    const users = JSON.parse(
        localStorage.getItem("tradersLabUsers")
    ) || [];


    const currentUser = users.find(function (user) {
        return user.id === currentSession.userId;
    });


    if (currentUser) {

        const sidebarUserName =
            document.getElementById("sidebar-user-name");

        const sidebarUserAvatar =
            document.getElementById("sidebar-user-avatar");

        const dashboardUserName =
            document.getElementById("dashboard-user-name");


        if (sidebarUserName) {
            sidebarUserName.textContent =
                currentUser.name;
        }


        if (sidebarUserAvatar) {
            sidebarUserAvatar.textContent =
                currentUser.name
                    .charAt(0)
                    .toUpperCase();
        }


        if (dashboardUserName) {
            dashboardUserName.textContent =
                currentUser.name;
        }
    }
}


// ======================================================
// LOG OUT
// ======================================================

const logoutLink =
    document.getElementById("logout-link");


if (logoutLink) {

    logoutLink.addEventListener("click", function (event) {
        event.preventDefault();

        localStorage.removeItem(
            "tradersLabSession"
        );

        window.location.href = "login.html";
    });
}