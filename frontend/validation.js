// const form = document.getElementById('form');
// const firstname_input = document.getElementById('firstname-input');
// const email_input = document.getElementById('email-input');
// const error_message = document.getElementById('error-message');

// form.addEventListener('submit', async (e) => {
//   e.preventDefault();

//   let errors = [];
//   let url;
//   let payload;

//   if (firstname_input) {
//     // ================== SIGNUP ==================
//     const graphicalPasswordInput = document.getElementById('signup-graphical-password');
//     const graphicalPassword = graphicalPasswordInput ? graphicalPasswordInput.value : '';

//     errors = getSignupFormErrors(firstname_input.value, email_input.value, graphicalPassword);

//     payload = {
//       firstname: firstname_input.value,
//       email: email_input.value,
//       graphical_password: graphicalPassword,
//       user_images: "imported", // placeholder until images are uploaded
//     };

//     url = "http://localhost:8000/auth/signup";

//     if (errors.length > 0) {
//       error_message.innerText = errors.join(". ");
//       return;
//     }

//     // send as FormData for signup
//     const formData = new FormData();
//     Object.entries(payload).forEach(([key, value]) => formData.append(key, value));

//     try {
//       const res = await fetch(url, {
//         method: "POST",
//         body: formData
//       });

//       const result = await res.json();
//       if (!res.ok) {
//         error_message.innerText = result.detail || result.error || "Something went wrong.";
//       } else {
//         error_message.style.color = "green";
//         error_message.innerText = result.message || "Sign up successful";
//         setTimeout(() => {
//           window.location.href = 'login.html';
//         }, 1500);
//       }
//     } catch (err) {
//       error_message.innerText = "Server Unavailable: " + err.message;
//     }

//   } else {
//     // ================== LOGIN ==================
//     const graphicalPasswordInput = document.getElementById('login-graphical-password');
//     const graphicalPassword = graphicalPasswordInput ? graphicalPasswordInput.value : '';

//     errors = getLoginFormErrors(email_input.value, graphicalPassword);

//     if (errors.length > 0) {
//       error_message.innerText = errors.join(". ");
//       return;
//     }

//     url = "http://localhost:8000/auth/login";
//     payload = {
//       email: email_input.value,
//       password_sequence: graphicalPassword.split("-") // ✅ convert "00-11-22" → ["00","11","22"]
//     };

//     try {
//       const res = await fetch(url, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload)
//       });

//       const result = await res.json();
//       if (!res.ok) {
//         error_message.innerText = result.detail || "Username or Incorrect password";
//       } else {
//         window.location.href = 'login-success.html';
//       }
//     } catch (err) {
//       error_message.innerText = "Server Unavailable: " + err.message;
//     }
//   }
// });

// function getSignupFormErrors(firstname, email, graphicalPassword) {
//   let errors = [];
//   if (firstname === '' || firstname == null) errors.push('Firstname is required');
//   if (email === '' || email == null) errors.push('Email is required');
//   if (graphicalPassword === '' || graphicalPassword == null) errors.push('Graphical password is required');
//   return errors;
// }

// function getLoginFormErrors(email, graphicalPassword) {
//   let errors = [];
//   if (email === '' || email == null) errors.push('Email is required');
//   if (graphicalPassword === '' || graphicalPassword == null) errors.push('Graphical password is required');
//   return errors;
// }
