function fetchDashboard() {
    fetchUserProfile();
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (!localStorage.getItem("token")) {
      alert("You must be logged in to view this page.");
      window.location.href = "../login/login.html";
      return;
    }
    fetchScans();
    fetchTopUsers();
    
  }

function fetchTopUsers() {
    fetch("http://localhost:3000/api/admin/topusers",{
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token"),
        },
    })
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("topUsersTableBody");
            tableBody.innerHTML = "";
  
            data.forEach(user => {
                const row = document.createElement("tr");
  
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.scan_count}</td>
                    <td>${user.credits}</td>
                `;
  
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error("Error fetching top users:", error));
  }
  
  
  function fetchScans(date = "") {
    fetch(`http://localhost:3000/api/admin/scansperday?date=${date}`,{
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token"),
        },
    })
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("scansTableBody");
            tableBody.innerHTML = ""; // Clear previous data
  
            data.forEach(scan => {
                const row = document.createElement("tr");
  
                row.innerHTML = `
                    <td>${scan.id}</td>
                    <td>${scan.username}</td>
                    <td>${scan.scan_date}</td>
                    <td>${scan.scan_count}</td>
                `;
  
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error("Error fetching scans:", error));
  }
  
  function handleDateChange() {
    const selectedDate = document.getElementById("scanDatePicker").value;
    fetchScans(selectedDate);
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


  document.addEventListener("DOMContentLoaded", function () {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (isAdmin) {
      const approveRequestsBtn = document.getElementById("approveRequestsBtn");
      if (approveRequestsBtn) {
        approveRequestsBtn.style.display = "inline-block";
      }
      const homebtn = document.getElementById("homebtn");
    if (homebtn) {
      homebtn.style.display = "inline-block";
    }
      
    }
  });

  function redirectToApproveRequests() {
    window.location.href = "../approverequests/approve.html";
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

function redirectToHome() {
    window.location.href = "../home/home.html";
  }