document.addEventListener("DOMContentLoaded", () => {

  const capabilitiesList = document.getElementById("capabilities-list");
  const registerModal = document.getElementById("register-modal");
  const closeModalBtn = document.getElementById("close-modal");
  const registerForm = document.getElementById("register-form");
  const emailInput = document.getElementById("email");
  const capabilityInput = document.getElementById("capability");
  const messageDiv = document.getElementById("message");

  // Function to fetch capabilities from API
  async function fetchCapabilities() {
    try {
      const response = await fetch("/capabilities");
      const capabilities = await response.json();

      // Clear loading message
      capabilitiesList.innerHTML = "";

      // Populate capabilities list with card layout and quick-view info
      Object.entries(capabilities).forEach(([name, details]) => {
        const card = document.createElement("div");
        card.className = "capability-card";
        card.tabIndex = 0;
        card.setAttribute("role", "region");
        card.setAttribute("aria-label", name);

        // Byte mascot badge
        const byteBadge = document.createElement("img");
        byteBadge.src = "https://colby-timm.github.io/images/byte-celebrate.png";
        byteBadge.alt = "Byte mascot";
        byteBadge.className = "byte-badge";
        card.appendChild(byteBadge);

        // Capability name
        const h4 = document.createElement("h4");
        h4.textContent = name;
        card.appendChild(h4);

        // Meta info
        const meta = document.createElement("div");
        meta.className = "capability-meta";
        // Skill level
        if (details.skill_level) {
          const skill = document.createElement("span");
          skill.className = "meta-badge";
          skill.title = "Skill Level";
          skill.innerHTML = `<svg width=\"16\" height=\"16\" fill=\"#003d7a\" style=\"vertical-align:middle;\" viewBox=\"0 0 24 24\"><path d=\"M12 2l2.09 6.26L20 9.27l-5 3.64L16.18 20 12 16.9 7.82 20 9 12.91l-5-3.64 5.91-.99z\"/></svg> ${details.skill_level}`;
          meta.appendChild(skill);
        }
        // Capacity
        if (details.capacity !== undefined) {
          const capBadge = document.createElement("span");
          capBadge.className = "meta-badge";
          capBadge.title = "Consultant Capacity";
          capBadge.innerHTML = `<svg width=\"16\" height=\"16\" fill=\"#003d7a\" style=\"vertical-align:middle;\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" font-size=\"12\" fill=\"#fff\">${details.capacity}</text></svg> ${details.capacity} open`;
          meta.appendChild(capBadge);
        }
        // Certifications
        if (details.certifications && details.certifications.length > 0) {
          details.certifications.forEach(cert => {
            const certBadge = document.createElement("span");
            certBadge.className = "meta-badge";
            certBadge.title = "Certification";
            certBadge.innerHTML = `<svg width=\"16\" height=\"16\" fill=\"#003d7a\" style=\"vertical-align:middle;\" viewBox=\"0 0 24 24\"><path d=\"M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z\"/></svg> ${cert}`;
            meta.appendChild(certBadge);
          });
        }
        card.appendChild(meta);

        // Description
        const desc = document.createElement("div");
        desc.className = "capability-info";
        desc.textContent = details.description;
        card.appendChild(desc);

        // Register button
        const regBtn = document.createElement("button");
        regBtn.className = "register-btn";
        regBtn.textContent = "Register Expertise";
        regBtn.setAttribute("aria-label", `Register expertise for ${name}`);
        regBtn.onclick = () => openRegisterModal(name);
        card.appendChild(regBtn);

        capabilitiesList.appendChild(card);
      });
    } catch (error) {
      capabilitiesList.innerHTML =
        "<p>Failed to load capabilities. Please try again later.</p>";
      console.error("Error fetching capabilities:", error);
    }
  }

  function openRegisterModal(capName) {
    registerModal.classList.remove("hidden");
    capabilityInput.value = capName;
    emailInput.value = "";
    messageDiv.className = "hidden";
    messageDiv.textContent = "";
    emailInput.focus();
  }

  function closeRegisterModal() {
    registerModal.classList.add("hidden");
  }

  closeModalBtn.addEventListener("click", closeRegisterModal);
  closeModalBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") closeRegisterModal();
  });

  // Accessibility: close modal on Escape
  window.addEventListener("keydown", (e) => {
    if (!registerModal.classList.contains("hidden") && e.key === "Escape") closeRegisterModal();
  });

  // Handle form submission
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value;
    const capability = capabilityInput.value;

    try {
      const response = await fetch(
        `/capabilities/${encodeURIComponent(
          capability
        )}/register?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message || "Expertise registered successfully!";
        messageDiv.className = "message success";
        registerForm.reset();
        setTimeout(closeRegisterModal, 1200);
        fetchCapabilities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "message error";
      }

      messageDiv.classList.remove("hidden");
    } catch (error) {
      messageDiv.textContent = "Failed to register. Please try again.";
      messageDiv.className = "message error";
      messageDiv.classList.remove("hidden");
      console.error("Error registering:", error);
    }
  });

  // Initial render
  fetchCapabilities();

  // Handle unregister functionality
  async function handleUnregister(event) {
    const button = event.target;
    const capability = button.getAttribute("data-capability");
    const email = button.getAttribute("data-email");

    try {
      const response = await fetch(
        `/capabilities/${encodeURIComponent(
          capability
        )}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";

        // Refresh capabilities list to show updated consultants
        fetchCapabilities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to unregister. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error unregistering:", error);
    }
  }

  // Handle form submission
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const capability = document.getElementById("capability").value;

    try {
      const response = await fetch(
        `/capabilities/${encodeURIComponent(
          capability
        )}/register?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        registerForm.reset();

        // Refresh capabilities list to show updated consultants
        fetchCapabilities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to register. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error registering:", error);
    }
  });

  // Initialize app
  fetchCapabilities();
});
