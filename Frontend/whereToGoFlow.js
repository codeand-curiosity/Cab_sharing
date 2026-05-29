function initWhereToGoFlow() {
    const whereToGo = document.querySelector("#whereToGo");
    const rideSections = document.querySelector("#rideSections");
    const branchCards = document.querySelectorAll("[data-ride-mode]");
    const routeForm = document.querySelector("#routeForm");
    const routeFormTitle = document.querySelector("#routeFormTitle");
    const routeFormHint = document.querySelector("#routeFormHint");
    const routeSubmit = document.querySelector("#routeSubmit");
    const scheduleRide = document.querySelector("#scheduleRide");
    const runningRides = document.querySelector("#runningRides");
    const stopsList = document.querySelector("#stopsList");
    const addStop = document.querySelector("#addStop");
    const mapPlaceholder = document.querySelector("#mapPlaceholder");
    const publishedRideList = document.querySelector("#publishedRideList");
    const scheduledRideList = document.querySelector("#scheduledRideList");
    let stopCount = 0;
    let selectedRideMode = "";
    let hostDashboard = null;
    let rideDashboard = null;

    const sampleRequests = [
        { name: "Arjun Mehra", pickup: "Boat Club", drop: "MP Nagar Zone 2", seats: 1, share: 90 },
        { name: "Sana Khan", pickup: "New Market", drop: "DB Mall", seats: 2, share: 140 },
        { name: "Nisha Patel", pickup: "Danish Kunj", drop: "Habibganj", seats: 1, share: 80 }
    ];

    const joinedUsers = [
        { name: "Riya Sharma", pickup: "Indrapuri", drop: "New Market", share: 85, seat: 1 },
        { name: "Karan Soni", pickup: "BHEL Gate", drop: "DB Mall", share: 95, seat: 1 },
        { name: "Aman Verma", pickup: "10 No. Market", drop: "MP Nagar", share: 75, seat: 1 }
    ];

    if (!whereToGo || !rideSections || !routeForm) {
        return;
    }

    function ensureCoordinateInputs(name) {
        let latInput = routeForm.querySelector(`[name="${name}Lat"]`);
        let lngInput = routeForm.querySelector(`[name="${name}Lng"]`);

        if (!latInput) {
            latInput = document.createElement("input");
            latInput.type = "hidden";
            latInput.name = `${name}Lat`;
            routeForm.appendChild(latInput);
        }

        if (!lngInput) {
            lngInput = document.createElement("input");
            lngInput.type = "hidden";
            lngInput.name = `${name}Lng`;
            routeForm.appendChild(lngInput);
        }

        return { latInput, lngInput };
    }

    function updateMapMessage(title, body) {
        mapPlaceholder.innerHTML = `
            <div>
                <strong>${title}</strong>
                <span>${body}</span>
            </div>
        `;
    }

    window.cabifyLocationSelected = function cabifyLocationSelected(target, location) {
        const field = routeForm.querySelector(`[name="${target}"]`);
        const { latInput, lngInput } = ensureCoordinateInputs(target);

        if (field) {
            field.value = location.address;
        }

        latInput.value = location.lat;
        lngInput.value = location.lng;
        updateMapMessage(
            location.address,
            `${target.replace("-", " ")} saved at ${Number(location.lat).toFixed(5)}, ${Number(location.lng).toFixed(5)}`
        );
    };

    function value(name, fallback = "") {
        return routeForm.querySelector(`[name="${name}"]`)?.value.trim() || fallback;
    }

    function routeData() {
        const stops = Array.from(stopsList.querySelectorAll("input"))
            .map((input) => input.value.trim())
            .filter(Boolean);

        return {
            pickup: value("pickup", "Boat Club"),
            drop: value("drop", "MP Nagar Zone 2"),
            stops,
            distance: stops.length > 0 ? "13.8 km" : "9.6 km",
            duration: stops.length > 0 ? "34 min" : "24 min",
            fare: stops.length > 0 ? 110 : 90
        };
    }

    function money(total) {
        return `Rs ${total}`;
    }

    function routeMarkup(route) {
        const stopMarkup = route.stops.map((stop, index) => `
            <div class="route-point">
                <span class="route-dot"></span>
                <span>Stop ${index + 1}: ${stop}</span>
            </div>
        `).join("");

        return `
            <div class="route-line">
                <div class="route-point">
                    <span class="route-dot"></span>
                    <span>Pickup: ${route.pickup}</span>
                </div>
                ${stopMarkup}
                <div class="route-point">
                    <span class="route-dot drop"></span>
                    <span>Drop: ${route.drop}</span>
                </div>
            </div>
        `;
    }

    function setupTabs(dashboard) {
        dashboard.querySelectorAll("[data-flow-tab]").forEach((tab) => {
            tab.addEventListener("click", () => {
                const target = tab.dataset.flowTab;
                dashboard.querySelectorAll("[data-flow-tab]").forEach((item) => {
                    item.classList.toggle("active", item === tab);
                });
                dashboard.querySelectorAll("[data-flow-pane]").forEach((pane) => {
                    pane.classList.toggle("active", pane.dataset.flowPane === target);
                });
            });
        });
    }

    function hideDashboards() {
        hostDashboard?.classList.remove("active");
        rideDashboard?.classList.remove("active");
    }

    function renderScheduledRide() {
        if (!scheduledRideList) {
            return;
        }

        const route = routeData();
        const stopText = route.stops.length > 0
            ? `${route.stops.length} stop${route.stops.length === 1 ? "" : "s"} added`
            : "Direct ride";

        scheduledRideList.innerHTML = `
            <a class="host-upcoming-card" href="hostRideRequests.html">
                <div class="ride-main">
                    <div>
                        <strong>Your scheduled route</strong>
                        <span>${route.pickup} to ${route.drop}</span>
                    </div>
                    <div class="ride-price">Open</div>
                </div>
                <div class="ride-meta">
                    <span>See scheduled ride requests</span>
                    <span>Accept or reject riders</span>
                    <span>${stopText}</span>
                </div>
            </a>
        `;
    }

    function renderPublishedRide() {
        if (!publishedRideList) {
            return;
        }

        const route = routeData();
        const stopText = route.stops.length > 0
            ? `${route.stops.length} stop${route.stops.length === 1 ? "" : "s"} added`
            : "Direct ride";

        publishedRideList.innerHTML = `
            <a class="host-upcoming-card" href="hostRideRequests.html">
                <div class="ride-main">
                    <div>
                        <strong>Your published route</strong>
                        <span>${route.pickup} to ${route.drop}</span>
                    </div>
                    <div class="ride-price">Open</div>
                </div>
                <div class="ride-meta">
                    <span>See user requests</span>
                    <span>Accept or reject riders</span>
                    <span>${stopText}</span>
                </div>
            </a>
        `;
    }

    function rideOptions(route) {
        return [
            {
                id: "lake-mp",
                host: "Arjun Mehra",
                pickup: route.pickup || "Boat Club",
                drop: route.drop || "MP Nagar Zone 2",
                stops: route.stops.length > 0 ? route.stops : ["New Market"],
                distance: route.stops.length > 0 ? route.distance : "9.6 km",
                duration: route.stops.length > 0 ? route.duration : "24 min",
                fare: route.fare,
                seats: 3,
                riders: [
                    { name: "Aditi Rao", pickup: route.pickup || "Boat Club", drop: route.drop || "MP Nagar Zone 2", share: route.fare },
                    { name: "Vikram Jain", pickup: "New Market", drop: route.drop || "MP Nagar Zone 2", share: route.fare - 15 },
                    { name: "Mehul Shah", pickup: "Board Office", drop: route.drop || "MP Nagar Zone 2", share: route.fare - 10 }
                ]
            },
            {
                id: "indrapuri-market",
                host: "Sana Khan",
                pickup: "Indrapuri",
                drop: "New Market",
                stops: ["BHEL Gate", "Board Office"],
                distance: "12.4 km",
                duration: "31 min",
                fare: 85,
                seats: 2,
                riders: [
                    { name: "Riya Sharma", pickup: "Indrapuri", drop: "New Market", share: 85 },
                    { name: "Karan Soni", pickup: "BHEL Gate", drop: "New Market", share: 70 },
                    { name: "Isha Patel", pickup: "Board Office", drop: "New Market", share: 60 }
                ]
            },
            {
                id: "habibganj-db",
                host: "Nisha Patel",
                pickup: "Habibganj",
                drop: "DB Mall",
                stops: ["10 No. Market"],
                distance: "7.8 km",
                duration: "19 min",
                fare: 70,
                seats: 1,
                riders: [
                    { name: "Aman Verma", pickup: "Habibganj", drop: "DB Mall", share: 70 },
                    { name: "Devika Roy", pickup: "10 No. Market", drop: "DB Mall", share: 55 }
                ]
            }
        ];
    }

    function renderHostDashboard() {
        const route = routeData();
        const collection = sampleRequests.reduce((total, item) => total + item.share, 0);
        hostDashboard?.remove();
        hostDashboard = document.createElement("section");
        hostDashboard.className = "flow-dashboard active";
        hostDashboard.id = "hostDashboard";
        hostDashboard.innerHTML = `
            <div class="section-title">
                <h2>Host dashboard</h2>
                <span>Only host view</span>
            </div>
            <div class="flow-tabs" role="tablist" aria-label="Host ride sections">
                <button class="flow-tab active" type="button" data-flow-tab="requests">New pickups</button>
                <button class="flow-tab" type="button" data-flow-tab="joined">Joined users</button>
                <button class="flow-tab" type="button" data-flow-tab="current">Current route</button>
            </div>
            <div class="flow-pane active" data-flow-pane="requests">
                <div class="flow-kpis">
                    <div class="flow-kpi"><strong>${sampleRequests.length}</strong><span>Requests</span></div>
                    <div class="flow-kpi"><strong>${money(collection)}</strong><span>Collection share</span></div>
                    <div class="flow-kpi"><strong>${route.distance}</strong><span>Route distance</span></div>
                </div>
                ${sampleRequests.map((request) => `
                    <article class="flow-card">
                        <div class="ride-main">
                            <div>
                                <strong>${request.name}</strong>
                                <span>${request.pickup} to ${request.drop}</span>
                            </div>
                            <div class="ride-price">${money(request.share)}</div>
                        </div>
                        <div class="ride-meta">
                            <span>${request.seats} seat${request.seats > 1 ? "s" : ""}</span>
                            <span>Pickup: ${request.pickup}</span>
                            <span>Drop: ${request.drop}</span>
                        </div>
                        <div class="flow-actions">
                            <button class="secondary-btn" type="button">Accept</button>
                            <button class="field-action-btn" type="button">Reject</button>
                        </div>
                    </article>
                `).join("")}
            </div>
            <div class="flow-pane" data-flow-pane="joined">
                ${joinedUsers.map((user) => `
                    <article class="user-row">
                        <div class="ride-main">
                            <div>
                                <strong>${user.name}</strong>
                                <span>${user.pickup} to ${user.drop}</span>
                            </div>
                            <div class="ride-price">${money(user.share)}</div>
                        </div>
                        <div class="ride-meta">
                            <span>${user.seat} seat</span>
                            <span>Route share confirmed</span>
                        </div>
                    </article>
                `).join("")}
            </div>
            <div class="flow-pane" data-flow-pane="current">
                <article class="flow-card">
                    <strong>${route.pickup} to ${route.drop}</strong>
                    ${routeMarkup(route)}
                    <div class="ride-meta">
                        <span>${route.distance}</span>
                        <span>${route.duration}</span>
                        <span>${money(route.fare)} per seat</span>
                    </div>
                </article>
            </div>
        `;
        rideSections.appendChild(hostDashboard);
        setupTabs(hostDashboard);
    }

    function renderRunningRideDashboard(ride) {
        rideDashboard?.remove();
        rideDashboard = document.createElement("section");
        rideDashboard.className = "flow-dashboard active";
        rideDashboard.id = "runningRideDashboard";
        rideDashboard.innerHTML = `
            <div class="section-title">
                <h2>${ride.host}'s running ride</h2>
                <span>${ride.seats} seat${ride.seats > 1 ? "s" : ""} left</span>
            </div>
            <div class="flow-tabs" role="tablist" aria-label="Running ride sections">
                <button class="flow-tab active" type="button" data-flow-tab="hostpoints">Pickup / drop</button>
                <button class="flow-tab" type="button" data-flow-tab="route">Route</button>
                <button class="flow-tab" type="button" data-flow-tab="users">Joined users</button>
            </div>
            <div class="flow-pane active" data-flow-pane="hostpoints">
                <article class="flow-card">
                    <div class="ride-main">
                        <div>
                            <strong>Host pickup point</strong>
                            <span>${ride.pickup}</span>
                        </div>
                        <div class="ride-price">${money(ride.fare)}</div>
                    </div>
                    <span>Host drop point: ${ride.drop}</span>
                    <span>Hosted by ${ride.host}. Select join after reviewing route and joined users.</span>
                </article>
            </div>
            <div class="flow-pane" data-flow-pane="route">
                <article class="flow-card">
                    <strong>${ride.pickup} to ${ride.drop}</strong>
                    ${routeMarkup(ride)}
                    <div class="ride-meta">
                        <span>${ride.distance}</span>
                        <span>${ride.duration}</span>
                        <span>${ride.stops.length} stop${ride.stops.length === 1 ? "" : "s"}</span>
                    </div>
                </article>
            </div>
            <div class="flow-pane" data-flow-pane="users">
                ${ride.riders.map((rider) => `
                    <article class="user-row">
                        <div class="ride-main">
                            <div>
                                <strong>${rider.name}</strong>
                                <span>${rider.pickup} to ${rider.drop}</span>
                            </div>
                            <div class="ride-price">${money(rider.share)}</div>
                        </div>
                        <div class="ride-meta">
                            <span>Already joined</span>
                            <span>Route info shared</span>
                        </div>
                    </article>
                `).join("")}
            </div>
        `;
        rideSections.appendChild(rideDashboard);
        setupTabs(rideDashboard);
    }

    function renderRunningRideOptions() {
        const options = rideOptions(routeData());
        rideDashboard?.remove();
        rideDashboard = document.createElement("section");
        rideDashboard.className = "flow-dashboard active";
        rideDashboard.id = "runningRideDashboard";
        rideDashboard.innerHTML = `
            <div class="section-title">
                <h2>Select a running ride</h2>
                <span>${options.length} options</span>
            </div>
            ${options.map((ride) => `
                <article class="flow-card">
                    <div class="ride-main">
                        <div>
                            <strong>${ride.pickup} to ${ride.drop}</strong>
                            <span>Hosted by ${ride.host}</span>
                        </div>
                        <div class="ride-price">${money(ride.fare)}</div>
                    </div>
                    <div class="ride-meta">
                        <span>${ride.distance}</span>
                        <span>${ride.duration}</span>
                        <span>${ride.seats} seat${ride.seats > 1 ? "s" : ""} left</span>
                    </div>
                    <div class="flow-actions">
                        <button class="secondary-btn" type="button" data-select-running-ride="${ride.id}">Select ride</button>
                    </div>
                </article>
            `).join("")}
        `;
        rideSections.appendChild(rideDashboard);
        rideDashboard.querySelectorAll("[data-select-running-ride]").forEach((button) => {
            button.addEventListener("click", () => {
                const selected = options.find((ride) => ride.id === button.dataset.selectRunningRide);
                renderRunningRideDashboard(selected);
            });
        });
    }

    whereToGo.addEventListener("click", () => {
        const isOpen = rideSections.classList.toggle("active");
        whereToGo.setAttribute("aria-expanded", String(isOpen));
    });

    branchCards.forEach((card) => {
        card.addEventListener("click", () => {
            const mode = card.dataset.rideMode;
            selectedRideMode = mode;
            hideDashboards();
            branchCards.forEach((item) => item.classList.toggle("active", item === card));
            routeForm.classList.add("active");
            runningRides.classList.toggle("active", mode === "join");

            if (mode === "host") {
                routeFormTitle.textContent = "Host your ride";
                routeFormHint.textContent = "Add pickup, optional stops, and drop location so riders can request your route.";
                routeSubmit.textContent = "Publish route";
                scheduleRide?.classList.add("active");
                return;
            }

            routeFormTitle.textContent = "Find running rides";
            routeFormHint.textContent = "Add pickup and drop location to match with nearby active rides.";
            routeSubmit.textContent = "Search rides";
            scheduleRide?.classList.remove("active");
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

        const target = mapButton.dataset.mapTarget;
        window.cabifyActiveMapTarget = target;
        updateMapMessage(`Select ${target.replace("-", " ")} on map`, "Click anywhere on the OpenStreetMap view to save this location.");
    });

    routeForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (selectedRideMode === "host") {
            runningRides.classList.remove("active");
            routeForm.classList.remove("active");
            hideDashboards();
            renderPublishedRide();
            publishedRideList?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            return;
        }

        if (selectedRideMode === "join") {
            runningRides.classList.remove("active");
            routeForm.classList.remove("active");
            hideDashboards();
            renderRunningRideOptions();
        }
    });

    scheduleRide?.addEventListener("click", () => {
        if (selectedRideMode !== "host") {
            return;
        }

        runningRides.classList.remove("active");
        routeForm.classList.remove("active");
        hideDashboards();
        renderScheduledRide();
    });

}

document.addEventListener("DOMContentLoaded", initWhereToGoFlow);
