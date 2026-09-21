const searchBar = document.getElementById("searchBar");
const modes = document.querySelectorAll(".mode");


// =========================
// DISCORD LOGIN
// =========================

const DISCORD_WORKER =
    "https://cml-discord-login-dev.majorbooz22.workers.dev";

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

    console.error(
        "Discord login check failed:",
        error
    );

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
            event.target.closest(".verifier")
        ) {
            return;
        }


        // Don't open/close when clicking Submit

        if (
            event.target.closest(".submit-button")
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


// =========================
// SUBMISSION SYSTEM
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
        text == null ? "" : String(text);

    return div.innerHTML;

}


// =========================
// CREATE SUBMISSION MODAL
// =========================

function createSubmissionModal() {

    if (
        document.getElementById(
            "submissionModal"
        )
    ) {
        return;
    }


    const modal =
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
        .addEventListener(
            "click",
            closeSubmissionModal
        );


    document
        .getElementById("submissionClose")
        .addEventListener(
            "click",
            closeSubmissionModal
        );

}


// =========================
// CLOSE SUBMISSION MODAL
// =========================

function closeSubmissionModal() {

    const modal =
        document.getElementById(
            "submissionModal"
        );

    if (!modal) {
        return;
    }


    modal.style.display =
        "none";

}


// =========================
// OPEN SUBMISSION MENU
// =========================

async function openSubmissionMenu(
    modeId,
    modeTitle
) {

    currentModeId =
        modeId;

    currentModeTitle =
        modeTitle;


    createSubmissionModal();


    const modal =
        document.getElementById(
            "submissionModal"
        );


    const content =
        document.getElementById(
            "submissionContent"
        );


    modal.style.display =
        "flex";


    content.innerHTML = `
        <h2>
            ${escapeHtml(modeTitle)}
        </h2>

        <p>
            Loading completions...
        </p>
    `;


    try {

        const response =
            await fetch(
                DISCORD_WORKER +
                "/api/mode?mode_id=" +
                encodeURIComponent(modeId)
            );


        if (!response.ok) {

            throw new Error(
                "Could not load completions"
            );

        }


        const data =
            await response.json();


        const completions =
            Array.isArray(
                data.completions
            )
                ? data.completions
                : [];


        let leaderboardHtml =
            "";


        if (
            completions.length === 0
        ) {

            leaderboardHtml = `
                <p class="no-completions">
                    Nobody has beaten this mode yet.
                </p>
            `;

        } else {

            leaderboard
