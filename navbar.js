fetch('navbar.html')
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

  hamburger.addEventListener('click', () => {
    navbarLinks.classList.toggle('active');
  });
  
  
  signInBtn.addEventListener('click', function(e) {
      e.preventDefault();  
      signInModal.style.display = 'block';  
  });
  
  
  closeModal.addEventListener('click', function() {
      signInModal.style.display = 'none';  
  });
  
  window.addEventListener('click', function(e) {
      if (e.target == signInModal) {
        signInModal.style.display = 'none';  
      }
  
      if (e.target == signUpModal) {
          signUpModal.style.display = 'none';  
      }
  });
  
  signUpBtn.addEventListener('click', function(e) {
      e.preventDefault();  
      signUpModal.style.display = 'block';  
  });
  
  closeSignUpModal.addEventListener('click', function() {
      signUpModal.style.display = 'none';
  });
});


