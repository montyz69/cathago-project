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

function redirectToApproveRequests() {
    window.location.href = "../approverequests/approve.html";
}

function redirectToDashboard() {
    window.location.href = "../dashboard/dashboard.html";
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

function openDialog(dialogId) {
    let dialog = document.getElementById(dialogId);
    if (dialog) {
      dialog.style.display = "block";
    } else {
      console.error("Dialog element not found:", dialogId);
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

  function scanDocument() {
    let fileInput = document.getElementById("fileInput");
    let file = fileInput?.files[0];
    let scanButton = document.getElementById("scanDocumentsBtnin");
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
        // console.log("Scan Response:", data);
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
        const fileinput = document.getElementById("fileInput");
        fileinput.value = "";
        loader.style.display = "none";
        scanButton.disabled = false;
        scanButton.innerHTML = "Scan";
      });
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


  function updateMatchedDocumentsTable(matchedDocs) {
    const tableBody = document.getElementById("matchedDocumentsBody");
    tableBody.innerHTML = ""; 
  
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


  document.addEventListener("DOMContentLoaded", function () {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (isAdmin) {
      const approveRequestsBtn = document.getElementById("approveRequestsBtn");
      if (approveRequestsBtn) {
        approveRequestsBtn.style.display = "inline-block";
      }
      const dashboardBtn = document.getElementById("dashboardBtn");
      if (dashboardBtn) {
        dashboardBtn.style.display = "inline-block";
      }
      const addStoreDocumentBtn = document.getElementById("addStoreDocumentBtn");
      if (addStoreDocumentBtn) {
        addStoreDocumentBtn.style.display = "inline-block";
      }
    }
  });


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
        // console.log("Upload Response:", data);
        alert("Upload successful!");
        document.getElementById("UploadDialog").style.display = "none";
        fetchUserProfile();
      })
      .catch((error) => {
        console.error("Upload Error:", error);
        alert(`An error occurred: ${error.message}`);
      });
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

      const blob = await response.blob();
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


  function deleteDocument(fileId) {
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
          alert("Delete successful!");
          fetchUserProfile();
        })
        .catch((error) => {
          console.error("Delete Error:", error);
          alert(`An error occurred: ${error.message}`);
        });
    }
  }