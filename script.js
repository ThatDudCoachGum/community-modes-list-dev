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

    console.error(
        "LOGIN ERROR:",
        error
    );

});


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


            if (
                modeName.includes(searchText)
            ) {

                mode.style.display =
                    "block";

            } else {

                mode.style.display =
                    "none";

            }

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


        document.body.appendChild(
            modal
        );


        document
            .getElementById(
                "submissionOverlay"
            )
            .addEventListener(
                "click",
                closeSubmissionModal
            );


        document
            .getElementById(
                "submissionClose"
            )
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


        if (
            completions.length === 0
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


    errorElement.textContent =
        "";


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
    .then(function() {

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
// CLOSE SUBMISSION MODAL
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


                openSubmissionModal(
                    mode
                );

            }
        );

    });


// =========================
// REVIEWER CHECK
// =========================

checkReviewer();


function checkReviewer() {

    fetch(
        DISCORD_WORKER +
        "/api/reviewer/check",
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

        console.log(
            "Reviewer check:",
            data
        );


        if (
            data.reviewer === true
        ) {

            createReviewerButton();

        }

    })
    .catch(function(error) {

        console.error(
            "Reviewer check error:",
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
        document.createElement(
            "button"
        );


    button.id =
        "reviewerButton";


    button.type =
        "button";


    button.textContent =
        "🔔";


    button.title =
        "Reviewer Notifications";


    button.addEventListener(
        "click",
        toggleReviewerMenu
    );


    document.body.appendChild(
        button
    );

}


// =========================
// REVIEWER MENU
// =========================

function toggleReviewerMenu() {

    let menu =
        document.getElementById(
            "reviewerMenu"
        );


    if (!menu) {

        createReviewerMenu();


        menu =
            document.getElementById(
                "reviewerMenu"
            );


        menu.style.display =
            "block";


        loadReviewerSubmissions();


        return;

    }


    if (
        menu.style.display === "block"
    ) {

        menu.style.display =
            "none";

    } else {

        menu.style.display =
            "block";


        loadReviewerSubmissions();

    }

}


// =========================
// CREATE REVIEWER MENU
// =========================

function createReviewerMenu() {

    const menu =
        document.createElement(
            "div"
        );


    menu.id =
        "reviewerMenu";


    menu.innerHTML = `

        <h3>
            Reviewer Submissions
        </h3>

        <div id="reviewerContent">

            <p>
                Loading submissions...
            </p>

        </div>

    `;


    document.body.appendChild(
        menu
    );

}


// =========================
// LOAD REVIEWER SUBMISSIONS
// =========================

function loadReviewerSubmissions() {

    const content =
        document.getElementById(
            "reviewerContent"
        );


    if (!content) {

        return;

    }


    content.innerHTML = `
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
            "Reviewer submissions:",
            data
        );


        const submissions =
            data.submissions || [];


        if (
            submissions.length === 0
        ) {

            content.innerHTML = `
                <p>
                    No submissions to review.
                </p>
            `;


            return;

        }


        let html =
            "";


        submissions.forEach(
            function(submission) {

                html += `

                    <div
                        class="reviewer-submission"
                        data-submission-id="${submission.id}"
                    >

                        <h4>
                            Submission #${submission.id}
                        </h4>

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
                                Date:
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
                                rel="noopener noreferrer"
                            >
                                View
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

                        <p class="reviewer-status">
                            Status:
                            ${submission.status}
                        </p>

                        <div
                            class="reviewer-actions"
                            style="
                                display:flex;
                                gap:8px;
                                margin-top:12px;
                            "
                        >

                            <button
                                type="button"
                                class="reviewer-accept-button"
                                data-submission-id="${submission.id}"
                                style="
                                    background:#3ba55d;
                                    color:white;
                                    border:none;
                                    padding:10px 14px;
                                    border-radius:6px;
                                    cursor:pointer;
                                    font-weight:bold;
                                "
                            >
                                Accept
                            </button>


                            <button
                                type="button"
                                class="reviewer-reject-button"
                                data-submission-id="${submission.id}"
                                style="
                                    background:#ed4245;
                                    color:white;
                                    border:none;
                                    padding:10px 14px;
                                    border-radius:6px;
                                    cursor:pointer;
                                    font-weight:bold;
                                "
                            >
                                Reject
                            </button>

                        </div>

                    </div>

                `;

            }
        );


        content.innerHTML =
            html;


        // =========================
        // ACCEPT BUTTONS
        // =========================

        content
            .querySelectorAll(
                ".reviewer-accept-button"
            )
            .forEach(function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        const submissionId =
                            button.dataset.submissionId;


                        approveSubmission(
                            submissionId,
                            button
                        );

                    }
                );

            });


        // =========================
        // REJECT BUTTONS
        // =========================

        content
            .querySelectorAll(
                ".reviewer-reject-button"
            )
            .forEach(function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        const submissionId =
                            button.dataset.submissionId;


                        rejectSubmission(
                            submissionId,
                            button
                        );

                    }
                );

            });

    })
    .catch(function(error) {

        console.error(
            "Reviewer submissions error:",
            error
        );


        content.innerHTML = `
            <p>
                Failed to load submissions.
            </p>
        `;

    });

}


// =========================
// APPROVE SUBMISSION
// =========================

function approveSubmission(
    submissionId,
    button
) {

    const confirmed =
        confirm(
            "Are you sure you want to accept this submission?"
        );


    if (!confirmed) {

        return;

    }


    button.disabled =
        true;


    button.textContent =
        "Accepting...";


    fetch(
        DISCORD_WORKER +
        "/api/reviewer/approve",
        {
            method: "POST",

            credentials: "include",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                submission_id:
                    Number(submissionId)

            })

        }
    )
    .then(function(response) {

        return response.json()
            .then(function(data) {

                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Failed to accept submission."
                    );

                }


                return data;

            });

    })
    .then(function(data) {

        console.log(
            "Submission approved:",
            data
        );


        loadReviewerSubmissions();

    })
    .catch(function(error) {

        console.error(
            "Approve error:",
            error
        );


        alert(
            error.message ||
            "Failed to accept submission."
        );


        button.disabled =
            false;


        button.textContent =
            "Accept";

    });

}


// =========================
// REJECT SUBMISSION
// =========================

function rejectSubmission(
    submissionId,
    button
) {

    const reason =
        prompt(
            "Why are you rejecting this submission?"
        );


    if (reason === null) {

        return;

    }


    const trimmedReason =
        reason.trim();


    if (!trimmedReason) {

        alert(
            "You must enter a rejection reason."
        );

        return;

    }


    if (
        trimmedReason.length > 1000
    ) {

        alert(
            "The rejection reason is too long. Please keep it under 1000 characters."
        );

        return;

    }


    button.disabled =
        true;


    button.textContent =
        "Rejecting...";


    fetch(
        DISCORD_WORKER +
        "/api/reviewer/reject",
        {
            method: "POST",

            credentials: "include",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                submission_id:
                    Number(submissionId),

                reason:
                    trimmedReason

            })

        }
    )
    .then(function(response) {

        return response.json()
            .then(function(data) {

                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Failed to reject submission."
                    );

                }


                return data;

            });

    })
    .then(function(data) {

        console.log(
            "Submission rejected:",
            data
        );


        loadReviewerSubmissions();

    })
    .catch(function(error) {

        console.error(
            "Reject error:",
            error
        );


        alert(
            error.message ||
            "Failed to reject submission."
        );


        button.disabled =
            false;


        button.textContent =
            "Reject";

    });

}const searchBar = document.getElementById("searchBar");
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

    console.error(
        "LOGIN ERROR:",
        error
    );

});


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


            if (
                modeName.includes(searchText)
            ) {

                mode.style.display =
                    "block";

            } else {

                mode.style.display =
                    "none";

            }

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


        document.body.appendChild(
            modal
        );


        document
            .getElementById(
                "submissionOverlay"
            )
            .addEventListener(
                "click",
                closeSubmissionModal
            );


        document
            .getElementById(
                "submissionClose"
            )
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


        if (
            completions.length === 0
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


    errorElement.textContent =
        "";


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
    .then(function() {

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
// CLOSE SUBMISSION MODAL
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


                openSubmissionModal(
                    mode
                );

            }
        );

    });


// =========================
// REVIEWER CHECK
// =========================

checkReviewer();


function checkReviewer() {

    fetch(
        DISCORD_WORKER +
        "/api/reviewer/check",
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

        console.log(
            "Reviewer check:",
            data
        );


        if (
            data.reviewer === true
        ) {

            createReviewerButton();

        }

    })
    .catch(function(error) {

        console.error(
            "Reviewer check error:",
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
        document.createElement(
            "button"
        );


    button.id =
        "reviewerButton";


    button.type =
        "button";


    button.textContent =
        "🔔";


    button.title =
        "Reviewer Notifications";


    button.addEventListener(
        "click",
        toggleReviewerMenu
    );


    document.body.appendChild(
        button
    );

}


// =========================
// REVIEWER MENU
// =========================

function toggleReviewerMenu() {

    let menu =
        document.getElementById(
            "reviewerMenu"
        );


    if (!menu) {

        createReviewerMenu();


        menu =
            document.getElementById(
                "reviewerMenu"
            );


        menu.style.display =
            "block";


        loadReviewerSubmissions();


        return;

    }


    if (
        menu.style.display === "block"
    ) {

        menu.style.display =
            "none";

    } else {

        menu.style.display =
            "block";


        loadReviewerSubmissions();

    }

}


// =========================
// CREATE REVIEWER MENU
// =========================

function createReviewerMenu() {

    const menu =
        document.createElement(
            "div"
        );


    menu.id =
        "reviewerMenu";


    menu.innerHTML = `

        <h3>
            Reviewer Submissions
        </h3>

        <div id="reviewerContent">

            <p>
                Loading submissions...
            </p>

        </div>

    `;


    document.body.appendChild(
        menu
    );

}


// =========================
// LOAD REVIEWER SUBMISSIONS
// =========================

function loadReviewerSubmissions() {

    const content =
        document.getElementById(
            "reviewerContent"
        );


    if (!content) {

        return;

    }


    content.innerHTML = `
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
            "Reviewer submissions:",
            data
        );


        const submissions =
            data.submissions || [];


        if (
            submissions.length === 0
        ) {

            content.innerHTML = `
                <p>
                    No submissions to review.
                </p>
            `;


            return;

        }


        let html =
            "";


        submissions.forEach(
            function(submission) {

                html += `

                    <div
                        class="reviewer-submission"
                        data-submission-id="${submission.id}"
                    >

                        <h4>
                            Submission #${submission.id}
                        </h4>

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
                                Date:
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
                                rel="noopener noreferrer"
                            >
                                View
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

                        <p class="reviewer-status">
                            Status:
                            ${submission.status}
                        </p>

                        <div
                            class="reviewer-actions"
                            style="
                                display:flex;
                                gap:8px;
                                margin-top:12px;
                            "
                        >

                            <button
                                type="button"
                                class="reviewer-accept-button"
                                data-submission-id="${submission.id}"
                                style="
                                    background:#3ba55d;
                                    color:white;
                                    border:none;
                                    padding:10px 14px;
                                    border-radius:6px;
                                    cursor:pointer;
                                    font-weight:bold;
                                "
                            >
                                Accept
                            </button>


                            <button
                                type="button"
                                class="reviewer-reject-button"
                                data-submission-id="${submission.id}"
                                style="
                                    background:#ed4245;
                                    color:white;
                                    border:none;
                                    padding:10px 14px;
                                    border-radius:6px;
                                    cursor:pointer;
                                    font-weight:bold;
                                "
                            >
                                Reject
                            </button>

                        </div>

                    </div>

                `;

            }
        );


        content.innerHTML =
            html;


        // =========================
        // ACCEPT BUTTONS
        // =========================

        content
            .querySelectorAll(
                ".reviewer-accept-button"
            )
            .forEach(function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        const submissionId =
                            button.dataset.submissionId;


                        approveSubmission(
                            submissionId,
                            button
                        );

                    }
                );

            });


        // =========================
        // REJECT BUTTONS
        // =========================

        content
            .querySelectorAll(
                ".reviewer-reject-button"
            )
            .forEach(function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        const submissionId =
                            button.dataset.submissionId;


                        rejectSubmission(
                            submissionId,
                            button
                        );

                    }
                );

            });

    })
    .catch(function(error) {

        console.error(
            "Reviewer submissions error:",
            error
        );


        content.innerHTML = `
            <p>
                Failed to load submissions.
            </p>
        `;

    });

}


