function redirectToHome() {
    window.location.href = "../home/home.html";
  }
  
  function redirectToDashboard() {
    window.location.href = "../dashboard/dashboard.html";
  }

  function fetchCreditRequests() {
    fetchUserProfile();
    fetch("http://localhost:3000/api/admin/requests", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
    })
      .then((response) => {
        if (response.status === 401) {
          alert("Session expired! Please log in again.");
          localStorage.removeItem("token");
          window.location.href = "../login/login.html";
          return;
        }
        return response.json();
      })
      .then((data) => {
        // console.log("Request Response:", data);
  
        const tableBody = document.getElementById("creditRequestsBody");
        tableBody.innerHTML = ""; // Clear previous data
  
        if (!data || data.length === 0) {
          const noDataRow = document.createElement("tr");
          noDataRow.innerHTML = `<td colspan="5" style="text-align: center;">No pending credit requests.</td>`;
          tableBody.appendChild(noDataRow);
          return;
        }
  
        data.forEach((request) => {
          const row = document.createElement("tr");
  
          row.innerHTML = `
            <td>${request.id}</td>
            <td>${request.username}</td>
            <td>${request.requested_credits}</td>
            <td>${request.requested_at}</td>
            <td>
              <button class="approve-btn" onclick="updateRequestStatus(${request.id}, 'approved')">Approve</button>
              <button class="reject-btn" onclick="updateRequestStatus(${request.id}, 'rejected')">Reject</button>
            </td>
          `;
  
          tableBody.appendChild(row);
        });
      })
      .catch((error) => {
        console.error("Request Error:", error);
        alert(`An error occurred: ${error.message}`);
      });
  }
  
  function updateRequestStatus(requestId, status) {
    fetch(`http://localhost:3000/api/admin/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({ requestId, status }),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(`Request ${requestId} has been ${status}.`);
        setTimeout(fetchCreditRequests, 500);
        fetchCreditRequests();
      })
      .catch((error) => {
        console.error("Update Request Error:", error);
        alert(`An error occurred: ${error.message}`);
      });
  }

  async function fetchUserProfile() {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (!localStorage.getItem("token")) {
      alert("You must be logged in to view this page.");
      window.location.href = "../login/login.html";
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/api/user/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
      });
  
      if (response.status === 401) {
        alert("Session expired! Please log in again.");
        localStorage.removeItem("token");
        window.location.href = "../login/login.html";
        return;
      }
  
      if (!response.ok) throw new Error(`Error: ${response.status}`);
  
      const data = await response.json();
      const username = document.getElementById("username");
      if (username) {
        username.textContent = data.username;
      }
      const credits = document.getElementById("credits");
      if (credits) {
        credits.textContent = data.credits;
      }
      const requestCreditsBtn = document.getElementById("requestCreditsBtn");
      if (requestCreditsBtn) {
        requestCreditsBtn.style.display = data.credits === 0 ? "inline-block" : "none";
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      document.getElementById("username").textContent = "Error loading user";
    }
  
    try {
      const response = await fetch("http://localhost:3000/api/user/getstore", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
      });
  
      if (response.status === 401) {
        alert("Session expired! Please log in again.");
        localStorage.removeItem("token");
        window.location.href = "../login/login.html";
        return;
      }
      if (!response.ok) throw new Error(`Error: ${response.status}`);
  
      const documents = await response.json();
  
  
      const tableBody = document.getElementById("documentsBody");
      if (tableBody) {
        tableBody.innerHTML = "";
      documents.forEach((doc) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                  <td>${doc.id}</td>
                  <td>${doc.filename}</td>
                  <td>${
                    new Date().toISOString().split("T")[0]
                  }</td> <!-- Placeholder for date -->
                  <td>
      <button onclick="downloadFile(${doc.id})">Download</button>
      <button class="deleteDocumentBtn" style="display: none;" onclick="deleteDocument(${
        doc.id
      })">Delete</button>
  </td>`;
        tableBody.appendChild(row);
        if (isAdmin) {
          document.querySelectorAll(".deleteDocumentBtn").forEach((btn) => {
            btn.style.display = "inline-block";
          });
        }
      });
    }
    } catch (error) {
      console.error("Failed to fetch store details:", error);
    }
  }


  function logout() {
    fetch("http://localhost:3000/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Logout failed: ${response.status}`);
        }
        return response.text();
      })
      .then((data) => {
        // console.log("Logout Response:", data);
        alert("Logout successful!");
        localStorage.removeItem("token");
        localStorage.removeItem("isAdmin");
        window.location.href = "../login/login.html";
      })
      .catch((error) => {
        console.error("Logout Error:", error);
        alert("Error logging out! Please try again.");
      });
  }