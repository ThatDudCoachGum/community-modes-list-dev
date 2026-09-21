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
// SUBMISSION MENU
// =========================

document.querySelectorAll(".submit-button").forEach(function(button) {

    button.addEventListener("click", async function(event) {

        event.preventDefault();
        event.stopPropagation();


        const mode =
            button.closest(".mode");


        if (!mode) {
            return;
        }


        // Get the mode number and name

        const modeTitle =
            mode.querySelector(".mode-title span")
            .textContent;


        const modeMatch =
            modeTitle.match(/^#(\d+)/);


        if (!modeMatch) {

            alert("Could not find the mode number.");

            return;

        }


        const modeId =
            Number(modeMatch[1]);


        // Ask the DEV Worker for leaderboard data

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


            // Build leaderboard text

            let leaderboardText =
                `\n${modeTitle}\n\n`;


            leaderboardText +=
                `🏆 ${data.count} people have beaten this mode\n\n`;


            if (data.completions.length === 0) {

                leaderboardText +=
                    "Nobody has beaten it yet.\n";

            } else {

                data.completions.forEach(
                    function(completion, index) {

                        leaderboardText +=
                            `${index + 1}. ${completion.username}\n`;

                    }
                );

            }


            leaderboardText +=
                "\n\nA submission menu will be added here next.";


            alert(leaderboardText);

        }

        catch (error) {

            console.error(
                "Could not load mode:",
                error
            );


            alert(
                "Could not load this mode's information."
            );

        }

    });

});
