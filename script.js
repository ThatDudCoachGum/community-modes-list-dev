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


// =========================
// GET MODE ID
// =========================

function getModeId(mode) {

    const title =
        mode.querySelector(
            ".mode-title span"
        ).textContent;


    const match =
        title.match(/^#(\d+)/);


    if (!match) {

        console.error(
            "Could not find mode ID:",
            title
        );

        return null;

    }


    return match[1];

}


// =========================
// SUBMISSION MODAL
// =========================

function openSubmissionModal(mode) {

    let modal =
        document.getElementById(
            "submissionModal"
        );


    if (!modal) {

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


    const content =
        document.getElementById(
            "submissionContent"
        );


    const title =
        mode.querySelector(
            ".mode-title span"
        ).textContent;


    const modeId =
        getModeId(mode);


    if (!modeId) {

        content.innerHTML = `
            <h2>${title}</h2>

            <p>
                Could not identify this mode.
            </p>
        `;

        modal.style.display =
            "flex";

        return;

    }


    content.innerHTML = `
        <h2>${title}</h2>

        <p>
            Loading completions...
        </p>
    `;


    modal.style.display =
        "flex";


    fetch(
        `${DISCORD_WORKER}/api/mode?mode_id=${modeId}`,
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

        const completions =
            data.completions || [];


        let html = `
            <h2>${title}</h2>

            <p>
                ${data.count || 0}
                approved completion${data.count === 1 ? "" : "s"}
            </p>
        `;


        if (completions.length === 0) {

            html += `
                <p class="no-completions">
                    Nobody has beaten this mode yet.
                </p>
            `;

        } else {

            html += `
                <div class="leaderboard-list">
            `;


            completions.forEach(
                function(completion, index) {

                    html += `
                        <div class="leaderboard-entry">
                            ${index + 1}.
                            ${completion.username}
                        </div>
                    `;

                }
            );


            html += `
                </div>
            `;

        }


        html += `
            <button
                id="startSubmissionButton"
                type="button"
            >
                Submit a Completion
            </button>
        `;


        content.innerHTML =
            html;


        document
            .getElementById(
                "startSubmissionButton"
            )
            .addEventListener(
                "click",
                function() {

                    showSubmissionForm(
                        mode,
                        modeId,
                        title
                    );

                }
            );

    })
    .catch(function(error) {

        console.error(
            "Completion loading failed:",
            error
        );


        content.innerHTML = `
            <h2>${title}</h2>

            <p>
                Failed to load completions.
            </p>
        `;

    });

}


// =========================
// SUBMISSION FORM
// =========================

function showSubmissionForm(
    mode,
    modeId,
    title
) {

    const content =
        document.getElementById(
            "submissionContent"
        );


    content.innerHTML = `

        <h2>
            Submit a Completion
        </h2>


        <p class="submission-description">
            ${title}
        </p>


        <label for="completionDate">
            Completion Date
        </label>

        <input
            id="completionDate"
            type="date"
        >


        <label for="verificationLink">
            Verification Link
        </label>

        <input
            id="verificationLink"
            type="url"
            placeholder="https://..."
        >


        <label for="submissionComments">
            Comments
            <span class="optional">
                (optional)
            </span>
        </label>

        <textarea
            id="submissionComments"
            placeholder="Anything you want the reviewers to know..."
        ></textarea>


        <button
            id="confirmSubmissionButton"
            type="button"
        >
            Confirm Submission
        </button>


        <p id="submissionError"></p>

    `;


    document
        .getElementById(
            "confirmSubmissionButton"
        )
        .addEventListener(
            "click",
            function() {

                submitCompletion(
                    modeId
                );

            }
        );

}


// =========================
// SEND SUBMISSION
// =========================

function submitCompletion(modeId) {

    const dateInput =
        document.getElementById(
            "completionDate"
        );

    const linkInput =
        document.getElementById(
            "verificationLink"
        );

    const commentsInput =
        document.getElementById(
            "submissionComments"
        );

    const confirmButton =
        document.getElementById(
            "confirmSubmissionButton"
        );

    const errorElement =
        document.getElementById(
            "submissionError"
        );


    const completionDate =
        dateInput.value;

    const verificationLink =
        linkInput.value.trim();

    const comments =
        commentsInput.value.trim();


    errorElement.textContent = "";


    if (!completionDate) {

        errorElement.textContent =
            "Please enter the completion date.";

        return;

    }


    if (!verificationLink) {

        errorElement.textContent =
            "Please enter a verification link.";

        return;

    }


    confirmButton.disabled =
        true;

    confirmButton.textContent =
        "Submitting...";


    fetch(
        `${DISCORD_WORKER}/api/submit`,
        {
            method: "POST",

            credentials: "include",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                mode_id:
                    Number(modeId),

                completion_date:
                    completionDate,

                verification_link:
                    verificationLink,

                comments:
                    comments

            })

        }
    )
    .then(function(response) {

        return response.json()
            .then(function(data) {

                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Submission failed."
                    );

                }

                return data;

            });

    })
    .then(function(data) {

        console.log(
            "Submission successful:",
            data
        );


        const content =
            document.getElementById(
                "submissionContent"
            );


        content.innerHTML = `

            <h2>
                Submission Sent!
            </h2>

            <p class="submission-success">
                Your submission has been sent
                and will be reviewed!
            </p>

            <button
                id="submissionDoneButton"
                type="button"
            >
                Done
            </button>

        `;


        document
            .getElementById(
                "submissionDoneButton"
            )
            .addEventListener(
                "click",
                closeSubmissionModal
            );

    })
    .catch(function(error) {

        console.error(
            "Submission failed:",
            error
        );


        errorElement.textContent =
            error.message ||
            "Submission failed.";


        confirmButton.disabled =
            false;

        confirmButton.textContent =
            "Confirm Submission";

    });

}


// =========================
// CLOSE MODAL
// =========================

function closeSubmissionModal() {

    const modal =
        document.getElementById(
            "submissionModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


// =========================
// SUBMIT BUTTONS
// =========================

document
    .querySelectorAll(".submit-button")
    .forEach(function(button) {

        button.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                event.stopPropagation();


                const mode =
                    button.closest(".mode");


                if (!mode) {
                    return;
                }


                openSubmissionModal(mode);

            }
        );

    });
