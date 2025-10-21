// ===================== LOGIN GRAPHICAL PASSWORD =====================
let loginCurrentStep = 0;
let loginSequence = [];
let loginModal;
let loginUserImages = [];

// ----- Open Login Modal -----
function openLoginGraphicalModal() {
  loginCurrentStep = 0;
  loginSequence = [];
  loginModal = document.getElementById("login-graphical-modal");
  loginModal.innerHTML = "";

  loadLoginUserImages().then(() => {
    if (loginUserImages.length > 0) {
      showLoginStep();
      loginModal.classList.remove("hidden");
    } else {
      alert("Please enter a valid email and ensure images are uploaded.");
    }
  });
}

// ----- Load User Images -----
async function loadLoginUserImages() {
  const emailInput = document.getElementById("email-input");
  if (!emailInput || !emailInput.value.trim()) {
    alert("Please enter your email first");
    return;
  }

  const email = emailInput.value.trim();
  try {
    const res = await fetch(`http://localhost:8000/auth/images?email=${encodeURIComponent(email)}`);
    if (res.ok) {
      const data = await res.json();
      loginUserImages = data.images || [];
    } else {
      loginUserImages = [];
    }
  } catch (err) {
    console.error("Error loading images:", err);
    loginUserImages = [];
  }
}

// ----- Show Image + Shuffled Grid -----
function showLoginStep() {
  if (!loginUserImages.length) return alert("No images found");

  const container = document.createElement("div");
  container.className = "grid-container";
  container.style.position = "relative";
  container.style.width = "550px";
  container.style.height = "550px";

  // Show current image
  const imgData = loginUserImages[loginCurrentStep % loginUserImages.length];
  const img = document.createElement("img");
  img.src = `data:${imgData.content_type};base64,${imgData.data}`;
  img.className = "graphical-image";
  img.style.width = "100%";
  img.style.height = "100%";
  img.style.position = "absolute";
  container.appendChild(img);

  // Shuffled 3x3 grid
  const positions = Array.from({ length: 9 }, (_, i) => i).sort(() => Math.random() - 0.5);
  positions.forEach(pos => {
    const row = Math.floor(pos / 3);
    const col = pos % 3;
    const cell = document.createElement("div");
    cell.className = "grid-cell";
    cell.style.position = "absolute";
    cell.style.width = "33.3%";
    cell.style.height = "33.3%";
    cell.style.top = `${row * 33.3}%`;
    cell.style.left = `${col * 33.3}%`;
    cell.dataset.row = row;
    cell.dataset.col = col;
    cell.onclick = handleLoginGridClick;
    container.appendChild(cell);
  });

  loginModal.innerHTML = "";
  loginModal.appendChild(container);
}

// ----- Handle Grid Click -----
function handleLoginGridClick(e) {
  const row = e.target.dataset.row;
  const col = e.target.dataset.col;
  loginSequence.push(`${row}${col}`);

  e.target.style.pointerEvents = "none";
  e.target.style.backgroundColor = "rgba(134, 114, 255, 0.4)";
  e.target.style.border = "2px solid var(--accent-color)";

  loginCurrentStep++;

  if (loginCurrentStep < 5) {
    setTimeout(showLoginStep, 300);
  } else {
    setTimeout(() => {
      loginModal.classList.add("hidden");
      document.getElementById("login-graphical-password").value = loginSequence.join("-");
      verifyLoginGraphicalPassword();
    }, 300);
  }
}

// ----- Verify Graphical Password -----
async function verifyLoginGraphicalPassword() {
  const email = document.getElementById("email-input").value.trim();
  const sequence = loginSequence.map((step, index) => ({
    image_index: index % loginUserImages.length,
    grid: [step],
  }));

  try {
    const res = await fetch("http://localhost:8000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password_sequence: sequence }),
    });

    if (res.ok) {
      const result = await res.json();
      // Redirect to login-success.html with firstname
      window.location.href = `Login_success.html?firstname=${encodeURIComponent(result.firstname)}`;
    } else {
      const error = await res.json();
      alert("❌ Login failed: " + error.detail);
    }
  } catch (err) {
    console.error("Network error:", err);
    alert("Could not reach backend. Is FastAPI running?");
  }
}
