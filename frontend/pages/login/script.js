document.addEventListener("DOMContentLoaded", function () {
    let loginForm = document.getElementById("loginForm");
    if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      // console.log("Login form submitted"); 
  
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
  }
  });