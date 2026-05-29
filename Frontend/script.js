//javascript id="3h7k3r"
// ===============================
// CABIFY MAIN SCRIPT
// ===============================

console.log("Cabify App Loaded");

// ===============================
// WHERE TO GO BUTTON
// ===============================

const whereBtn = document.getElementById("whereToGo");
const rideSections = document.getElementById("rideSections");

if (whereBtn && rideSections) {

    whereBtn.addEventListener("click", () => {

        rideSections.classList.toggle("active");

        const expanded =
            whereBtn.getAttribute("aria-expanded") === "true";

        whereBtn.setAttribute(
            "aria-expanded",
            !expanded
        );
    });
}

// ===============================
// RIDE MODE SELECTION
// ===============================

const branchCards =
    document.querySelectorAll(".branch-card");

const routeForm =
    document.getElementById("routeForm");

const runningRides =
    document.getElementById("runningRides");

const routeFormTitle =
    document.getElementById("routeFormTitle");

const routeFormHint =
    document.getElementById("routeFormHint");

branchCards.forEach((card) => {

    card.addEventListener("click", () => {

        // Remove active class
        branchCards.forEach((c) => {
            c.classList.remove("active");
        });

        // Add active
        card.classList.add("active");

        const mode =
            card.getAttribute("data-ride-mode");

        // ===============================
        // HOST MODE
        // ===============================

        if (mode === "host") {

            routeForm.classList.add("active");

            runningRides.classList.remove("active");

            routeFormTitle.innerText =
                "Create your ride route";

            routeFormHint.innerText =
                "Add pickup, stops and drop locations for passengers.";
        }

        // ===============================
        // JOIN MODE
        // ===============================

        if (mode === "join") {

            routeForm.classList.add("active");

            runningRides.classList.add("active");

            routeFormTitle.innerText =
                "Find available rides";

            routeFormHint.innerText =
                "Set your pickup and drop to match nearby rides.";
        }
    });
});

// ===============================
// ADD STOPS
// ===============================

const addStopBtn =
    document.getElementById("addStop");

const stopsList =
    document.getElementById("stopsList");

let stopCount = 0;

if (addStopBtn && stopsList) {

    addStopBtn.addEventListener("click", () => {

        stopCount++;

        const stopDiv =
            document.createElement("div");

        stopDiv.className =
            "location-field stop-field";

        stopDiv.innerHTML = `

            <span class="field-label">
                Stop ${stopCount}
            </span>

            <input
                type="text"
                placeholder="Enter stop location"
            >

            <button
                type="button"
                class="remove-stop-btn"
            >
                ×
            </button>
        `;

        stopsList.appendChild(stopDiv);

        // Remove Stop
        const removeBtn =
            stopDiv.querySelector(".remove-stop-btn");

        removeBtn.addEventListener("click", () => {

            stopDiv.remove();
        });
    });
}

// ===============================
// FORM SUBMIT
// ===============================

if (routeForm) {

    routeForm.addEventListener("submit", (e) => {

        e.preventDefault();

        const pickup =
            routeForm.querySelector(
                'input[name="pickup"]'
            ).value;

        const drop =
            routeForm.querySelector(
                'input[name="drop"]'
            ).value;

        // Get stops
        const stopInputs =
            stopsList.querySelectorAll("input");

        const stops = [];

        stopInputs.forEach((input) => {

            if (input.value.trim() !== "") {

                stops.push(input.value);
            }
        });

        console.log("Pickup:", pickup);

        console.log("Stops:", stops);

        console.log("Drop:", drop);

        alert(
            "Route submitted successfully!"
        );
    });
}

// ===============================
// MAP TARGET BUTTONS
// ===============================

const mapButtons =
    document.querySelectorAll("[data-map-target]");

mapButtons.forEach((btn) => {

    btn.addEventListener("click", () => {

        const target =
            btn.getAttribute("data-map-target");

        alert(
            `Now click on Google Map to select ${target} location`
        );
    });
});

// ===============================
// CHANGE CITY BUTTON
// ===============================

const changeCityBtn =
    document.querySelector(".change-city");

if (changeCityBtn) {

    changeCityBtn.addEventListener("click", () => {

        const city =
            prompt("Enter city name:");

        if (city) {

            document.querySelector(
                ".location strong"
            ).innerText = `${city}, IN`;
        }
    });
}