const searchBar = document.getElementById("searchBar");
const modes = document.querySelectorAll(".mode");


// =========================
// DISCORD LOGIN
// =========================

const DISCORD_WORKER =
    "https://cml-discord-login.majorbooz22.workers.dev";

const accountBox =
    document.getElementById("accountBox");


// Show login button immediately

accountBox.innerHTML = `
    <a
        id="loginButton"
        href="${DISCORD_WORKER}/login"
    >
        Login with Discord
    </a>
`;


// Check whether the user is already logged in

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

        // User is logged in

        document.body.classList.add("logged-in");

        accountBox.innerHTML = `
            <span id="loggedInButton">
                Logged In
            </span>
        `;

    } else {

        // User is not logged in

        document.body.classList.remove("logged-in");

    }

})
.catch(function(error) {

    console.error(
        "Discord login check failed:",
        error
    );

    // Keep Submit hidden if login check fails

    document.body.classList.remove("logged-in");

});


// =========================
// SEARCH
// =========================

searchBar.addEventListener("input", function() {

    const searchText =
        searchBar.value.toLowerCase().trim();

    modes.forEach(function(mode) {

        const modeName =
            mode.querySelector(".mode-title span")
            .textContent
            .toLowerCase();

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

        // Don't open/close when clicking verifier

        if (
            event.target.classList.contains("verifier")
        ) {
            return;
        }


        // Don't open/close when clicking Submit

        if (
            event.target.classList.contains("submit-button")
        ) {
            return;
        }


        // Close all other modes

        modes.forEach(function(otherMode) {

            if (otherMode !== mode) {

                otherMode.classList.remove("open");

            }

        });


        // Toggle this mode

        mode.classList.toggle("open");

    });

});
