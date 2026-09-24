const requestsContainer = document.getElementById("requests-container");
const message = document.getElementById("message");

async function loadRequests() {

    try {

        const response = await fetch("/api/requests", {
            credentials: "include"
        });

        const result = await response.json();
        console.log(result);

        if (!response.ok) {
            message.textContent = result.error || "Unable to load requests.";
            return;
        }

        requestsContainer.innerHTML = "";

        result.forEach(function(request) {

            const card = document.createElement("div");

            card.className = "request-card";

            card.innerHTML = `
                <h3>Request #${request.id}</h3>

                <p><strong>User ID:</strong> ${request.user_id}</p>

                <p><strong>Service:</strong> ${request.service}</p>

                <p><strong>Description:</strong> ${request.description}</p>

                <p><strong>Created:</strong> ${request.created_at}</p>

                <label>Status:</label>

                <select id="status-${request.id}">

                    <option value="Pending"
                        ${request.status === "Pending" ? "selected" : ""}>
                        Pending
                    </option>

                    <option value="In Progress"
                        ${request.status === "In Progress" ? "selected" : ""}>
                        In Progress
                    </option>

                    <option value="Completed"
                        ${request.status === "Completed" ? "selected" : ""}>
                        Completed
                    </option>

                    <option value="Rejected"
                        ${request.status === "Rejected" ? "selected" : ""}>
                        Rejected
                    </option>

                </select>

                <button onclick="updateStatus(${request.id})">
                    Update Status
                </button>
            `;

            requestsContainer.appendChild(card);

        });

    } catch (error) {

        console.log(error);

        message.textContent = "Something went wrong.";

    }
}


async function updateStatus(id) {

   const status = document.getElementById(`status-${id}`).value;

    try {

        const response = await fetch(`/api/requests/${id}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            credentials: "include",

            body: JSON.stringify({
                status: status
            })

        });

        const result = await response.json();

        if (response.ok) {

            message.textContent = "Request status updated successfully.";

            loadRequests();

        } else {

            message.textContent =
                result.error || "Unable to update request.";

        }

    } catch (error) {

        console.log(error);

        message.textContent = "Something went wrong.";

    }
}


loadRequests();