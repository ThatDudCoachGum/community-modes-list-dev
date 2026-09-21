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
        text || "";

    return div.innerHTML;

}


// =========================
// CREATE SUBMISSION MENU
// =========================

function createSubmissionModal() {

    if (
        document.getElementById("submissionModal")
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

            <button id="submissionClose">
                ×
            </button>

            <h2 id="submissionModeTitle">
                Mode
            </h2>

            <div id="submissionLeaderboard">

                <p>
                    Loading leaderboard...
                </p>

            </div>

            <button id="startSubmissionButton">
                Submit a Completion
            </button>

        </div>

    `;


    document.body.appendChild(modal);


    document
        .getElementById("submissionClose")
        .addEventListener(
            "click",
            closeSubmissionModal
        );


    document
        .getElementById("submissionOverlay")
        .addEventListener(
            "click",
            closeSubmissionModal
        );


    document
        .getElementById("startSubmissionButton")
        .addEventListener(
            "click",
            showSubmissionForm
        );

}


// =========================
// CLOSE SUBMISSION MENU
// =========================

function closeSubmissionModal() {

    const modal =
        document.getElementById(
            "submissionModal"
        );


    if (modal) {

        modal.remove();

    }

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


    modal.style.display =
        "flex";


    document.getElementById(
        "submissionModeTitle"
    ).textContent =
        modeTitle;


    const leaderboard =
        document.getElementById(
            "submissionLeaderboard"
        );


    leaderboard.innerHTML = `
        <p>
            Loading leaderboard...
        </p>
    `;


    try {

        const response =
            await fetch(
                `${DISCORD_WORKER}/api/mode?mode_id=${modeId}`,
                {
                    credentials: "include"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Could not load mode information."
            );

        }


        const data =
            await response.json();


        let html = `

            <div class="leaderboard-count">
                🏆 ${data.count} people have beaten this mode
            </div>

        `;


        if (
            !data.completions ||
            data.completions.length === 0
        ) {

            html += `

                <p class="no-completions">
                    Nobody has beaten this mode yet.
                </p>

            `;

        } else {

            html += `
                <div class="leaderboard-list">
            `;


            data.completions.forEach(
                function(completion, index) {

                    html += `

                        <div class="leaderboard-entry">

                            <span class="leaderboard-number">
                                ${index + 1}.
                            </span>

                            <span>
                                ${escapeHtml(
                                    completion.username
                                )}
                            </span>

                        </div>

                    `;

                }
            );


            html += `
               
