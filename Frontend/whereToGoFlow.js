function initWhereToGoFlow() {
    const whereToGo = document.querySelector("#whereToGo");
    const rideSections = document.querySelector("#rideSections");
    const branchCards = document.querySelectorAll("[data-ride-mode]");
    const routeForm = document.querySelector("#routeForm");
    const routeFormTitle = document.querySelector("#routeFormTitle");
    const routeFormHint = document.querySelector("#routeFormHint");
    const routeSubmit = document.querySelector("#routeSubmit");
    const runningRides = document.querySelector("#runningRides");
    const stopsList = document.querySelector("#stopsList");
    const addStop = document.querySelector("#addStop");
    const mapPlaceholder = document.querySelector("#mapPlaceholder");
    let stopCount = 0;

    if (!whereToGo || !rideSections || !routeForm) {
        return;
    }

    whereToGo.addEventListener("click", () => {
        const isOpen = rideSections.classList.toggle("active");
        whereToGo.setAttribute("aria-expanded", String(isOpen));
    });

    branchCards.forEach((card) => {
        card.addEventListener("click", () => {
            const mode = card.dataset.rideMode;
            branchCards.forEach((item) => item.classList.toggle("active", item === card));
            routeForm.classList.add("active");
            runningRides.classList.toggle("active", mode === "join");

            if (mode === "host") {
                routeFormTitle.textContent = "Host your ride";
                routeFormHint.textContent = "Add pickup, optional stops, and drop location so riders can request your route.";
                routeSubmit.textContent = "Publish route";
                return;
            }

            routeFormTitle.textContent = "Find running rides";
            routeFormHint.textContent = "Add pickup and drop location to match with nearby active rides.";
            routeSubmit.textContent = "Search rides";
        });
    });

    addStop.addEventListener("click", () => {
        stopCount += 1;
        const stopField = document.createElement("label");
        stopField.className = "location-field stop-field";
        stopField.innerHTML = `
            <button class="remove-stop-btn" type="button" aria-label="Remove stop">&times;</button>
            <span class="field-label">
                <svg class="green-pin" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"/>
                </svg>
                Stop ${stopCount}
            </span>
            <input type="text" name="stop-${stopCount}" placeholder="Type stop address " autocomplete="street-address">
            <span class="field-actions">
                <button class="field-action-btn" type="button" data-map-target="stop-${stopCount}">Set location on map</button>
            </span>
        `;
        stopsList.appendChild(stopField);
    });

    stopsList.addEventListener("click", (event) => {
        const removeButton = event.target.closest(".remove-stop-btn");

        if (!removeButton) {
            return;
        }

        removeButton.closest(".stop-field").remove();
    });

    routeForm.addEventListener("click", (event) => {
        const mapButton = event.target.closest("[data-map-target]");

        if (!mapButton) {
            return;
        }

        const target = mapButton.dataset.mapTarget.replace("-", " ");
        mapPlaceholder.innerHTML = `
            <div>
                <strong>Select ${target} on map</strong>
                <span>Google Maps click-to-set will connect here after the API key and map click handler are added.</span>
            </div>
        `;
    });

    routeForm.addEventListener("submit", (event) => {
        event.preventDefault();
    });
}

document.addEventListener("DOMContentLoaded", initWhereToGoFlow);
