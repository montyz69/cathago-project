document.addEventListener("DOMContentLoaded", function () {
  let scanButton = document.getElementById("scanDocumentsBtn");
  if (scanButton) {
    scanButton.addEventListener("click", function () {
      document.getElementById("scanDialog").style.display = "block";
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  let uploadbtn = document.getElementById("addStoreDocumentBtn");
  if (uploadbtn) {
    uploadbtn.addEventListener("click", function () {
      document.getElementById("UploadDialog").style.display = "block";
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  let btn = document.getElementById("requestCreditsBtn");
  if (btn) {
    btn.addEventListener("click", function () {
      document.getElementById("creditsDialog").style.display = "block";
    });
  }
});

function closeDialog(dialogId) {
  document.getElementById(dialogId).style.display = "none";
}

function scanDocument() {
  let fileInput = document.getElementById("fileInput");
  let file = fileInput?.files[0];
  let scanButton = document.getElementById("scanDocumentsBtn");
  let loader = document.getElementById("scanLoader");

  if (!file) {
    alert("Please select a file.");
    return;
  }

  let formData = new FormData();
  formData.append("uploadedFile", file);

  // Show loader and disable the button
  scanButton.disabled = true;
  scanButton.innerHTML = "Scanning...";
  loader.style.display = "block";

  fetch("http://localhost:3000/api/document/scan", {
    method: "POST",
    headers: {
      Authorization: localStorage.getItem("token"),
    },
    body: formData,
  })
    .then(async (response) => {
      if (!response.ok) {
        if (response.status === 406) {
          throw new Error("Insufficient credits. Please recharge your account.");
        } else if (response.status === 400) {
          throw new Error("Invalid request. Please check your file and try again.");
        } else if (response.status === 500) {
          throw new Error("Server error. Please try again later.");
        }
        throw new Error(`Scan failed with status code: ${response.status}`);
      }
      try {
        return await response.json();
      } catch (jsonError) {
        throw new Error("Failed to parse server response. Please try again.");
      }
    })
    .then((data) => {
      console.log("Scan Response:", data);
      alert("Scan successful!");
      document.getElementById("scanDialog").style.display = "none";

      if (data.matchingDocuments && Array.isArray(data.matchingDocuments)) {
        updateMatchedDocumentsTable(data.matchingDocuments);
        fetchUserProfile();
      } else {
        alert("No matching documents found.");
        fetchUserProfile();
      }
    })
    .catch((error) => {
      console.error("Scan Error:", error);
      alert(`An error occurred: ${error.message}`);
    })
    .finally(() => {
      // Hide loader and re-enable button
      loader.style.display = "none";
      scanButton.disabled = false;
      scanButton.innerHTML = "Scan";
    });
}


function updateMatchedDocumentsTable(matchedDocs) {
  const tableBody = document.getElementById("matchedDocumentsBody");
  tableBody.innerHTML = ""; // Clear previous results

  if (matchedDocs.length === 0) {
    document.getElementById("matchedDocumentsTable").style.display = "none";
    return;
  }

  matchedDocs.forEach((doc, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${index + 1}</td>
            <td>${doc.filename || "Unknown"}</td>
            <td>${(doc.similarity * 100).toFixed(2)}%</td>
            <td>
                <button onclick="downloadFile('${doc.id}', '${
      doc.filename
    }')">Download</button>
            </td>
        `;
    tableBody.appendChild(row);
  });

  document.getElementById("matchedDocumentsTable").style.display = "table";
}

function downloadMatchedFile(base64Data, filename) {
  try {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" }); // Change MIME type if needed
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename || "downloaded_file.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("Error downloading file:", error);
  }
}

async function requestCredits() {
  let requestedCredits = document.getElementById("creditsInput").value;
  if (requestedCredits > 0) {
    await fetch("http://localhost:3000/api/user/credits/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({ requestedCredits }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Request Response:", data);
        alert(`Request for ${requestedCredits} credits submitted!`);
        document.getElementById("creditsDialog").style.display = "none";
      })
      .catch((error) => {
        console.error("Request Error:", error);
        alert(`An error occurred: ${error.message}`);
      });
  } else {
    alert("Please enter a valid number of credits.");
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
      console.log("Logout Response:", data);
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

async function register(event) {
  event.preventDefault(); // Prevent form submission from reloading the page

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;

  if (!username || !password || !role) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, role }),
    });
    console.log(response);

    if (response.ok) {
      alert("Registration successful!");
      window.location.href = "../login/login.html";
    } else {
      alert("Registration failed! Please try again.");
    }
  } catch (error) {
    console.error("Error registering:", error);
    alert(
      "An error occurred while registering. Please check your network and try again."
    );
  }
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded"); // Debugging
  let loginForm = document.getElementById("loginForm");

  console.log("loginForm found!");

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    console.log("Login form submitted"); // Debugging

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (username && password) {
      fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.token) {
            alert("Login successful!");
            localStorage.setItem("token", data.token);
            localStorage.setItem("isAdmin", data.isAdmin);
            window.location.href = "../home/home.html";
          } else {
            alert("Invalid credentials!");
          }
        })
        .catch((error) => {
          console.error(error);
          alert("Invalid Creds!");
          document.getElementById("username").value = "";
          document.getElementById("password").value = "";
        });
    } else {
      alert("Please fill in all fields.");
    }
  });
});

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
    console.log("User Profile Data:", data);

    // Update the navbar with username and credits
    document.getElementById("username").textContent = data.username;
    document.getElementById("credits").textContent = data.credits;

    // Show request button only if credits are 0
    document.getElementById("requestCreditsBtn").style.display =
      data.credits === 0 ? "inline-block" : "none";
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

    console.log(documents);

    const tableBody = document.getElementById("documentsBody");
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
  } catch (error) {
    console.error("Failed to fetch store details:", error);
  }
}

async function downloadFile(fileId) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/document/download`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({ id: fileId }),
      }
    );

    if (!response.ok)
      throw new Error(`Error downloading file: ${response.status}`);

    // Convert response to a Blob
    const blob = await response.blob();

    // Create a download link
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "downloaded_file." + response.headers.get("Content-Type");
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("Download failed:", error);
  }
}

function closeDialog(dialogId) {
  const dialog = document.getElementById(dialogId);
  if (dialog) {
    dialog.style.display = "none";
  }
  if (dialogId === "scanDialog") {
    document.getElementById("fileInput").value = "";
  }
}

document.addEventListener("click", function (event) {
  const scanDialog = document.getElementById("scanDialog");
  if (scanDialog && scanDialog.style.display === "block") {
    if (
      !scanDialog.contains(event.target) &&
      event.target.id !== "scanDocumentsBtn"
    ) {
      closeDialog("scanDialog");
    }
  }
});

document.addEventListener("click", function (event) {
  const scanDialog = document.getElementById("creditsDialog");
  if (scanDialog && scanDialog.style.display === "block") {
    if (
      !scanDialog.contains(event.target) &&
      event.target.id !== "requestCreditsBtn"
    ) {
      closeDialog("creditsDialog");
    }
  }
});



function openDialog(dialogId) {
  let dialog = document.getElementById(dialogId);
  if (dialog) {
    dialog.style.display = "block";
  } else {
    console.error("Dialog element not found:", dialogId);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  if (isAdmin) {
    document.getElementById("approveRequestsBtn").style.display =
      "inline-block";
    document.getElementById("dashboardBtn").style.display = "inline-block";
    document.getElementById("addStoreDocumentBtn").style.display =
      "inline-block";
    document.getElementById("homebtn").style.display = "inline-block";
  }
});

function redirectToApproveRequests() {
  window.location.href = "../approverequests/approve.html";
}

function redirectToHome() {
  window.location.href = "../home/home.html";
}

function redirectToDashboard() {
  window.location.href = "../dashboard/dashboard.html";
}

function fetchCreditRequests() {
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
      console.log("Request Response:", data);

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

function uploadDocument() {
  let fileInput = document.getElementById("uploadfileInput");
  let file = fileInput?.files[0];

  if (!file) {
    alert("Please select a file.");
    return;
  }

  let formData = new FormData();
  formData.append("file", file); // Ensure the key matches the backend

  fetch("http://localhost:3000/api/admin/addstore", {
    method: "POST",
    headers: {
      Authorization: localStorage.getItem("token"),
    },
    body: formData,
  })
    .then(async (response) => {
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed.");
      }
      if (!response.ok) {
        throw new Error(`Upload failed with status code: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Upload Response:", data);
      alert("Upload successful!");
      document.getElementById("UploadDialog").style.display = "none";
      fetchUserProfile();
    })
    .catch((error) => {
      console.error("Upload Error:", error);
      alert(`An error occurred: ${error.message}`);
    });
}

function deleteDocument(fileId) {
  console.log(fileId);
  if (confirm("Are you sure you want to delete this document?")) {
    fetch(`http://localhost:3000/api/admin/deleteStore`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({ id: fileId }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Delete failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        alert("Delete successful!");
        fetchUserProfile();
      })
      .catch((error) => {
        console.error("Delete Error:", error);
        alert(`An error occurred: ${error.message}`);
      });
  }
}


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
        console.log("kahsbika",data);
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

