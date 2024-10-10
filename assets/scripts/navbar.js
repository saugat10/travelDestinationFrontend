import { showNotification } from "./notification.js";

fetch("./navbar.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("navbar-placeholder").innerHTML = data;
    const hamburger = document.getElementById("hamburger");
    const navbarLinks = document.getElementById("navbarLinks");
    const signInModal = document.getElementById("signInModal");
    const signInBtn = document.getElementById("signInBtn");
    const closeModal = document.getElementById("closeModal");
    const signUpModal = document.getElementById("signUpModal");
    const signUpBtn = document.getElementById("signUpBtn");
    const closeSignUpModal = document.getElementById("closeSignUpModal");
    const signInForm = document.getElementById("signInForm");
    const signUpForm = document.getElementById("signUpForm");
    const notification = document.getElementById("notification");
    const profileBtn = document.getElementById("profileBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    hamburger.addEventListener("click", () => {
      navbarLinks.classList.toggle("active");
    });

    signInBtn.addEventListener("click", function (e) {
      e.preventDefault();
      signInModal.style.display = "block";
    });

    closeModal.addEventListener("click", function () {
      signInModal.style.display = "none";
    });

    window.addEventListener("click", function (e) {
      if (e.target == signInModal) {
        signInModal.style.display = "none";
      }

      if (e.target == signUpModal) {
        signUpModal.style.display = "none";
      }
    });

    signUpBtn.addEventListener("click", function (e) {
      e.preventDefault();
      signUpModal.style.display = "block";
    });

    closeSignUpModal.addEventListener("click", function () {
      signUpModal.style.display = "none";
    });

    signInForm.addEventListener("submit", async function (e) {
      e.preventDefault(); // Prevent default form submission

      // Get form inputs
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      // Make the POST request to the backend
      try {
        const response = await fetch("http://localhost:8080/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }), // Send email and password as JSON
        });

        const data = await response.json();

        if (response.ok) {
          sessionStorage.setItem("token", data.token);

          showNotification("Sign in successful!", "success");
          signInModal.style.display = "none";
          signInBtn.classList.add("hidden");
          signUpBtn.classList.add("hidden");
          profileBtn.classList.remove("hidden");
          signOutBtn.classList.remove("hidden");
          //TODO:
          // - maybe do not redirect but just log in
          // - show navbar as signed up user as well
          // - close popup
        } else {
          showNotification(`Sign up failed: ${data.message}`, "error");
        }
      } catch (error) {
        showNotification("An error occurred while signing up. Please try again.", "error");
      }
    });

    // handle new user sign up form input fields
    document.getElementById("signUpForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const userObj = {
        firstname: document.getElementById("firstname").value,
        lastname: document.getElementById("lastname").value,
        username: document.getElementById("username").value,
        email: document.getElementById("signUpEmail").value,
        password: document.getElementById("signUpPassword").value,
        confirmPassword: document.getElementById("signUpConfirmPassword").value,
      };
      const password = document.getElementById("signUpPassword").value;
      const confirmPassword = document.getElementById("signUpConfirmPassword").value;

      // check for password confirmation before the user object is sent to the api endpoint
      if (password !== confirmPassword) {
        document.getElementById("signUpPasswordError").textContent = "Passwords do not match";
        document.getElementById("signUpConfirmPasswordError").textContent =
          "Passwords do not match";
        // end the function if passwords don't match
        return;
      }
      const response = await createUser(userObj);

      // If mongoose errors in the response, validate
      if (response.error) {
        if (response.error.firstname) {
          document.getElementById("firstnameError").textContent =
            response.error.firstname.message || "Invalid first name";
        } else {
          document.getElementById("firstnameError").textContent = "";
        }
        if (response.error.lastname) {
          document.getElementById("lastnameError").textContent =
            response.error.lastname.message || "Invalid last name";
        } else {
          document.getElementById("lastnameError").textContent = "";
        }
        if (response.error.username) {
          document.getElementById("usernameError").textContent =
            response.error.username.message || "Invalid user name";
        } else {
          document.getElementById("usernameError").textContent = "";
        }
        if (response.error.email) {
          document.getElementById("signUpEmailError").textContent =
            response.error.email.message || "Invalid email";
        } else {
          document.getElementById("signUpEmailError").textContent = "";
        }
        if (response.error.password) {
          document.getElementById("signUpPasswordError").textContent =
            response.error.password.message || "Invalid password";
        } else {
          document.getElementById("signUpPasswordError").textContent = "";
        }
      } else {
        // clear all error messages
        document.querySelectorAll(".errorMessage").forEach((error) => {
          error.textContent = "";
        });
        // clear all input fields
        document.querySelectorAll(".signUpField").forEach((field) => {
          field.value = "";
        });
        console.log("User registered successfully:", response);
      }
    });

    // send the new user object to the api endpoint
    async function createUser(user) {
      try {
        const response = await fetch("http://127.0.0.1:8080/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        });
        const result = await response.json();
        return result;
      } catch (error) {
        console.error(error.message);
      }
    }

    signOutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      sessionStorage.removeItem("token");
      window.location.href = "../../pages/index.html";
    });

    const token = sessionStorage.getItem("token");
    if (token) {
      signInBtn.classList.add("hidden");
      signUpBtn.classList.add("hidden");
      profileBtn.classList.remove("hidden");
      signOutBtn.classList.remove("hidden");
    } else {
      signInBtn.classList.remove("hidden");
      signUpBtn.classList.remove("hidden");
      profileBtn.classList.add("hidden");
      signOutBtn.classList.add("hidden");
    }
  });
