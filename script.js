const searchBar = document.getElementById("searchBar");
const modes = document.querySelectorAll(".mode");

const DISCORD_WORKER =
    "https://cml-discord-login-dev.majorbooz22.workers.dev";

const accountBox =
    document.getElementById("accountBox");


// =========================
// DISCORD LOGIN
// =========================

accountBox.innerHTML = `
    <a id="loginButton" href="${DISCORD_WORKER}/login">
        Login with Discord
    </a>
`;

fetch(DISCORD_WORKER + "/me", {
    credentials: "include"
})
.then(function(response) {
    if (!response.ok) {
        throw new Error("Login check failed");
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

    } else {

        document.body.classList.remove("logged-in");

    }

})
.catch(function(error) {

    console.error(error);

});


// =========================
// SEARCH
// =========================

searchBar.addEventListener("input", function() {

    const text =
        searchBar.value.toLowerCase().trim();

    modes.forEach(function(mode) {

        const title =
            mode.querySelector(
                ".mode-title span"
            ).textContent.toLowerCase();

        mode.style.display =
            title.includes(text)
                ? "block"
                : "none";

    });

});


// =========================
// MODE CLICKING
// =========================

modes.forEach(function(mode) {

    mode.addEventListener("click", function(event) {

        if (
            event.target.closest(".verifier") ||
            event.target.closest(".submit-button")
        ) {
            return;
        }

        modes.forEach(function(other) {

            if (other !== mode) {
                other.classList.remove("open");
            }

        });

        mode.classList.toggle("open");

    });

});


// =========================
// SUBMISSION VARIABLES
// =========================

let currentModeId = null;
let currentModeTitle = "";


// =========================
// ESCAPE HTML
// =========================

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text || "";

    return div.innerHTML;

}


// =========================
// CREATE MODAL
// =========================

function createModal() {

    let modal =
        document.getElementById(
            "submissionModal"
        );

    if (modal) {
        return modal;
    }

    modal =
        document.createElement("div");

    modal.id =
        "submissionModal";

    modal.innerHTML = `
        <div id="submissionOverlay"></div>

        <div id="submissionWindow">

            <button
                id="submissionClose"
                type="button"
            >
                ×
            </button>

            <div id="submissionContent"></div>

        </div>
    `;

    document.body.appendChild(modal);

    document
        .getElementById("submissionOverlay")
        .onclick =
        closeModal;

    document
        .
