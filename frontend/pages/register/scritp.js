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
      // console.log(response);
  
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