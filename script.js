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

    console.log("LOGIN:", data);

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

    console.log("Checking reviewer status...");

    fetch(
        DISCORD_WORKER + "/api/reviewer/check",
        {
            method: "GET",
            credentials: "include"
        }
    )
    .then(function(response) {

        console.log(
            "Reviewer response status:",
            response.status
        );

        if (!response.ok) {
            throw new Error(
                "Reviewer endpoint returned " +
                response.status
            );
        }

        return response.json();

    })
    .then(function(data) {

        console.log(
            "REVIEWER CHECK:",
            data
        );

        if (data.reviewer === true) {

            console.log(
                "Reviewer confirmed!"
            );

            createReviewerButton();

        } else {

            console.log(
                "Account is not a reviewer."
            );

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
        "REVIEWER";

    button.style.position =
        "fixed";

    button.style.top =
        "20px";

    button.style.left =
        "20px";

    button.style.zIndex =
        "999999";

    button.style.background =
        "red";

    button.style.color =
        "white";

    button.style.border =
        "none";

    button.style.padding =
        "15px 20px";

    button.style.borderRadius =
        "8px";

    button.style.fontSize =
        "16px";

    button.style.fontWeight =
        "bold";

    button.style.cursor =
        "pointer";


    button.addEventListener(
        "click",
        function() {

            alert(
                "Reviewer button works!"
            );

        }
    );


    document.body.appendChild(button);

    console.log(
        "Reviewer button created!"
    );

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
