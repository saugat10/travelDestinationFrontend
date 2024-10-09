import { showNotification } from "./notification.js";

fetch('./navbar.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('navbar-placeholder').innerHTML = data;
    const hamburger = document.getElementById('hamburger');
    const navbarLinks = document.getElementById('navbarLinks');
    const signInModal = document.getElementById('signInModal');
    const signInBtn = document.getElementById('signInBtn');
    const closeModal = document.getElementById('closeModal');
    const signUpModal = document.getElementById('signUpModal');
    const signUpBtn = document.getElementById('signUpBtn');
    const closeSignUpModal = document.getElementById('closeSignUpModal');
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const notification = document.getElementById('notification');

    hamburger.addEventListener('click', () => {
      navbarLinks.classList.toggle('active');
    });


    signInBtn.addEventListener('click', function (e) {
      e.preventDefault();
      signInModal.style.display = 'block';
    });


    closeModal.addEventListener('click', function () {
      signInModal.style.display = 'none';
    });

    window.addEventListener('click', function (e) {
      if (e.target == signInModal) {
        signInModal.style.display = 'none';
      }

      if (e.target == signUpModal) {
        signUpModal.style.display = 'none';
      }
    });

    signUpBtn.addEventListener('click', function (e) {
      e.preventDefault();
      signUpModal.style.display = 'block';
    });

    closeSignUpModal.addEventListener('click', function () {
      signUpModal.style.display = 'none';
    });

    signInForm.addEventListener('submit', async function (e) {
      e.preventDefault(); // Prevent default form submission

      // Get form inputs
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      // Make the POST request to the backend
      try {
        const response = await fetch('http://localhost:8080/api/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password }) // Send email and password as JSON
        });

        const data = await response.json();

        if (response.ok) {
          sessionStorage.setItem('token', data.token);

          showNotification('Sign in successful!', 'success');
          //TODO: 
          // - maybe do not redirect but just log in 
          // - show navbar as signed up user as well
          // - close popup
        
        } else {
          showNotification(`Sign up failed: ${data.message}`, 'error');
        }
      } catch (error) {
        showNotification('An error occurred while signing up. Please try again.', 'error');
      }
    });

    signUpForm.addEventListener('submit', async function (e) {
      e.preventDefault(); // Prevent default form submission

      // Get form inputs
      const firstname = document.getElementById('firstName').value;
      const lastname = document.getElementById('lastName').value;
      const username = document.getElementById('userName').value;
      const email = document.getElementById('signUpEmail').value;
      const password = document.getElementById('signUpPassword').value;

      // Make the POST request to the backend
      try{
        const response = await fetch('http://localhost:8080/api/users',{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ firstname, lastname, username, email, password }) // Send user details as JSON
        });
        const data = await response.json();

        if(response.ok){
          showNotification('Sign up successful!', 'success');
          setTimeout(() => {
            if(signUpModal){
              signUpModal.style.display = 'none';
            }
            window.location.href = '../../pages/index.html';
          },1000);
          
          
        } else{
          showNotification(`Sign up failed: ${data.message}`, 'error');;
        }
      }catch(e){
        showNotification("An error occurred", e.message, 'error');
      }
    });
    
  });
