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
    }

})
.catch(function(error) {
    console.error("LOGIN ERROR:", error);
});


// =========================
// REVIEWER CHECK
// =========================

checkReviewer();

function checkReviewer() {

    fetch(
        DISCORD_WORKER + "/api/reviewer/check",
        {
            method: "GET",
            credentials: "include"
        }
    )
    .then(function(response) {

        if (!response.ok) {
            throw new Error(
                "Reviewer check failed"
            );
        }

        return response.json();

    })
    .then(function(data) {

        if (data.reviewer === true) {
            createReviewerButton();
        }

    })
    .catch(function(error) {

        console.error(
            "REVIEWER ERROR:",
            error
        );

    });
}


// =========================
// REVIEWER BUTTON
// =========================

function createReviewerButton() {

    if (
        document.getElementById(
            "reviewerButton"
        )
    ) {
        return;
    }

    const button =
        document.createElement("button");

    button.id =
        "reviewerButton";

    button.type =
        "button";

    button.textContent =
        "🔔";

    button.title =
        "Reviewer Panel";

    button.addEventListener(
        "click",
        openReviewerPanel
    );

    document.body.appendChild(button);
}


// =========================
// REVIEWER PANEL
// =========================

function openReviewerPanel() {

    let modal =
        document.getElementById(
            "reviewerModal"
        );

    if (!modal) {

        modal =
            document.createElement("div");

        modal.id =
            "reviewerModal";

        modal.innerHTML = `

            <div id="reviewerOverlay"></div>

            <div id="reviewerWindow">

                <button
                    id="reviewerClose"
                    type="button"
                >
                    ×
                </button>

                <div id="reviewerContent">

                    <h2>
                        Reviewer Panel
                    </h2>

                    <p>
                        Loading submissions...
                    </p>

                </div>

            </div>
        `;

        document.body.appendChild(modal);

        document
            .getElementById(
                "reviewerOverlay"
            )
            .addEventListener(
                "click",
                closeReviewerPanel
            );

        document
            .getElementById(
                "reviewerClose"
            )
            .addEventListener(
                "click",
                closeReviewerPanel
            );
    }

    modal.style.display =
        "flex";

    loadReviewerSubmissions();
}


// =========================
// LOAD SUBMISSIONS
// =========================

function loadReviewerSubmissions() {

    const content =
        document.getElementById(
            "reviewerContent"
        );

    content.innerHTML = `
        <h2>
            Reviewer Panel
        </h2>

        <p>
            Loading submissions...
        </p>
    `;

    fetch(
        DISCORD_WORKER +
        "/api/reviewer/submissions",
        {
            method: "GET",
            credentials: "include"
        }
    )
    .then(function(response) {

        if (!response.ok) {
            throw new Error(
                "Server returned " +
                response.status
            );
        }

        return response.json();

    })
    .then(function(data) {

        console.log(
            "REVIEWER SUBMISSIONS:",
            data
        );

        const submissions =
            data.submissions || [];

        let html = `
            <h2>
                Reviewer Panel
            </h2>
        `;

        if (
            submissions.length === 0
        ) {

            html += `
                <p>
                    No submissions to review.
                </p>
            `;

        } else {

            submissions.forEach(
                function(submission) {

                    html += `

                        <div
                            class="reviewer-submission"
                        >

                            <h3>
                                Submission #${submission.id}
                            </h3>

                            <p>
                                <strong>
                                    User:
                                </strong>

                                ${submission.username}
                            </p>

                            <p>
                                <strong>
                                    Mode:
                                </strong>

                                #${submission.mode_id}
                            </p>

                            <p>
                                <strong>
                                    Completion Date:
                                </strong>

                                ${submission.completion_date}
                            </p>

                            <p>
                                <strong>
                                    Verification:
                                </strong>

                                <a
                                    href="${submission.verification_link}"
                                    target="_blank"
                                >
                                    View Verification
                                </a>
                            </p>

                            <p>
                                <strong>
                                    Comments:
                                </strong>

                                ${
                                    submission.comments ||
                                    "None"
                                }
                            </p>

                            <p>
                                <strong>
                                    Status:
                                </strong>

                                ${submission.status}
                            </p>

                        </div>

                    `;
                }
            );
        }

        content.innerHTML =
            html;

    })
    .catch(function(error) {

        console.error(
            "SUBMISSION ERROR:",
            error
        );

        content.innerHTML = `
            <h2>
                Reviewer Panel
            </h2>

            <p>
                Failed to load submissions.
            </p>
        `;

    });
}


// =========================
// CLOSE REVIEWER PANEL
// =========================

function closeReviewerPanel() {

    const modal =
        document.getElementById(
            "reviewerModal"
        );

    if (modal) {

        modal.style.display =
            "none";

    }
}


// =========================
// SEARCH
// =========================

searchBar.addEventListener(
    "input",
    function() {

        const searchText =
            searchBar.value
                .toLowerCase()
                .trim();

        modes.forEach(function(mode) {

            const modeName =
                mode.querySelector(
                    ".mode-title span"
                ).textContent.toLowerCase();

            mode.style.display =
                modeName.includes(searchText)
                    ? "block"
                    : "none";

        });

    }
);


// =========================
// MODE CLICK
// =========================

modes.forEach(function(mode) {

    mode.addEventListener(
        "click",
        function(event) {

            if (
                event.target.classList.contains(
                    "verifier"
                )
            ) {
                return;
            }

            if (
                event.target.classList.contains(
                    "submit-button"
                )
            ) {
                return;
            }

            modes.forEach(
                function(otherMode) {

                    if (
                        otherMode !== mode
                    ) {
                        otherMode.classList.remove(
                            "open"
                        );
                    }

                }
            );

            mode.classList.toggle(
                "open"
            );

        }
    );

});
