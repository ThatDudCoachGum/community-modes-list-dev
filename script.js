const searchBar = document.getElementById("searchBar");
const modes = document.querySelectorAll(".mode");


// =========================
// DISCORD LOGIN
// =========================

const DISCORD_WORKER =
    "https://cml-discord-login-dev.majorbooz22.workers.dev";

const accountBox =
    document.getElementById("accountBox");


accountBox.innerHTML = `
    <a
        id="loginButton"
        href="${DISCORD_WORKER}/login"
    >
        Login with Discord
    </a>
`;


fetch(DISCORD_WORKER + "/me", {
    method: "GET",
    credentials: "include"
})
.then(function(response) {

    if (!response.ok) {
        throw new Error("Discord login check failed");
    }

    return response.json();

})
.then(function(data) {

    if (data.loggedIn === true) {

        document.body.classList.add("logged-in");

        accountBox.innerHTML = `
            <span id="loggedInButton">
                Logged In
            </span>
        `;

    }

})
.catch(function(error) {

    console.error(
        "Discord login check failed:",
        error
    );

});


// =========================
// SEARCH
// =========================

searchBar.addEventListener("input", function() {

    const searchText =
        searchBar.value.toLowerCase().trim();

    modes.forEach(function(mode) {

        const modeName =
            mode.querySelector(
                ".mode-title span"
            ).textContent.toLowerCase();

        if (modeName.includes(searchText)) {

            mode.style.display = "block";

        } else {

            mode.style.display = "none";

        }

    });

});


// =========================
// CLICK MODE
// =========================

modes.forEach(function(mode) {

    mode.addEventListener("click", function(event) {

        if (
            event.target.classList.contains("verifier")
        ) {
            return;
        }

        if (
            event.target.classList.contains("submit-button")
        ) {
            return;
        }


        modes.forEach(function(otherMode) {

            if (otherMode !== mode) {

                otherMode.classList.remove("open");

            }

        });


        mode.classList.toggle("open");

    });

});
