// ============================================================
// SIGNUP GRAPHICAL PASSWORD FLOW
// ============================================================

// ----- Global Variables -----
let signupCurrentStep = 0;
let signupSequence = [];
let signupUserImages = [];
let signupFirstname = "";
let signupEmail = "";
let signupImages = []; // local imported images

// DOM elements (assigned later)
let signupModal, signupPasswordInput, signupStatusText;


// ============================================================
// IMAGE IMPORT MODAL CLASS
// ============================================================
class ImageImportModal {
  constructor() {
    this.modal = null;
    this.form = null;
    this.emailInput = null;
    this.fileInput = null;
    this.preview = null;
    this.statusMessage = null;
    this.closeBtn = null;

    this.init();
  }

  init() {
    this.createModal();
    this.bindEvents();
  }

  createModal() {
    if (document.getElementById("image-import-modal")) {
      this.modal = document.getElementById("image-import-modal");
    } else {
      const modalHTML = `
        <div id="image-import-modal" class="modal hidden">
          <div class="modal-content">
            <div class="modal-header">
              <h2>Import Your Images</h2>
              <button class="close-modal" aria-label="Close modal">&times;</button>
            </div>
            <div class="modal-body">
              <p>Select up to 5 images from your local machine to use for your graphical password.</p>
              
              <form id="image-import-form-modal">
                <div class="form-group">
                  <label for="email-modal">Email:</label>
                  <input type="email" id="email-modal" name="email" required readonly>
                </div>
                
                <div class="form-group">
                  <label for="images-modal">Select Images:</label>
                  <input type="file" id="images-modal" name="images" multiple accept="image/*" required>
                </div>
                
                <div id="image-preview-modal" class="image-preview"></div>
                
                <button type="submit" class="btn-primary">Import Images</button>
              </form>
              
              <div id="status-message-modal"></div>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML("beforeend", modalHTML);
      this.modal = document.getElementById("image-import-modal");
    }

    this.form = document.getElementById("image-import-form-modal");
    this.emailInput = document.getElementById("email-modal");
    this.fileInput = document.getElementById("images-modal");
    this.preview = document.getElementById("image-preview-modal");
    this.statusMessage = document.getElementById("status-message-modal");
    this.closeBtn = this.modal.querySelector(".close-modal");
  }

  bindEvents() {
    this.fileInput.addEventListener("change", (e) => this.handleImagePreview(e));
    this.form.addEventListener("submit", (e) => this.handleFormSubmit(e));
    this.closeBtn.addEventListener("click", () => this.close());
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) this.close();
    });
  }

  handleImagePreview(e) {
    const files = e.target.files;
    this.preview.innerHTML = "";

    if (files.length > 5) {
      alert("Please select a maximum of 5 images");
      this.fileInput.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    for (let file of files) {
      if (file.size > maxSize) {
        alert(`${file.name} is too large (max 5MB).`);
        this.fileInput.value = "";
        this.preview.innerHTML = "";
        return;
      }

      if (file.type.startsWith("image/")) {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.style.maxWidth = "80px";
        img.style.maxHeight = "80px";
        img.style.margin = "5px";
        this.preview.appendChild(img);
      }
    }
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    const email = this.emailInput.value;
    const files = this.fileInput.files;

    if (files.length === 0) {
      this.statusMessage.textContent = "Please select at least one image";
      this.statusMessage.style.color = "orange";
      return;
    }

    const formData = new FormData();
    formData.append("email", email);
    for (let file of files) {
      formData.append("images", file);
    }

    this.statusMessage.textContent = "Uploading images...";
    this.statusMessage.style.color = "blue";

    try {
      const response = await fetch("http://localhost:8000/images/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        this.statusMessage.textContent = `Successfully uploaded ${result.count} images!`;
        this.statusMessage.style.color = "green";

        signupImages = Array.from(files);

        this.form.reset();
        this.clearPreview();

        await new Promise(resolve => setTimeout(resolve, 3000));

        this.close();
        if (window.onImagesImported) {
          window.onImagesImported(email);
        }
      } else {
        this.statusMessage.textContent = result.detail || "Error uploading images";
        this.statusMessage.style.color = "red";
      }
    } catch (error) {
      this.statusMessage.textContent = "Network error: " + error.message;
      this.statusMessage.style.color = "red";
    }
  }

  clearPreview() {
    for (let img of this.preview.querySelectorAll("img")) {
      URL.revokeObjectURL(img.src);
    }
    this.preview.innerHTML = "";
  }

  open(email) {
    this.emailInput.value = email;
    this.modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  close() {
    this.modal.classList.add("hidden");
    document.body.style.overflow = "";
    this.form.reset();
    this.clearPreview();
    this.statusMessage.textContent = "";
  }
}

window.imageImportModal = new ImageImportModal();


// ============================================================
// DOM READY EVENT
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  const setGraphicalPasswordBtn = document.getElementById("set-graphical-password-btn");
  const finalSignupBtn = document.getElementById("final-signup-btn");

  if (setGraphicalPasswordBtn) {
    setGraphicalPasswordBtn.addEventListener("click", handleSetGraphicalPasswordClick);
  }
  if (finalSignupBtn) {
    finalSignupBtn.addEventListener("click", handleFinalSignupClick);
  }

  window.onImagesImported = function (email) {
    console.log("Images imported, proceeding to graphical password setup");
    openSignupGraphicalModal();
  };
});


// ============================================================
// STEP 1: CREATE USER
// ============================================================
async function handleSetGraphicalPasswordClick() {
  signupEmail = document.getElementById("email-input").value;
  signupFirstname = document.getElementById("firstname-input").value;

  if (!signupEmail) return alert("Please enter your email first");
  if (!signupFirstname) return alert("Please enter your first name");

  try {
    const formDataSignup = new FormData();
    formDataSignup.append("firstname", signupFirstname);
    formDataSignup.append("email", signupEmail);

    const response = await fetch("http://localhost:8000/auth/signup", {
      method: "POST",
      body: formDataSignup,
    });

    if (!response.ok) throw new Error("User creation failed");

    const result = await response.json();
    console.log("User created:", result);

    window.imageImportModal.open(signupEmail);
  } catch (err) {
    console.error(err);
    alert("Error creating user: " + err.message);
  }
}


// ============================================================
// STEP 2: OPEN GRAPHICAL PASSWORD MODAL
// ============================================================
function openSignupGraphicalModal() {
  signupCurrentStep = 0;
  signupSequence = [];
  signupModal = document.getElementById("signup-graphical-modal");
  signupPasswordInput = document.getElementById("signup-graphical-password");
  signupStatusText = document.getElementById("signup-password-status");

  if (signupImages.length > 0) {
    signupUserImages = signupImages.map((file) => ({
      content_type: file.type,
      file,
    }));
    showSignupStep(0);
    signupModal.classList.remove("hidden");
  } else {
    alert("Please import images first using the image import feature");
  }
}


// ============================================================
// STEP 3: SHOW IMAGE + GRID
// ============================================================


function showSignupStep(rotationAngle = 0) {
  if (signupUserImages.length === 0) {
    alert("No user images found. Please import images first.");
    return;
  }

  const container = document.createElement("div");
  container.className = "grid-container";
  container.style.position = "relative";
  container.style.width = "550px";
  container.style.height = "550px";
  container.style.transform = `rotate(${rotationAngle}deg)`;
  container.style.transformOrigin = "center center";

  const imageData = signupUserImages[signupCurrentStep % signupUserImages.length];
  const image = document.createElement("img");
  image.src = URL.createObjectURL(imageData.file);
  image.className = "graphical-image";
  image.alt = "Graphical password image";
  image.style.width = "100%";
  image.style.height = "100%";
  image.style.position = "absolute";
  image.style.zIndex = 1;
  container.appendChild(image);

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const cell = document.createElement("div");
      cell.className = "grid-cell";
      cell.style.position = "absolute";
      cell.style.width = "33.3%";
      cell.style.height = "33.3%";
      cell.style.top = `${row * 33.3}%`;
      cell.style.left = `${col * 33.3}%`;
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.style.zIndex = 2;
      cell.style.cursor = "pointer";
      cell.addEventListener("click", handleSignupGridClick);
      container.appendChild(cell);
    }
  }

  signupModal.innerHTML = "";
  signupModal.appendChild(container);
}

// ============================================================
// STEP 4: HANDLE SIGNUP GRID CLICKS
// ============================================================
async function handleSignupGridClick(e) {
  const cell = e.currentTarget;
  const row = cell.dataset.row;
  const col = cell.dataset.col;
  signupSequence.push(`${row}${col}`);
  signupCurrentStep++;

  // 🔹 Visual feedback
  cell.style.pointerEvents = "none";
  cell.style.backgroundColor = "rgba(134, 114, 255, 0.4)";
  cell.style.border = "2px solid var(--accent-color)";
  cell.style.transition = "all 0.3s ease";

  if (signupCurrentStep < 5) {
    setTimeout(() => showSignupStep(0), 300);
  } else {
    setTimeout(async () => {
      signupModal.classList.add("hidden");
      signupPasswordInput.value = signupSequence.join("-");

      try {
        const sequence = signupSequence.map((step, index) => ({
          image_index: index % signupImages.length,
          grid: [step],
        }));

        const formDataPassword = new FormData();
        formDataPassword.append("email", signupEmail);
        formDataPassword.append("password_sequence", JSON.stringify(sequence));

        const response = await fetch("http://localhost:8000/images/set-password", {
          method: "POST",
          body: formDataPassword,
        });

        if (!response.ok) throw new Error("Password save failed");

        const result = await response.json();
        alert("Graphical password saved: " + result.message);
      } catch (err) {
        console.error(err);
        alert("Error saving graphical password: " + err.message);
      }
    }, 300);
  }
}

// ============================================================
// STEP 5: HANDLE LOGIN GRID CLICKS (with checkmark animation)
// ============================================================
function handleLoginGridClick(e) {
  const row = e.target.dataset.row;
  const col = e.target.dataset.col;
  loginSequence.push(`${row}${col}`);

  // ✅ Add checkmark overlay
  const checkmark = document.createElement("div");
  checkmark.className = "checkmark-overlay";
  checkmark.innerHTML = "✓";
  checkmark.style.position = "absolute";
  checkmark.style.top = "50%";
  checkmark.style.left = "50%";
  checkmark.style.transform = "translate(-50%, -50%)";
  checkmark.style.fontSize = "2.5em";
  checkmark.style.color = "#00ff00";
  checkmark.style.fontWeight = "bold";
  checkmark.style.textShadow = "0 0 5px rgba(0, 255, 0, 0.8)";
  checkmark.style.pointerEvents = "none";
  checkmark.style.zIndex = "100";
  checkmark.style.animation = "checkmarkPop 0.3s ease-in-out";

  if (!document.querySelector("#checkmark-animation-style")) {
    const style = document.createElement("style");
    style.id = "checkmark-animation-style";
    style.textContent = `
      @keyframes checkmarkPop {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  e.target.appendChild(checkmark);

  // 🔹 Disable cell
  e.target.style.pointerEvents = "none";
  e.target.style.backgroundColor = "rgba(134, 114, 255, 0.4)";
  e.target.style.border = "2px solid var(--accent-color)";
  e.target.style.transition = "all 0.3s ease";
}

// ============================================================
// STEP 5: FINALIZE SIGNUP
// ============================================================
async function handleFinalSignupClick(event) {
  event.preventDefault(); // 🔹 stop form from refreshing the page

  if (!signupEmail || !signupFirstname) {
    alert("Missing signup info (email or firstname)");
    return;
  }
  if (signupSequence.length < 5) {
    alert("Please complete graphical password first");
    return;
  }

  try {
    const sequence = signupSequence.map((step, index) => ({
      image_index: index % signupImages.length,
      grid: [step],
    }));

    const formDataPassword = new FormData();
    formDataPassword.append("email", signupEmail);
    formDataPassword.append("password_sequence", JSON.stringify(sequence));

    const response = await fetch("http://localhost:8000/images/set-password", {
      method: "POST",
      body: formDataPassword,
    });

    if (!response.ok) throw new Error("Password save failed");

    const result = await response.json();

    if (result.status && result.status.toLowerCase() === "active") {
      alert("User successfully registered!");
      if (result.redirect) {
        window.location.href = result.redirect; // 🔹 backend-provided redirect
      } else {
        window.location.href = "/login.html";   // fallback
      }
    } else {
      alert("Signup incomplete. User status: " + (result.status || "unknown"));
    }
  } catch (err) {
    console.error(err);
    alert("Error during final signup: " + err.message);
  }
}