// =========================
// APPROVE SUBMISSION
// =========================

function approveSubmission(
    submissionId,
    button
) {

    const confirmed =
        confirm(
            "Are you sure you want to accept this submission?"
        );


    if (!confirmed) {

        return;

    }


    button.disabled =
        true;


    button.textContent =
        "Accepting...";


    fetch(
        DISCORD_WORKER +
        "/api/reviewer/approve",
        {
            method: "POST",

            credentials: "include",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                submission_id:
                    Number(submissionId)

            })

        }
    )
    .then(function(response) {

        return response.json()
            .then(function(data) {

                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Failed to accept submission."
                    );

                }


                return data;

            });

    })
    .then(function(data) {

        console.log(
            "Submission approved:",
            data
        );


        loadReviewerSubmissions();

    })
    .catch(function(error) {

        console.error(
            "Approve error:",
            error
        );


        alert(
            error.message ||
            "Failed to accept submission."
        );


        button.disabled =
            false;


        button.textContent =
            "Accept";

    });

}


// =========================
// REJECT SUBMISSION
// =========================

function rejectSubmission(
    submissionId,
    button
) {

    const reason =
        prompt(
            "Why are you rejecting this submission?"
        );


    if (reason === null) {

        return;

    }


    const trimmedReason =
        reason.trim();


    if (!trimmedReason) {

        alert(
            "You must enter a rejection reason."
        );

        return;

    }


    if (
        trimmedReason.length > 1000
    ) {

        alert(
            "The rejection reason is too long. Please keep it under 1000 characters."
        );

        return;

    }


    button.disabled =
        true;


    button.textContent =
        "Rejecting...";


    fetch(
        DISCORD_WORKER +
        "/api/reviewer/reject",
        {
            method: "POST",

            credentials: "include",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                submission_id:
                    Number(submissionId),

                reason:
                    trimmedReason

            })

        }
    )
    .then(function(response) {

        return response.json()
            .then(function(data) {

                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Failed to reject submission."
                    );

                }


                return data;

            });

    })
    .then(function(data) {

        console.log(
            "Submission rejected:",
            data
        );


        loadReviewerSubmissions();

    })
    .catch(function(error) {

        console.error(
            "Reject error:",
            error
        );


        alert(
            error.message ||
            "Failed to reject submission."
        );


        button.disabled =
            false;


        button.textContent =
            "Reject";

    });

}
