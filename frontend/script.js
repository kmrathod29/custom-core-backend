// Comprehensive fix for Bootstrap offcanvas issues with improved z-index management
document.addEventListener("DOMContentLoaded", function () {
  // Get the offcanvas element
  const mobileSidebar = document.getElementById("mobileSidebar");

  if (mobileSidebar) {
    // Create a single, global offcanvas instance that we'll reuse
    let offcanvasInstance;

    // Function to safely initialize or get the offcanvas instance
    const getOffcanvasInstance = () => {
      // Check if an instance exists
      const existingInstance = bootstrap.Offcanvas.getInstance(mobileSidebar);

      if (existingInstance) {
        return existingInstance;
      } else {
        // Create a new instance if one doesn't exist
        return new bootstrap.Offcanvas(mobileSidebar);
      }
    };

    // Initialize the instance once
    offcanvasInstance = getOffcanvasInstance();

    // Z-index management functions
    const setOpenZIndex = () => {
      mobileSidebar.style.zIndex = "1051"; // Higher z-index when open

      // Also ensure backdrop has appropriate z-index
      const backdrop = document.querySelector(".offcanvas-backdrop");
      if (backdrop) backdrop.style.zIndex = "1050";
    };

    const resetZIndex = () => {
      // Only reset z-index after animation completes
      mobileSidebar.style.zIndex = "1045"; // Default z-index when closed
    };

    // Handle custom close button if it exists
    const customCloseButton = mobileSidebar.querySelector(
      ".custom-offcanvas-close"
    );
    if (customCloseButton) {
      // Fix accessibility issue
      customCloseButton.setAttribute("tabindex", "-1");

      customCloseButton.addEventListener("click", function (e) {
        e.preventDefault();
        offcanvasInstance = getOffcanvasInstance();
        offcanvasInstance.hide();
      });
    }

    // Handle all the nav links within the offcanvas
    const navLinks = mobileSidebar.querySelectorAll("a");
    navLinks.forEach((link) => {
      // Remove any existing data-bs-dismiss attribute to prevent default behavior
      if (link.hasAttribute("data-bs-dismiss")) {
        link.removeAttribute("data-bs-dismiss");
      }

      // Fix accessibility
      link.setAttribute("tabindex", "-1");

      // Add our custom click handler
      link.addEventListener("click", function (e) {
        // Don't interfere with links that should behave normally
        if (this.classList.contains("dropdown-toggle")) return;

        // Get the latest instance and hide it
        offcanvasInstance = getOffcanvasInstance();
        offcanvasInstance.hide();
      });
    });

    // Use the inert attribute instead of aria-hidden
    mobileSidebar.addEventListener("hide.bs.offcanvas", function () {
      mobileSidebar.setAttribute("inert", "");
    });

    // Remove inert when showing
    mobileSidebar.addEventListener("show.bs.offcanvas", function () {
      mobileSidebar.removeAttribute("inert");

      // Set higher z-index when opened
      setOpenZIndex();

      // Make all focusable elements focusable again
      const focusableElements = mobileSidebar.querySelectorAll(
        "a, button, input, select, textarea"
      );
      focusableElements.forEach((el) => {
        el.removeAttribute("tabindex");
      });
    });

    // Ensure backdrop is properly removed after hiding
    mobileSidebar.addEventListener("hidden.bs.offcanvas", function () {
      const backdrops = document.querySelectorAll(".offcanvas-backdrop");
      backdrops.forEach((backdrop) => {
        backdrop.remove();
      });

      // Reset the body styling that Bootstrap adds
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      document.body.classList.remove("modal-open");

      // Reset to default z-index after animation completes
      resetZIndex();
    });

    // Add a global document click handler to ensure offcanvas can always be triggered
    const offcanvasTogglers = document.querySelectorAll(
      '[data-bs-toggle="offcanvas"][data-bs-target="#mobileSidebar"]'
    );
    offcanvasTogglers.forEach((toggler) => {
      toggler.addEventListener("click", function (e) {
        e.preventDefault();

        // Get the latest instance and show it
        offcanvasInstance = getOffcanvasInstance();
        offcanvasInstance.show();
      });
    });

    // Initialize with inert attribute if offcanvas is initially hidden
    if (!mobileSidebar.classList.contains("show")) {
      mobileSidebar.setAttribute("inert", "");
    }
  }

  // Clean up any stray backdrops on page load (safeguard)
  const strayBackdrops = document.querySelectorAll(".offcanvas-backdrop");
  strayBackdrops.forEach((backdrop) => {
    backdrop.remove();
  });

  // Add styles for custom close button with improved visibility
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    .custom-offcanvas-close {
      box-sizing: content-box;
      width: 1em;
      height: 1em;
      padding: 0.5rem;
      color: #ffffff; /* Changed to white for better visibility */
      background: transparent url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23ffffff'%3e%3cpath d='M.293.293a1 1 0 011.414 0L8 6.586 14.293.293a1 1 0 111.414 1.414L9.414 8l6.293 6.293a1 1 0 01-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 01-1.414-1.414L6.586 8 .293 1.707a1 1 0 010-1.414z'/%3e%3c/svg%3e") center/1em auto no-repeat;
      border: 0;
      border-radius: 0.25rem;
      opacity: 1;
      cursor: pointer;
      transition: opacity 0.15s linear;
      position: absolute; /* Make it absolute positioned */
      top: 10px; /* Position from top */
      right: 10px; /* Position from right */
      z-index: 1052; /* Higher than the offcanvas itself */
    }
    
    .custom-offcanvas-close:hover {
      opacity: 0.75;
      text-decoration: none;
    }
    
    .custom-offcanvas-close:focus {
      outline: none;
      box-shadow: 0 0 0 0.25rem rgba(255, 255, 255, 0.5); /* Changed to white for better visibility */
    }
    
    /* Ensure offcanvas is visible while transitioning */
    .offcanvas.offcanvas-start {
      visibility: visible !important;
      transform: translateX(-100%);
      transition: transform 0.3s ease-in-out;
    }
    
    .offcanvas.offcanvas-start.show {
      transform: translateX(0);
    }
    
    /* Ensure offcanvas is hidden properly when closed */
    .offcanvas[inert] {
      pointer-events: none;
      cursor: default;
    }

    .modal-backdrop.show {
    // opacity: 0; 
    }
  `;
  document.head.appendChild(styleElement);

  // Handle mobile navbar z-index to prevent overlay cutoff
  const mobileScrollNavbar = document.querySelector(".mobile-scroll-navbar");
  if (mobileScrollNavbar) {
    // Adjust z-index when offcanvas is shown/hidden
    document.body.addEventListener("shown.bs.offcanvas", function () {
      mobileScrollNavbar.style.zIndex = "1039"; // Below the offcanvas and backdrop
    });

    document.body.addEventListener("hidden.bs.offcanvas", function () {
      // Give it a small delay to avoid flickering
      setTimeout(() => {
        mobileScrollNavbar.style.zIndex = "1049"; // Reset z-index but keep below potentially active elements
      }, 300);
    });
  }
});

// Handle mobile navbar on scroll
const scrollNav = document.querySelector(".mobile-scroll-navbar");
const mobileLine1 = document.querySelector(".mobile-nav-line-1");
const mobileLine2 = document.querySelector(".mobile-nav-line-2");

// Handle scroll events
window.addEventListener("scroll", () => {
  if (window.innerWidth <= 768) {
    if (window.scrollY > 100) {
      if (scrollNav) scrollNav.style.display = "flex";
      if (mobileLine1) mobileLine1.style.display = "none";
      if (mobileLine2) mobileLine2.style.display = "none";
    } else {
      if (scrollNav) scrollNav.style.display = "none";
      if (mobileLine1) mobileLine1.style.display = "flex";
      if (mobileLine2) mobileLine2.style.display = "flex";
    }
  }
});

// Handle window resize events
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    if (scrollNav) scrollNav.style.display = "none";
    if (mobileLine1) mobileLine1.style.display = "none";
    if (mobileLine2) mobileLine2.style.display = "none";
  } else {
    if (window.scrollY > 100) {
      if (scrollNav) scrollNav.style.display = "flex";
      if (mobileLine1) mobileLine1.style.display = "none";
      if (mobileLine2) mobileLine2.style.display = "none";
    } else {
      if (scrollNav) scrollNav.style.display = "none";
      if (mobileLine1) mobileLine1.style.display = "flex";
      if (mobileLine2) mobileLine2.style.display = "flex";
    }
  }
});

// Initialize correctly on page load
window.addEventListener("load", () => {
  if (window.innerWidth <= 768) {
    if (window.scrollY > 100) {
      if (scrollNav) scrollNav.style.display = "flex";
      if (mobileLine1) mobileLine1.style.display = "none";
      if (mobileLine2) mobileLine2.style.display = "none";
    } else {
      if (scrollNav) scrollNav.style.display = "none";
      if (mobileLine1) mobileLine1.style.display = "flex";
      if (mobileLine2) mobileLine2.style.display = "flex";
    }
  } else {
    if (scrollNav) scrollNav.style.display = "none";
    if (mobileLine1) mobileLine1.style.display = "none";
    if (mobileLine2) mobileLine2.style.display = "none";
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Calculate navbar height to use for offset
  const getNavbarHeight = () => {
    const navbar = document.querySelector(".custom-navbar");
    return navbar ? navbar.offsetHeight : 0;
  };

  // 1. Set active class based on current URL hash or pathname
  function setActiveNavLink() {
    const currentLocation = window.location.hash || window.location.pathname;
    const navLinks = document.querySelectorAll(".nav-link");

    // First, remove active class from all links
    navLinks.forEach((link) => {
      link.classList.remove("active");
    });

    // Then set active based on current location
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href === "#") return; // Skip empty links

      // For dropdown toggle links, check if we're in that section
      if (
        link.classList.contains("dropdown-toggle") &&
        currentLocation.includes(href.replace("#", ""))
      ) {
        link.classList.add("active");
        return;
      }

      // For normal links, check exact match
      if (
        currentLocation === href ||
        currentLocation.endsWith(href) ||
        (href === "#home" &&
          (currentLocation === "/" ||
            currentLocation === "/index.html" ||
            currentLocation === ""))
      ) {
        link.classList.add("active");
      }
    });

    // Also handle dropdown items
    const dropdownItems = document.querySelectorAll(".dropdown-item");
    dropdownItems.forEach((item) => {
      const href = item.getAttribute("href");
      if (currentLocation === href || currentLocation.endsWith(href)) {
        // Find parent dropdown and set it active too
        const parentDropdown = item
          .closest(".dropdown")
          .querySelector(".dropdown-toggle");
        if (parentDropdown) {
          parentDropdown.classList.add("active");
        }
      }
    });
  }

  // Handle smooth scrolling with offset
  function handleNavLinkClick(e) {
    // Get all nav links that point to anchors
    const anchorLinks = document.querySelectorAll(
      'a[href^="#"]:not([href="#"])'
    );

    anchorLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        // Prevent default anchor click behavior
        e.preventDefault();

        // Get the target element
        const targetId = this.getAttribute("href");
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          // Calculate the position to scroll to (with navbar offset)
          const navbarHeight = getNavbarHeight();
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - navbarHeight;

          // Smooth scroll to the target with offset
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });

          // Update the URL hash without scrolling
          history.pushState(null, null, targetId);

          // Update active nav link
          setActiveNavLink();
        }
      });
    });
  }

  // Fix anchor links on page load
  function fixAnchorsOnLoad() {
    // Check if there's a hash in the URL
    if (window.location.hash) {
      // Wait a moment for everything to load
      setTimeout(() => {
        const targetId = window.location.hash;
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          // Calculate position with navbar offset
          const navbarHeight = getNavbarHeight();
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - navbarHeight;

          // Scroll to the target with offset
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }

  // Set active link initially
  setActiveNavLink();

  // Set up smooth scrolling
  handleNavLinkClick();

  // Fix anchors on page load
  fixAnchorsOnLoad();

  // Update active link when hash changes
  window.addEventListener("hashchange", setActiveNavLink);

  // Add click handler for nav links
  const navLinks = document.querySelectorAll(".nav-link:not(.dropdown-toggle)");
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      // Don't interfere with dropdown toggle behavior
      if (this.classList.contains("dropdown-toggle")) return;

      // Set this link as active
      navLinks.forEach((navLink) => navLink.classList.remove("active"));
      this.classList.add("active");

      // On mobile, close the navbar after clicking a link
      const navbarCollapse = document.querySelector(".navbar-collapse");
      if (navbarCollapse.classList.contains("show")) {
        const bsCollapse = new bootstrap.Collapse(navbarCollapse);
        bsCollapse.hide();
      }
    });
  });

  // Handle dropdown items click
  const dropdownItems = document.querySelectorAll(".dropdown-item");
  dropdownItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Find parent dropdown toggle and set it active
      const parentDropdown =
        this.closest(".dropdown").querySelector(".dropdown-toggle");
      if (parentDropdown) {
        navLinks.forEach((navLink) => navLink.classList.remove("active"));
        parentDropdown.classList.add("active");
      }

      // On mobile, close the navbar after clicking
      const navbarCollapse = document.querySelector(".navbar-collapse");
      if (navbarCollapse.classList.contains("show")) {
        const bsCollapse = new bootstrap.Collapse(navbarCollapse);
        bsCollapse.hide();
      }
    });
  });

  // If no active link is set, default to home
  if (!document.querySelector(".nav-link.active")) {
    document.querySelector('.nav-link[href="#home"]').classList.add("active");
  }
});

// Toggle between seller login and signup forms
const sellerAuthToggle = document.getElementById("sellerAuthToggle");
const sellerLoginForm = document.getElementById("sellerLoginForm");
const sellerSignupForm = document.getElementById("sellerSignupForm");
const sellerLoginSpan = document.getElementById("sellerLoginSpan");
const sellerSignupSpan = document.getElementById("sellerSignupSpan");

sellerAuthToggle.addEventListener("change", function () {
  if (this.checked) {
    sellerLoginForm.classList.add("d-none");
    sellerSignupForm.classList.remove("d-none");
    sellerLoginSpan.classList.remove("active");
    sellerSignupSpan.classList.add("active");
  } else {
    sellerLoginForm.classList.remove("d-none");
    sellerSignupForm.classList.add("d-none");
    sellerLoginSpan.classList.add("active");
    sellerSignupSpan.classList.remove("active");
  }
});

// Navigation between auth and seller modals
function setupCustomerNavigation() {
  // From customer Login/Signup to seller signup

  document.querySelectorAll(".goToSellerSignup").forEach(function (element) {
    element.addEventListener("click", function () {
      $("#authModal").modal("hide");

      setTimeout(() => {
        $("#sellerModal").modal("show");

        // 🔁 Now default to: hide login, show signup
        document.getElementById("sellerLoginForm").classList.add("d-none");
        document.getElementById("sellerSignupForm").classList.remove("d-none");

        // ✅ Toggle active states
        document.getElementById("sellerLoginSpan").classList.remove("active");
        document.getElementById("sellerSignupSpan").classList.add("active");

        // Optional: flip toggle checkbox if used
        document.getElementById("sellerAuthToggle").checked = true;
      }, 500);
    });
  });

  // From seller login to customer login
  document
    .getElementById("goToCustomerLogin")
    .addEventListener("click", function () {
      $("#sellerModal").modal("hide");
      document.getElementById("authToggle").checked = false;
      const loginForm = document.querySelector(".login-form");
      const signupForm = document.querySelector(".signup-form");
      loginForm.style.display = "block";
      signupForm.style.display = "none";
      document.getElementById("modalTitleText").textContent =
        "Login to Your Account";
      setTimeout(() => $("#authModal").modal("show"), 500);
    });

  // From seller login to customer signup
  document
    .getElementById("goToCustomerSignup")
    .addEventListener("click", function () {
      $("#sellerModal").modal("hide");
      document.getElementById("authToggle").checked = true;
      const loginForm = document.querySelector(".login-form");
      const signupForm = document.querySelector(".signup-form");
      loginForm.style.display = "none";
      signupForm.style.display = "block";
      document.getElementById("modalTitleText").textContent =
        "Create An Account";
      setTimeout(() => $("#authModal").modal("show"), 500);
    });

  // From seller signup to customer login
  document
    .getElementById("goToCustomerLogin2")
    .addEventListener("click", function () {
      $("#sellerModal").modal("hide");
      document.getElementById("authToggle").checked = false;
      const loginForm = document.querySelector(".login-form");
      const signupForm = document.querySelector(".signup-form");
      loginForm.style.display = "block";
      signupForm.style.display = "none";
      document.getElementById("modalTitleText").textContent =
        "Login to Your Account";
      setTimeout(() => $("#authModal").modal("show"), 500);
    });

  // From seller signup to customer signup
  document
    .getElementById("goToCustomerSignup2")
    .addEventListener("click", function () {
      $("#sellerModal").modal("hide");
      document.getElementById("authToggle").checked = true;
      const loginForm = document.querySelector(".login-form");
      const signupForm = document.querySelector(".signup-form");
      loginForm.style.display = "none";
      signupForm.style.display = "block";
      document.getElementById("modalTitleText").textContent =
        "Create An Account";
      setTimeout(() => $("#authModal").modal("show"), 500);
    });
}

// Call this function after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", setupCustomerNavigation);

// For dynamically added elements or if the above doesn't work
$(document).ready(function () {
  setupCustomerNavigation();
});

// Updated User authentication logic
document.addEventListener("DOMContentLoaded", function () {
  // DOM elements
  const guestButtons = document.getElementById("guestButtons");
  const userDropdown = document.getElementById("userDropdown");
  const usernameDisplay = document.getElementById("usernameDisplay");
  const userDropdownToggle = document.getElementById("userDropdownToggle");
  const userDropdownMenu = document.getElementById("userDropdownMenu");
  const adminPanelLink = document.getElementById("adminPanelLink");
  const logoutBtn = document.getElementById("logoutBtn");

  // Mobile DOM elements
  const mobileGuestButtons = document.getElementById("mobileGuestButtons");
  const mobileUserDropdown = document.getElementById("mobileUserDropdown");
  const mobileUsernameDisplay = document.getElementById(
    "mobileUsernameDisplay"
  );
  const mobileUserDropdownToggle = document.getElementById(
    "mobileUserDropdownToggle"
  );
  const mobileUserDropdownMenu = document.getElementById(
    "mobileUserDropdownMenu"
  );
  const mobileAdminPanelLink = document.getElementById("mobileAdminPanelLink");
  const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");

  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const sellerLoginForm = document.getElementById("sellerLoginForm");
  const sellerSignupForm = document.getElementById("sellerSignupForm");
  const successToast = document.getElementById("successToast");
  const successToastMessage = document.getElementById("successToastMessage");

  // Get toggle checkbox and forms
  const authToggle = document.getElementById("authToggle");
  const modalTitleText = document.getElementById("modalTitleText");

  // Check if user is logged in (from session storage)
  function checkLoginStatus() {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    if (currentUser) {
      // User is logged in
      showLoggedInState(currentUser);
    }
  }

  // Show logged in state
  function showLoggedInState(user) {
    // Desktop UI update
    guestButtons.classList.add("d-none");
    userDropdown.classList.remove("d-none");

    // Mobile UI update
    mobileGuestButtons.classList.add("d-none");
    mobileUserDropdown.classList.remove("d-none");

    // Get initials (e.g., "K R" → "KR")
    const nameParts = user.username.trim().split(" ");
    let initials = nameParts[0]?.charAt(0).toUpperCase() || "";
    if (nameParts.length > 1) {
      initials += nameParts[1]?.charAt(0).toUpperCase() || "";
    }

    // Update desktop username display
    usernameDisplay.textContent = initials;
    usernameDisplay.setAttribute("title", user.username);
    bootstrap.Tooltip.getInstance(usernameDisplay)?.dispose();
    new bootstrap.Tooltip(usernameDisplay);

    // Update mobile username display
    mobileUsernameDisplay.textContent = initials;
    mobileUsernameDisplay.setAttribute("title", user.username);
    bootstrap.Tooltip.getInstance(mobileUsernameDisplay)?.dispose();
    new bootstrap.Tooltip(mobileUsernameDisplay);

    // Show admin link if seller
    if (user.isSeller) {
      adminPanelLink.classList.remove("d-none");
      mobileAdminPanelLink.classList.remove("d-none");
    } else {
      adminPanelLink.classList.add("d-none");
      mobileAdminPanelLink.classList.add("d-none");
    }
  }

  // Show logged out state
  function showLoggedOutState() {
    // Desktop UI update
    userDropdown.classList.add("d-none");
    guestButtons.classList.remove("d-none");

    // Mobile UI update
    mobileUserDropdown.classList.add("d-none");
    mobileGuestButtons.classList.remove("d-none");
  }

  // Toggle desktop dropdown menu
  userDropdownToggle.addEventListener("click", function () {
    userDropdownMenu.classList.toggle("show");
  });

  // Toggle mobile dropdown menu
  mobileUserDropdownToggle.addEventListener("click", function () {
    mobileUserDropdownMenu.classList.toggle("show");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (event) {
    // Desktop dropdown
    if (!userDropdown.contains(event.target)) {
      userDropdownMenu.classList.remove("show");
    }

    // Mobile dropdown
    if (!mobileUserDropdown.contains(event.target)) {
      mobileUserDropdownMenu.classList.remove("show");
    }
  });

  // Login form submission
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Simple validation
    if (!username || !password) {
      alert("Please fill in all fields");
      return;
    }

    // Mock login (in a real app, this would be an API call)
    const user = {
      username: username,
      isSeller: false,
    };

    // Store user in session
    sessionStorage.setItem("currentUser", JSON.stringify(user));

    // Update UI
    showLoggedInState(user);

    // Close modal - FIXED for Bootstrap 5
    const loginModal = bootstrap.Modal.getInstance(
      document.getElementById("authModal")
    );
    if (loginModal) {
      loginModal.hide();
    }

    // Show success message - Bootstrap 5 syntax
    successToastMessage.textContent = `Welcome back, ${username}!`;
    const toast = new bootstrap.Toast(document.getElementById("successToast"));
    toast.show();

    // Reset form
    loginForm.reset();
  });

  // Sign up form submission
  signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("newUsername").value;
    const email = document.getElementById("newEmail").value;
    const password = document.getElementById("newPassword").value;
    const termsCheck = document.getElementById("termsCheck").checked;

    // Simple validation
    if (!username || !email || !password || !termsCheck) {
      alert("Please fill in all fields and agree to the terms");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    // Mock sign up (in a real app, this would be an API call)
    const user = {
      username: username,
      email: email,
      isSeller: false,
    };

    // Store user in session
    sessionStorage.setItem("currentUser", JSON.stringify(user));

    // Update UI
    showLoggedInState(user);

    // Close modal - FIXED for Bootstrap 5
    const signupModal = bootstrap.Modal.getInstance(
      document.getElementById("authModal")
    );
    if (signupModal) {
      signupModal.hide();
    }

    // Show success message - Bootstrap 5 syntax
    successToastMessage.textContent = `Account created successfully. Welcome, ${username}!`;
    const toast = new bootstrap.Toast(document.getElementById("successToast"));
    toast.show();

    // Reset form
    signupForm.reset();
  });

  // Seller login form submission
  sellerLoginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("sellerLoginUsername").value;
    const password = document.getElementById("sellerLoginPassword").value;

    // Simple validation
    if (!username || !password) {
      alert("Please fill in all fields");
      return;
    }

    // Mock seller login (in a real app, this would be an API call)
    const user = {
      username: username,
      isSeller: true,
    };

    // Store user in session
    sessionStorage.setItem("currentUser", JSON.stringify(user));

    // Update UI
    showLoggedInState(user);

    // Close modal - FIXED for Bootstrap 5
    const sellerModal = bootstrap.Modal.getInstance(
      document.getElementById("sellerModal")
    );
    if (sellerModal) {
      sellerModal.hide();
    }

    // Show success message - Bootstrap 5 syntax
    successToastMessage.textContent = `Welcome back, Seller ${username}!`;
    const toast = new bootstrap.Toast(document.getElementById("successToast"));
    toast.show();

    // Reset form
    sellerLoginForm.reset();
  });

  // Seller sign up form submission
  sellerSignupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const fullName = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const shopName = document.getElementById("shopName").value;
    const username = document.getElementById("signupUsername").value;
    const password = document.getElementById("signupPassword").value;
    const termsCheck = document.getElementById("sellerTermsCheck").checked;

    // Simple validation
    if (
      !fullName ||
      !email ||
      !shopName ||
      !username ||
      !password ||
      !termsCheck
    ) {
      alert("Please fill in all fields and agree to the terms");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    // Mock seller sign up (in a real app, this would be an API call)
    const user = {
      username: username,
      fullName: fullName,
      email: email,
      shopName: shopName,
      isSeller: true,
    };

    // Store user in session
    sessionStorage.setItem("currentUser", JSON.stringify(user));

    // Update UI
    showLoggedInState(user);

    // Close modal - FIXED for Bootstrap 5
    const sellerModal = bootstrap.Modal.getInstance(
      document.getElementById("sellerModal")
    );
    if (sellerModal) {
      sellerModal.hide();
    }

    // Show success message - Bootstrap 5 syntax
    successToastMessage.textContent = `Seller account created successfully. Welcome, ${username}!`;
    const toast = new bootstrap.Toast(document.getElementById("successToast"));
    toast.show();

    // Reset form
    sellerSignupForm.reset();
  });

  // Desktop logout button
  logoutBtn.addEventListener("click", function (event) {
    event.preventDefault();

    // Remove user from session
    sessionStorage.removeItem("currentUser");

    // Update UI
    showLoggedOutState();

    // Close dropdown
    userDropdownMenu.classList.remove("show");

    // Show success message - Bootstrap 5 syntax
    successToastMessage.textContent = "Logged out successfully!";
    const toast = new bootstrap.Toast(document.getElementById("successToast"));
    toast.show();
  });

  // Mobile logout button
  mobileLogoutBtn.addEventListener("click", function (event) {
    event.preventDefault();

    // Remove user from session
    sessionStorage.removeItem("currentUser");

    // Update UI
    showLoggedOutState();

    // Close dropdown
    mobileUserDropdownMenu.classList.remove("show");

    // Show success message - Bootstrap 5 syntax
    successToastMessage.textContent = "Logged out successfully!";
    const toast = new bootstrap.Toast(document.getElementById("successToast"));
    toast.show();
  });

  // Initialize tooltips
  $(function () {
    $('[data-toggle="tooltip"]').tooltip();
  });

  // Toggle between login and signup forms
  authToggle.addEventListener("change", function () {
    if (this.checked) {
      // Show signup form, hide login form
      loginForm.style.display = "none";
      signupForm.style.display = "block";
      modalTitleText.innerHTML = "Create an Account";
    } else {
      // Show login form, hide signup form
      loginForm.style.display = "block";
      signupForm.style.display = "none";
      modalTitleText.innerHTML = "Login to Your Account";
    }
  });

  // Reset to login form when modal is closed
  $("#authModal").on("hidden.bs.modal", function () {
    authToggle.checked = false;
    loginForm.style.display = "block";
    signupForm.style.display = "none";
    modalTitleText.innerHTML = "Login to Your Account";
  });

  // Check login status on page load
  checkLoginStatus();
});

document.addEventListener("DOMContentLoaded", function () {
  // Product data
  const products = [
    {
      id: 1,
      name: "Player: One",
      price: 126518,
      badge: "Entry Level",
      image: "Images/player-1-ww-09-04-24-hero-white-badge-amd.png",
      description: "H5 Flow RTX 3050 Gaming PC",
      rating: 4.5,
      reviewCount: 126,
      specs: [
        "AMD Ryzen 5 / Intel Core i5",
        "NVIDIA RTX 3050 8GB",
        "16GB DDR4 RAM",
        "1TB NVMe SSD",
      ],
    },
    {
      id: 2,
      name: "Player: Two",
      price: 136928,
      badge: "Mid-Range",
      image: "Images/player-two-base-ww-09-04-24-hero-white-badge.png",
      description: "H6 Flow RTX 4070 Gaming PC",
      rating: 4,
      reviewCount: 98,
      specs: [
        "AMD Ryzen 7 / Intel Core i7",
        "NVIDIA RTX 4070 12GB",
        "32GB DDR5 RAM",
        "2TB NVMe SSD",
      ],
    },
    {
      id: 3,
      name: "Player: Three",
      price: 193996,
      badge: "High-End",
      image: "Images/player-three-base-ww-09-04-24-hero-white-badge.png",
      description: "H7 Flow RTX 4070 Ti Gaming PC",
      rating: 3.5,
      reviewCount: 72,
      specs: [
        "AMD Ryzen 9 / Intel Core i9",
        "NVIDIA RTX 4070 Ti 16GB",
        "32GB DDR5 RAM",
        "2TB NVMe SSD",
      ],
    },
    {
      id: 4,
      name: "Player: One Prime",
      price: 105394,
      badge: "Value",
      image: "Images/player-1-prime-ww-09-04-24-hero-white-badge-amd.png",
      description: "H5 Flow RTX 4060 Ti Gaming PC",
      rating: 4,
      reviewCount: 85,
      specs: [
        "AMD Ryzen 5 / Intel Core i5",
        "NVIDIA RTX 4060 Ti 8GB",
        "16GB DDR5 RAM",
        "1TB NVMe SSD",
      ],
    },
    {
      id: 5,
      name: "Player: Two Prime",
      price: 111120,
      badge: "Popular",
      image: "Images/player-two-premium-ww-09-04-24-hero-white-amd.png",
      description: "H6 Flow RGB RTX 4070 Ti SUPER Gaming PC",
      rating: 4.5,
      reviewCount: 142,
      specs: [
        "AMD Ryzen 7 / Intel Core i7",
        "NVIDIA RTX 4070 Ti SUPER 16GB",
        "32GB DDR5 RAM",
        "2TB NVMe SSD",
      ],
    },
    {
      id: 6,
      name: "Player: Three Prime",
      price: 312133,
      badge: "Ultimate",
      image: "Images/player-three-prime-ww-09-04-24-hero-white-amd.png",
      description: "H9 Elite RTX 4090 Gaming PC",
      rating: 3.5,
      reviewCount: 54,
      specs: [
        "AMD Ryzen 9 / Intel Core i9",
        "NVIDIA RTX 4090 24GB",
        "64GB DDR5 RAM",
        "4TB NVMe SSD",
      ],
    },
  ];

  // Function to create star rating HTML
  function createStarRating(rating) {
    let starsHtml = "";
    let fullStars = Math.floor(rating);
    let halfStar = rating % 1 >= 0.5;
    let emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      starsHtml += '<i class="fas fa-star"></i>';
    }

    if (halfStar) {
      starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }

    for (let i = 0; i < emptyStars; i++) {
      starsHtml += '<i class="far fa-star"></i>';
    }

    return starsHtml;
  }

  // Function to create product HTML
  function createProductHTML(product) {
    return `
    <div class="col-12 col-sm-6 col-lg-4 mb-4">
        <div class="card product-card h-100" data-product-name="${
          product.name
        }" data-product-price="${product.price}">
            <div class="position-relative image-container">
                <span class="position-absolute badge">${product.badge}</span>
                <img src="${
                  product.image
                }" class="card-img-top product-image" alt="${product.name}">
            </div>
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${product.name}</h5>
                <div class="product-rating mb-2">
                    ${createStarRating(product.rating)}
                    <span class="ms-1 text-muted">(${
                      product.reviewCount
                    } reviews)</span>
                </div>
                <p class=" product-price ">₹ ${product.price.toLocaleString(
                  "en-IN"
                )}</p>
                <p class="card-text">${product.description}</p>
                
                <h6 class="mt-3">Key Specifications:</h6>
                <ul class="list-unstyled specs-list mb-4">
                    ${product.specs
                      .map(
                        (spec) =>
                          `<li><i class="fas fa-${getIconForSpec(
                            spec
                          )} me-2"></i> ${spec}</li>`
                      )
                      .join("")}
                </ul>
                
                <button class="btn btn-primary mt-auto shop-button" data-bs-toggle="modal" data-bs-target="#buyNowModal" 
                        data-product-name="${
                          product.name
                        }" data-product-price="${product.price}">
                    Shop Now
                </button>
            </div>
        </div>
    </div>
`;
  }

  // Function to get appropriate icon for specification
  function getIconForSpec(spec) {
    if (spec.includes("Ryzen") || spec.includes("Core i")) return "microchip";
    if (spec.includes("RTX")) return "tv";
    if (spec.includes("RAM")) return "memory";
    if (spec.includes("SSD")) return "hdd";
    return "check";
  }

  // Function to toggle empty state visibility
  function toggleEmptyState() {
    const productContainer = document.getElementById("product-container");
    const emptyState = document.getElementById("empty-state");

    if (productContainer && emptyState) {
      if (productContainer.children.length === 0) {
        emptyState.style.display = "block";
      } else {
        emptyState.style.display = "none";
      }
    }
  }

  // Function to render products
  function renderProducts(productsToRender = products) {
    const productContainer = document.getElementById("product-container");
    if (!productContainer) return;

    productContainer.innerHTML = ""; // Clear existing products

    productsToRender.forEach((product) => {
      productContainer.innerHTML += createProductHTML(product);
    });

    // Toggle empty state visibility
    toggleEmptyState();
  }

  // Expose the renderProducts function globally
  window.renderProducts = renderProducts;

  // Function to load all products
  window.loadAllProducts = function () {
    document.querySelectorAll(".category-filters .btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    document.querySelector(".show-all-btn").classList.add("active");

    renderProducts();
  };
  loadAllProducts();

  // Function to load products by category
  window.loadProductsByCategory = function (category) {
    document.querySelectorAll(".category-filters .btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.querySelector(".show-all-btn").classList.remove("active");

    document
      .querySelector(`.category-filters .btn[onclick*="${category}"]`)
      .classList.add("active");

    const filteredProducts = products.filter((product) => {
      if (category === "entry-level") {
        return product.badge === "Entry Level" || product.badge === "Value";
      } else if (category === "mid-range") {
        return product.badge === "Mid-Range" || product.badge === "Popular";
      } else if (category === "high-end") {
        return product.badge === "High-End" || product.badge === "Ultimate";
      }
      return true;
    });

    renderProducts(filteredProducts);
  };

  // Function to load products by price range
  window.loadProductsByPriceRange = function (minPrice, maxPrice) {
    document.querySelectorAll(".category-filters .btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.querySelector(".show-all-btn").classList.remove("active");

    const filteredProducts = products.filter((product) => {
      return product.price >= minPrice && product.price <= maxPrice;
    });

    renderProducts(filteredProducts);
  };

  // Setup modal event listeners
  const buyNowModal = document.getElementById("buyNowModal");
  if (buyNowModal) {
    buyNowModal.addEventListener("show.bs.modal", function (event) {
      const button = event.relatedTarget;
      const productName = button.getAttribute("data-product-name");
      const productPrice = button.getAttribute("data-product-price");

      const modalProductName = document.getElementById("modalProductName");
      const modalProductPrice = document.getElementById("modalProductPrice");

      if (modalProductName && modalProductPrice) {
        modalProductName.textContent = productName;
        modalProductPrice.textContent =
          Number(productPrice).toLocaleString("en-IN");
      }
    });
  }

  // Add sort functionality
  window.sortProducts = function (sortBy) {
    let sortedProducts = [...products];

    if (sortBy === "price-low") {
      sortedProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      sortedProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      sortedProducts.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "name") {
      sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    renderProducts(sortedProducts);
  };

  // Initialize empty state on page load
  toggleEmptyState();
});

// Get the product details and set them in the modal when the "Shop Now" button is clicked
document.querySelectorAll(".shop-button").forEach((button) => {
  button.addEventListener("click", function () {
    const product = this.closest(".productt");
    const productName = product.getAttribute("data-product-name");
    const productPrice = product.getAttribute("data-product-price");
    document.getElementById("modalProductName").textContent = productName;
    document.getElementById("modalProductPrice").textContent = productPrice;
    document.getElementById("totalPrice").textContent = productPrice;

    // Use Bootstrap 5 modal method to show the modal
    const buyNowModal = new bootstrap.Modal(
      document.getElementById("buyNowModal")
    );
    buyNowModal.show();
  });
});

// Quantity selector functionality
const increaseButton = document.getElementById("increaseQuantity");
const decreaseButton = document.getElementById("decreaseQuantity");
const quantityInput = document.getElementById("quantity");
const totalPrice = document.getElementById("totalPrice");
let pricePerUnit = 0;

increaseButton.addEventListener("click", function () {
  let currentQuantity = parseInt(quantityInput.value);
  currentQuantity++;
  quantityInput.value = currentQuantity;
  updateTotalPrice(currentQuantity);
});

decreaseButton.addEventListener("click", function () {
  let currentQuantity = parseInt(quantityInput.value);
  if (currentQuantity > 1) {
    currentQuantity--;
    quantityInput.value = currentQuantity;
    updateTotalPrice(currentQuantity);
  }
});

// Helper function to update total price
function updateTotalPrice(quantity) {
  totalPrice.textContent = (quantity * pricePerUnit).toLocaleString("en-IN");
}

// Set the price per unit when the modal is shown - Bootstrap 5 syntax
const buyNowModal = document.getElementById("buyNowModal");
buyNowModal.addEventListener("shown.bs.modal", function () {
  // Reset the form and quantity input first
  document.getElementById("orderForm").reset();
  quantityInput.value = "1";

  // Then get the updated price and update total price
  pricePerUnit = parseInt(
    document
      .getElementById("modalProductPrice")
      .textContent.replace(/[^\d]/g, "")
  );

  updateTotalPrice(1); // use 1 since you just reset it
});

// Place order button functionality
document
  .getElementById("placeOrderButton")
  .addEventListener("click", function () {
    const form = document.getElementById("orderForm");
    if (form.checkValidity()) {
      alert(
        "Order placed successfully! This is a demo. In a real application, you would be redirected to payment processing."
      );

      // Hide modal using Bootstrap 5 method
      const modal = bootstrap.Modal.getInstance(buyNowModal);
      modal.hide();
    } else {
      form.reportValidity(); // Trigger validation
    }
  });

// Animation effects on scroll
window.addEventListener("scroll", function () {
  const cards = document.querySelectorAll(".product-card");
  cards.forEach((card) => {
    const position = card.getBoundingClientRect();
    if (position.top < window.innerHeight - 100) {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }
  });
});

// Initialize all tooltips
document.addEventListener("DOMContentLoaded", function () {
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
});

// Product Data
const products = [
  {
    name: "Intel Core i9-12900K Desktop Processor",
    originalPrice: 99999,
    currentPrice: 74999,
    image: "Images/i9.png",
    rating: 4,
    discount: "25% off",
    category: "processor",
  },
  {
    name: "Nvme 990 EVO SSD 1TB, PCIe 5.0 x2 M.2 2280",
    originalPrice: 25279,
    currentPrice: 20669,
    image: "Images/Nvme SSD.png",
    rating: 4.5,
    category: "storage",
  },
  {
    name: "DDR4 3200MHz 16GB RAM Memory | SO-DIMM",
    originalPrice: 10999,
    currentPrice: 8744,
    image: "Images/Ram.png",
    rating: 3.5,
    category: "memory",
  },
  {
    name: "MSI MPG B550 Gaming Plus AMD Ryzen 5000 Am4 Ddr4 ATX Motherboard",
    originalPrice: 20700,
    currentPrice: 16456,
    image: "Images/motherboard.png",
    rating: 3.5,
    discount: "25% off",
    category: "motherboard",
  },
  {
    name: "Asus ROG Swift 27-Inch(68.6cm)FHD Monitor",
    originalPrice: 88000,
    currentPrice: 69960,
    image: "Images/ASUS-ROG-Swift_prev_ui.png",
    rating: 4,
    discount: "25% off",
    category: "peripheral",
  },
  {
    name: "RPM Euro Games Gaming Keyboard",
    originalPrice: 2480,
    currentPrice: 1970,
    image: "Images/keyboard.png",
    rating: 4.5,
    category: "peripheral",
  },
  {
    name: "Zebronic RGB Gaming Mouse",
    originalPrice: 749,
    currentPrice: 550,
    image: "Images/mouse.png",
    rating: 4,
    category: "peripheral",
  },
];

// Cart to store items
let cart = [];

// Format price with commas for Indian currency format
function formatPrice(price) {
  return "₹ " + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Generate star ratings
function generateStars(rating) {
  let stars = "";

  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      // Full star
      stars += '<i class="fas fa-star"></i>';
    } else if (i - rating < 1 && i - rating > 0) {
      // Half star
      stars += '<i class="fas fa-star-half-alt"></i>';
    } else {
      // Empty star
      stars += '<i class="far fa-star"></i>';
    }
  }

  return stars;
}

// Render products
function renderProducts() {
  console.log("Rendering products function called");

  const productsContainer = document.getElementById("productsContainer");
  if (!productsContainer) {
    console.error("Products container not found in the DOM");
    // If the container doesn't exist yet, try again shortly
    setTimeout(renderProducts, 100);
    return;
  }

  console.log(
    "Found products container, adding " + products.length + " products"
  );
  let productsHTML = "";

  products.forEach((product, index) => {
    productsHTML += `
          <div class="col-lg-4 col-md-6 mb-4">
              <div class="product-card" data-product-index="${index}">
                  ${
                    product.discount
                      ? `<div class="discount-badge">${product.discount}</div>`
                      : ""
                  }
                  <div class="product-img-container">
                      <img src="${product.image}" alt="${
      product.name
    }" class="product-img">
                  </div>
                  <div class="product-details">
                      <h3 class="product-title">${product.name}</h3>
                      <div class="price-container">
                          <span class="original-price">${formatPrice(
                            product.originalPrice
                          )}</span>
                          <span class="current-price">${formatPrice(
                            product.currentPrice
                          )}</span>
                      </div>
                      <div class="ratings">
                          ${generateStars(product.rating)}
                      </div>
                      <div class="product-actions">
                          <button type="button" class="btn-cart add-to-cart">
                              Add to Cart <i class="fas fa-plus ms-1"></i>
                          </button>
                          <button type="button" class="btn-buy buy-now" data-bs-toggle="modal" data-bs-target="#buyNowModal">
                              Buy Now <i class="fas fa-shopping-cart ms-1"></i>
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      `;
  });

  productsContainer.innerHTML = productsHTML;

  // Add event listeners to the Buy Now buttons
  document.querySelectorAll(".buy-now").forEach((button) => {
    button.addEventListener("click", function () {
      const productCard = this.closest(".product-card");
      if (!productCard) return; // Guard clause

      const productIndex = productCard.dataset.productIndex;
      const product = products[productIndex];

      const modalProductName = document.getElementById("modalProductName");
      const modalProductPrice = document.getElementById("modalProductPrice");

      if (modalProductName) modalProductName.textContent = product.name;
      if (modalProductPrice)
        modalProductPrice.textContent = formatPrice(product.currentPrice);
    });
  });

  // Add event listeners to the Add to Cart buttons
  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", function () {
      const productCard = this.closest(".product-card");
      if (!productCard) return; // Guard clause

      const productIndex = productCard.dataset.productIndex;
      addToCart(productIndex);
    });
  });
}

// Cart functionality
function addToCart(productIndex) {
  const product = products[productIndex];
  if (!product) return; // Guard clause

  // Check if product already exists in cart
  const existingItemIndex = cart.findIndex(
    (item) => item.productIndex == productIndex
  );

  if (existingItemIndex !== -1) {
    // Product already in cart, increase quantity
    cart[existingItemIndex].quantity++;
  } else {
    // Add new product to cart
    cart.push({
      productIndex: productIndex,
      name: product.name,
      price: product.currentPrice,
      image: product.image,
      quantity: 1,
    });
  }

  updateCartUI();
  showCartNotification();
}

function removeFromCart(index) {
  if (index >= 0 && index < cart.length) {
    cart.splice(index, 1);
    updateCartUI();
  }
}

function increaseQuantity(index) {
  if (index >= 0 && index < cart.length) {
    cart[index].quantity++;
    updateCartUI();
  }
}

function decreaseQuantity(index) {
  if (index >= 0 && index < cart.length) {
    if (cart[index].quantity > 1) {
      cart[index].quantity--;
    } else {
      removeFromCart(index);
    }
    updateCartUI();
  }
}

// Enhanced updateCartUI with animation for counter
function updateCartUI() {
  const cartItemsContainer = document.getElementById("cartItems");
  const cartCountElements = document.querySelectorAll(".cart-count");
  const cartSubtotalElement = document.getElementById("cartSubtotal");
  const cartTaxElement = document.getElementById("cartTax");
  const cartTotalElement = document.getElementById("cartTotal");

  // Only update UI if elements exist
  if (!cartItemsContainer) return;

  // Update cart items display
  let cartItemsHTML = "";

  if (cart.length === 0) {
    cartItemsHTML = '<p class="text-center py-5">Your cart is empty</p>';
  } else {
    cart.forEach((item, index) => {
      cartItemsHTML += `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img">
          <div class="cart-item-details">
            <h6 class="cart-item-title">${item.name}</h6>
            <p class="cart-item-price">${formatPrice(item.price)}</p>
            <div class="cart-item-actions">
              <button class="quantity-btn" onclick="decreaseQuantity(${index})">-</button>
              <span class="cart-quantity">${item.quantity}</span>
              <button class="quantity-btn" onclick="increaseQuantity(${index})">+</button>
              <span class="remove-item" onclick="removeFromCart(${index})">
                <i class="fas fa-trash"></i>
              </span>
            </div>
          </div>
        </div>
      `;
    });
  }

  cartItemsContainer.innerHTML = cartItemsHTML;

  // Calculate totals
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.18; // 18% tax
  const total = subtotal + tax + 499; // 499 is shipping cost

  // Update cart count on ALL cart icons with animation
  cartCountElements.forEach((countElement) => {
    if (countElement) {
      // Store previous value to check if changed
      const prevValue = parseInt(countElement.textContent);

      // Update text
      countElement.textContent = cartCount;

      // Add animation if value changed
      if (prevValue !== cartCount) {
        // Remove animation class first (if exists)
        countElement.classList.remove("cart-count-updated");

        // Force browser reflow to restart animation
        void countElement.offsetWidth;

        // Add animation class
        countElement.classList.add("cart-count-updated");
      }
    }
  });

  // Update cart summary if elements exist
  if (cartSubtotalElement)
    cartSubtotalElement.textContent = formatPrice(subtotal);
  if (cartTaxElement) cartTaxElement.textContent = formatPrice(tax);
  if (cartTotalElement) cartTotalElement.textContent = formatPrice(total);
}

// Enhanced showCartNotification with better animation
function showCartNotification() {
  // Create a notification element
  const notification = document.createElement("div");
  notification.className = "alert alert-success alert-dismissible fade";
  notification.style.position = "fixed";
  notification.style.top = "20px";
  notification.style.right = "20px"; // Start off-screen
  notification.style.zIndex = "1060";
  // notification.style.transition = 'right 0.3s ease-in-out';
  notification.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  notification.innerHTML = `
      <strong>Success!</strong> Item added to cart.
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  // Add notification to the body
  document.body.appendChild(notification);

  // Force browser reflow
  void notification.offsetWidth;

  // Slide in
  notification.classList.add("show");
  notification.style.right = "20px";

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.style.right = "-300px";
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Search functionality
function searchProducts() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  const searchValue = searchInput.value.toLowerCase();
  const productCards = document.querySelectorAll(".product-card");

  productCards.forEach((card) => {
    const productTitle = card.querySelector(".product-title");
    if (!productTitle) return;

    const productName = productTitle.textContent.toLowerCase();

    if (productName.includes(searchValue)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

// Synchronize search inputs across different navbar versions
function syncSearchInputs() {
  const searchInput = document.getElementById("searchInput");
  const mobileSearchInput = document.getElementById("mobileSearchInput");
  const scrollSearchInput = document.getElementById("scrollSearchInput");

  // Determine which input triggered the event
  let sourceValue = "";
  if (document.activeElement === searchInput && searchInput) {
    sourceValue = searchInput.value;
  } else if (
    document.activeElement === mobileSearchInput &&
    mobileSearchInput
  ) {
    sourceValue = mobileSearchInput.value;
  } else if (
    document.activeElement === scrollSearchInput &&
    scrollSearchInput
  ) {
    sourceValue = scrollSearchInput.value;
  }

  // Update all inputs with the source value
  if (searchInput && document.activeElement !== searchInput) {
    searchInput.value = sourceValue;
  }
  if (mobileSearchInput && document.activeElement !== mobileSearchInput) {
    mobileSearchInput.value = sourceValue;
  }
  if (scrollSearchInput && document.activeElement !== scrollSearchInput) {
    scrollSearchInput.value = sourceValue;
  }

  // Perform search after syncing
  searchProducts();
}

// Filter functionality
function addFilterOptions() {
  const productsSection = document.querySelector(".products .container");
  if (!productsSection) return;

  // Check if filter container already exists
  if (productsSection.querySelector(".filter-container")) return;

  const filterContainer = document.createElement("div");
  filterContainer.className = "filter-container mb-4";
  filterContainer.innerHTML = `
    <div class="row">
      <div class="col-md-4 mb-3">
        <select class="form-select" id="sortFilter">
          <option value="">Sort By</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Rating</option>
        </select>
      </div>
      <div class="col-md-4 mb-3">
        <select class="form-select" id="categoryFilter">
          <option value="">All Categories</option>
          <option value="processor">Processors</option>
          <option value="storage">Storage</option>
          <option value="memory">Memory</option>
          <option value="motherboard">Motherboards</option>
          <option value="peripheral">Peripherals</option>
        </select>
      </div>
      <div class="col-md-4 mb-3">
        <div class="input-group">
          <span class="input-group-text">Price Range</span>
          <input type="number" class="form-control" placeholder="Min" id="minPrice">
          <input type="number" class="form-control" placeholder="Max" id="maxPrice">
          <button class="btn btn-primary" id="applyPriceFilter">Apply</button>
        </div>
      </div>
    </div>
  `;

  const sectionTitle = productsSection.querySelector(".section-title");
  if (sectionTitle) {
    productsSection.insertBefore(filterContainer, sectionTitle.nextSibling);
  } else {
    productsSection.appendChild(filterContainer);
  }

  // Add event listeners to filters
  const sortFilter = document.getElementById("sortFilter");
  const categoryFilter = document.getElementById("categoryFilter");
  const applyPriceFilter = document.getElementById("applyPriceFilter");

  if (sortFilter) sortFilter.addEventListener("change", filterProducts);
  if (categoryFilter) categoryFilter.addEventListener("change", filterProducts);
  if (applyPriceFilter)
    applyPriceFilter.addEventListener("click", filterProducts);
}

function filterProducts() {
  const sortFilter = document.getElementById("sortFilter");
  const categoryFilter = document.getElementById("categoryFilter");
  const minPriceInput = document.getElementById("minPrice");
  const maxPriceInput = document.getElementById("maxPrice");

  if (!sortFilter || !categoryFilter || !minPriceInput || !maxPriceInput) {
    console.log("Filter elements not found, rendering all products");
    renderProducts();
    return;
  }

  const sortValue = sortFilter.value;
  const categoryValue = categoryFilter.value;
  const minPrice = minPriceInput.value;
  const maxPrice = maxPriceInput.value;

  // If no filters are applied, just render all products
  if (!sortValue && !categoryValue && !minPrice && !maxPrice) {
    console.log("No filters applied, rendering all products");
    renderProducts();
    return;
  }

  let filteredProducts = [...products];

  // Filter by category
  if (categoryValue) {
    filteredProducts = filteredProducts.filter((p) => {
      if (p.category) {
        return p.category === categoryValue;
      } else {
        // Fallback to name-based filtering if category not set
        if (categoryValue === "processor") {
          return p.name.toLowerCase().includes("processor");
        } else if (categoryValue === "storage") {
          return p.name.toLowerCase().includes("ssd");
        } else if (categoryValue === "memory") {
          return p.name.toLowerCase().includes("ram");
        } else if (categoryValue === "motherboard") {
          return p.name.toLowerCase().includes("motherboard");
        } else if (categoryValue === "peripheral") {
          return (
            p.name.toLowerCase().includes("keyboard") ||
            p.name.toLowerCase().includes("mouse") ||
            p.name.toLowerCase().includes("monitor")
          );
        }
      }
      return false;
    });
  }

  // Filter by price range
  if (minPrice) {
    filteredProducts = filteredProducts.filter(
      (p) => p.currentPrice >= parseInt(minPrice)
    );
  }

  if (maxPrice) {
    filteredProducts = filteredProducts.filter(
      (p) => p.currentPrice <= parseInt(maxPrice)
    );
  }

  // Sort products
  if (sortValue === "price-low") {
    filteredProducts.sort((a, b) => a.currentPrice - b.currentPrice);
  } else if (sortValue === "price-high") {
    filteredProducts.sort((a, b) => b.currentPrice - a.currentPrice);
  } else if (sortValue === "rating") {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  }

  // Render filtered products
  const productsContainer = document.getElementById("productsContainer");
  if (!productsContainer) return;

  let productsHTML = "";

  if (filteredProducts.length === 0) {
    productsHTML =
      '<div class="col-12 text-center py-5"><h4>No products found matching your criteria</h4></div>';
  } else {
    filteredProducts.forEach((product, index) => {
      // Find the original index in the products array
      const originalIndex = products.findIndex((p) => p.name === product.name);

      productsHTML += `
              <div class="col-lg-4 col-md-6 mb-4">
                  <div class="product-card" data-product-index="${originalIndex}">
                      ${
                        product.discount
                          ? `<div class="discount-badge">${product.discount}</div>`
                          : ""
                      }
                      <div class="product-img-container">
                          <img src="${product.image}" alt="${
        product.name
      }" class="product-img">
                      </div>
                      <div class="product-details">
                          <h3 class="product-title">${product.name}</h3>
                          <div class="price-container">
                              <span class="original-price">${formatPrice(
                                product.originalPrice
                              )}</span>
                              <span class="current-price">${formatPrice(
                                product.currentPrice
                              )}</span>
                          </div>
                          <div class="ratings">
                              ${generateStars(product.rating)}
                          </div>
                          <div class="product-actions">
                              <button type="button" class="btn-cart add-to-cart">
                                  Add to Cart <i class="fas fa-plus ms-1"></i>
                              </button>
                              <button type="button" class="btn-buy buy-now" data-bs-toggle="modal" data-bs-target="#buyNowModal">
                                  Buy Now <i class="fas fa-shopping-cart ms-1"></i>
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          `;
    });
  }

  productsContainer.innerHTML = productsHTML;

  // Reattach event listeners
  document.querySelectorAll(".buy-now").forEach((button) => {
    button.addEventListener("click", function () {
      const productCard = this.closest(".product-card");
      if (!productCard) return;

      const productIndex = productCard.dataset.productIndex;
      const product = products[productIndex];

      const modalProductName = document.getElementById("modalProductName");
      const modalProductPrice = document.getElementById("modalProductPrice");

      if (modalProductName) modalProductName.textContent = product.name;
      if (modalProductPrice)
        modalProductPrice.textContent = formatPrice(product.currentPrice);
    });
  });

  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", function () {
      const productCard = this.closest(".product-card");
      if (!productCard) return;

      const productIndex = productCard.dataset.productIndex;
      addToCart(productIndex);
    });
  });
}

// Enhanced Cart sidebar functionality with smooth animations
function setupCartSidebar() {
  // Get all cart icons
  const cartIcon = document.getElementById("cartIcon");
  const mobileCartIcon = document.getElementById("mobileCartIcon");
  const scrollCartIcon = document.getElementById("scrollCartIcon");

  const cartSidebar = document.getElementById("cartSidebar");
  const cartOverlay = document.getElementById("cartOverlay");
  const closeCart = document.getElementById("closeCart");

  function openCart() {
    if (cartSidebar && cartOverlay) {
      // Add active class to trigger CSS transitions
      cartOverlay.classList.add("active");

      // Small delay for overlay to start showing before cart slides in
      setTimeout(() => {
        cartSidebar.classList.add("active");
      }, 50);

      document.body.style.overflow = "hidden";
    }
  }

  function closeCartSidebar() {
    if (cartSidebar && cartOverlay) {
      // Remove active class from cart first
      cartSidebar.classList.remove("active");

      // Small delay before hiding overlay (matches transition time)
      setTimeout(() => {
        cartOverlay.classList.remove("active");
        document.body.style.overflow = "";
      }, 300);
    }
  }

  // Add event listeners to all cart icons
  if (cartIcon) {
    cartIcon.addEventListener("click", openCart);
  }

  if (mobileCartIcon) {
    mobileCartIcon.addEventListener("click", openCart);
  }

  if (scrollCartIcon) {
    scrollCartIcon.addEventListener("click", openCart);
  }

  if (closeCart) {
    closeCart.addEventListener("click", closeCartSidebar);
  }

  if (cartOverlay) {
    cartOverlay.addEventListener("click", closeCartSidebar);
  }

  // Add escape key support to close cart
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && cartSidebar.classList.contains("active")) {
      closeCartSidebar();
    }
  });
}

// Hero section animation
function setupHeroAnimation() {
  const heroSection = document.querySelector(".hero");
  if (heroSection) {
    heroSection.style.opacity = "0";
    heroSection.style.transform = "translateY(20px)";
    heroSection.style.transition = "opacity 1s ease, transform 1s ease";

    setTimeout(() => {
      heroSection.style.opacity = "1";
      heroSection.style.transform = "translateY(0)";
    }, 200);
  }
}

// Product card animations
function setupProductCardAnimations() {
  const productCards = document.querySelectorAll(".product-card");

  if (productCards.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.1 }
    );

    productCards.forEach((card) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      observer.observe(card);
    });
  }
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded - starting to render products");

  // Force render all products immediately
  renderProducts();

  // Initialize the page
  updateCartUI();
  setupCartSidebar();
  setupHeroAnimation();

  // Add filter options if products section exists
  const productsSection = document.querySelector(".products .container");
  if (productsSection) {
    addFilterOptions();
  }

  // Add search functionality
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", searchProducts);
  }

  // Reset filters when page loads
  const sortFilter = document.getElementById("sortFilter");
  const categoryFilter = document.getElementById("categoryFilter");
  const minPriceInput = document.getElementById("minPrice");
  const maxPriceInput = document.getElementById("maxPrice");

  if (sortFilter) sortFilter.value = "";
  if (categoryFilter) categoryFilter.value = "";
  if (minPriceInput) minPriceInput.value = "";
  if (maxPriceInput) maxPriceInput.value = "";

  // Setup animations after a short delay to ensure products are rendered
  setTimeout(() => {
    console.log("Setting up product card animations");
    setupProductCardAnimations();
  }, 500);
});

// Ensure products container exists
function ensureProductsContainer() {
  console.log("Checking for products container");
  let productsContainer = document.getElementById("productsContainer");

  // If container doesn't exist, try to find a suitable container or create one
  if (!productsContainer) {
    console.log("Products container not found, looking for alternatives");

    // Try to find products section
    const productsSection = document.querySelector(".products");
    if (productsSection) {
      // Look for container inside products section
      let container = productsSection.querySelector(".container");

      if (!container) {
        // Create container if it doesn't exist
        container = document.createElement("div");
        container.className = "container";
        productsSection.appendChild(container);
      }

      // Add row for products
      let row = container.querySelector(".row");
      if (!row) {
        row = document.createElement("div");
        row.className = "row";
        container.appendChild(row);
      }

      // Set ID to row
      row.id = "productsContainer";
      console.log("Created products container");
    } else {
      // If no products section exists, create one in the body
      console.log("Creating entire products section structure");
      const section = document.createElement("section");
      section.className = "products py-5";

      const container = document.createElement("div");
      container.className = "container";

      const title = document.createElement("h2");
      title.className = "section-title text-center mb-5";
      title.textContent = "Our Products";

      const row = document.createElement("div");
      row.className = "row";
      row.id = "productsContainer";

      container.appendChild(title);
      container.appendChild(row);
      section.appendChild(container);

      // Add to body
      document.body.appendChild(section);
    }
  } else {
    console.log("Products container found with ID");
  }
}

// Also render products immediately (outside of DOMContentLoaded)
console.log("Script loaded - attempting immediate product render");
ensureProductsContainer();
renderProducts();

// =====================================================
//  DROPDOWN FUNCTIONALITY
// =====================================================

document.addEventListener("DOMContentLoaded", function () {
  // =====================================================
  // MANAGE ACTIVE STATE FOR ALL NAV LINKS
  // =====================================================
  const allNavLinks = document.querySelectorAll(
    ".navbar-nav .nav-link:not(.dropdown-toggle):not(.custom-dropdown-toggle)"
  );
  const dropdownToggles = document.querySelectorAll(
    ".navbar-nav .dropdown-toggle, .navbar-nav .custom-dropdown-toggle"
  );

  // Handle regular nav link clicks
  allNavLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      // Clear active class from all nav links
      clearActiveStates();

      // Add active class to clicked link
      this.classList.add("active");

      // Store active page/section
      sessionStorage.setItem("activePage", this.getAttribute("href"));
      sessionStorage.removeItem("activeNavSection");
    });
  });

  // Helper function to clear all active states
  function clearActiveStates() {
    allNavLinks.forEach((link) => link.classList.remove("active"));
    dropdownToggles.forEach((toggle) => toggle.classList.remove("active"));
  }

  // =====================================================
  // DROPDOWN FUNCTIONALITY WITH ALWAYS-VISIBLE MOBILE DROPDOWNS
  // =====================================================
  document.addEventListener("DOMContentLoaded", function () {
    // =====================================================
    // DESKTOP DROPDOWN FUNCTIONALITY
    // =====================================================
    const desktopDropdowns = document.querySelectorAll(".navbar-nav .dropdown");

    desktopDropdowns.forEach((dropdown) => {
      const dropdownMenu = dropdown.querySelector(".dropdown-menu");
      const dropdownToggle = dropdown.querySelector(
        ".dropdown-toggle, .custom-dropdown-toggle"
      );
      let timeout;

      // Add hover persistence for desktop
      dropdown.addEventListener("mouseenter", function () {
        if (window.innerWidth >= 992) {
          clearTimeout(timeout);
          dropdown.classList.add("show");
          dropdownMenu.classList.add("show");
        }
      });

      // Add slight delay before closing on mouseleave
      dropdown.addEventListener("mouseleave", function () {
        if (window.innerWidth >= 992) {
          timeout = setTimeout(function () {
            dropdown.classList.remove("show");
            dropdownMenu.classList.remove("show");
          }, 200); // 200ms delay before closing
        }
      });

      // Add click handler for dropdown links
      const dropdownLinks = dropdown.querySelectorAll(
        ".dropdown-menu .nav-link, .dropdown-menu .dropdown-item"
      );
      dropdownLinks.forEach((link) => {
        link.addEventListener("click", function () {
          // Close dropdown when clicking a link
          dropdown.classList.remove("show");
          dropdownMenu.classList.remove("show");

          // If using Bootstrap's API
          if (typeof bootstrap !== "undefined") {
            const bsDropdown = bootstrap.Dropdown.getInstance(dropdownToggle);
            if (bsDropdown) {
              bsDropdown.hide();
            }
          }

          // Handle additional functionality like active states if needed
          if (typeof clearActiveStates === "function") {
            clearActiveStates();
            dropdownToggle.classList.add("active");
          }

          // Store the active section in sessionStorage
          sessionStorage.setItem("activeNavSection", link.getAttribute("href"));
          sessionStorage.removeItem("activePage");

          // Close mobile sidebar if needed
          if (window.innerWidth < 992 && typeof bootstrap !== "undefined") {
            const mobileSidebar = document.getElementById("mobileSidebar");
            if (mobileSidebar) {
              const bsOffcanvas =
                bootstrap.Offcanvas.getInstance(mobileSidebar);
              if (bsOffcanvas) {
                bsOffcanvas.hide();
              }
            }
          }
        });
      });
    });

    // =====================================================
    // ALWAYS-VISIBLE MOBILE DROPDOWN FUNCTIONALITY
    // =====================================================
    // Add mobile-specific CSS to make dropdown always visible on mobile
    const mobileStyle = document.createElement("style");
    mobileStyle.textContent = `
    /* Mobile dropdown styles */
    @media (max-width: 991px) {
      /* Always show mobile dropdown menu */
      .mobile-dropdown .mobile-dropdown-menu {
        display: block !important;
        padding-left: 15px;
        margin-top: 5px;
        list-style: none;
      }
      
      /* Remove dropdown icon or make it always point to open state */
      .mobile-dropdown .mobile-dropdown-toggle {
        transform: rotate(180deg);
      }
      
      /* Optional: Hide the dropdown toggle on mobile */
      .mobile-dropdown .custom-mobile-dropdown .fa-caret-down {
        display: none;
      }
      
      /* Optional: Style the dropdown header like a category */
      .mobile-dropdown .custom-mobile-dropdown {
        font-weight: bold;
        color: #333; /* Adjust to match your design */
        pointer-events: none; /* Remove clickability */
      }
      
      /* Indent menu items for visual hierarchy */
      .mobile-dropdown-menu .nav-link {
        padding-left: 15px;
        font-size: 0.95em; /* Slightly smaller than parent */
      }
    }
    
    /* Desktop dropdown styles - hide for larger screens */
    @media (min-width: 992px) {
      .mobile-dropdown {
        display: none;
      }
    }
  `;
    document.head.appendChild(mobileStyle);

    // Get all mobile dropdown items
    const mobileDropdownItems = document.querySelectorAll(
      ".mobile-dropdown-menu .nav-link"
    );

    // Add click handlers for mobile dropdown items
    mobileDropdownItems.forEach((item) => {
      item.addEventListener("click", function () {
        // Close mobile sidebar if it exists
        const mobileSidebar = document.getElementById("mobileSidebar");
        if (mobileSidebar && typeof bootstrap !== "undefined") {
          const sidebar = bootstrap.Offcanvas.getInstance(mobileSidebar);
          if (sidebar) {
            sidebar.hide();
          }
        }

        // Store the active section in sessionStorage
        sessionStorage.setItem("activeNavSection", this.getAttribute("href"));
        sessionStorage.removeItem("activePage");
      });
    });

    // =====================================================
    // CLOSE DESKTOP DROPDOWNS WHEN CLICKING OUTSIDE
    // =====================================================
    document.addEventListener("click", function (e) {
      // For desktop dropdowns
      if (!e.target.closest(".dropdown")) {
        const openDropdowns = document.querySelectorAll(".dropdown.show");
        openDropdowns.forEach((openDropdown) => {
          openDropdown.classList.remove("show");
          const menu = openDropdown.querySelector(".dropdown-menu");
          if (menu) menu.classList.remove("show");

          if (typeof bootstrap !== "undefined") {
            const dropdownToggle = openDropdown.querySelector(
              ".dropdown-toggle, .custom-dropdown-toggle"
            );
            if (dropdownToggle) {
              const bsDropdown = bootstrap.Dropdown.getInstance(dropdownToggle);
              if (bsDropdown) {
                bsDropdown.hide();
              }
            }
          }
        });
      }
    });

    // Function to handle active states if needed
    window.clearActiveStates =
      window.clearActiveStates ||
      function () {
        const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
        navLinks.forEach((link) => {
          link.classList.remove("active");
        });
      };

    // Handle responsive behavior on window resize
    window.addEventListener("resize", function () {
      // No additional behavior needed as CSS media queries handle the display
    });
  });

  // =====================================================
  // HANDLE ACTIVE STATE ON PAGE LOAD AND SCROLL
  // =====================================================
  // Check for active section/page on page load
  function setActiveNavItem() {
    const activePage = sessionStorage.getItem("activePage");
    const activeSection = sessionStorage.getItem("activeNavSection");

    // First clear all active states
    clearActiveStates();

    if (activeSection) {
      // Find the dropdown menu item with this href
      const activeLink = document.querySelector(
        `.dropdown-menu .dropdown-item[href="${activeSection}"]`
      );
      if (activeLink) {
        // Set the parent dropdown as active
        const parentDropdown = activeLink.closest(".dropdown");
        if (parentDropdown) {
          const dropdownToggle = parentDropdown.querySelector(
            ".dropdown-toggle, .custom-dropdown-toggle"
          );
          if (dropdownToggle) {
            dropdownToggle.classList.add("active");
          }
        }
      }
    } else if (activePage) {
      // Find and activate regular nav link
      const activeNavLink = document.querySelector(
        `.navbar-nav .nav-link[href="${activePage}"]`
      );
      if (activeNavLink) {
        activeNavLink.classList.add("active");
      }
    } else {
      // Default behavior - check if we're on a specific page/section
      const currentPath = window.location.pathname;
      const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

      // Find link that matches current path
      navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        // Skip anchors and javascript links
        if (href && !href.startsWith("#") && !href.startsWith("javascript")) {
          if (
            href === currentPath ||
            href === currentPath + "/" ||
            currentPath.endsWith(href)
          ) {
            link.classList.add("active");
          }
        }
      });

      // If hash exists, check for matching section
      if (window.location.hash) {
        const hash = window.location.hash;
        const sectionLink = document.querySelector(
          `.dropdown-menu .dropdown-item[href="${hash}"]`
        );
        if (sectionLink) {
          const parentDropdown = sectionLink.closest(".dropdown");
          if (parentDropdown) {
            const dropdownToggle = parentDropdown.querySelector(
              ".dropdown-toggle, .custom-dropdown-toggle"
            );
            if (dropdownToggle) {
              clearActiveStates();
              dropdownToggle.classList.add("active");
            }
          }
        }
      }
    }
  }

  // Set active state on page load
  setActiveNavItem();

  // Update active state on scroll but only for section links
  // This prevents the product link from staying active when scrolling past sections
  window.addEventListener("scroll", function () {
    // Only update based on scroll if we have an active section
    if (sessionStorage.getItem("activeNavSection")) {
      // Get all sections that are targets of dropdown items
      const sections = document.querySelectorAll("section[id], div[id]");
      let currentSection = "";

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        // If we've scrolled to this section
        if (window.scrollY >= sectionTop - 200) {
          currentSection = "#" + section.getAttribute("id");
        }
      });

      if (currentSection !== "") {
        // Find the dropdown item that links to this section
        const activeLink = document.querySelector(
          `.dropdown-menu .dropdown-item[href="${currentSection}"]`
        );
        if (activeLink) {
          // Store the current section
          sessionStorage.setItem("activeNavSection", currentSection);

          // Set parent dropdown as active
          const parentDropdown = activeLink.closest(".dropdown");
          if (parentDropdown) {
            const dropdownToggle = parentDropdown.querySelector(
              ".dropdown-toggle, .custom-dropdown-toggle"
            );
            if (dropdownToggle) {
              clearActiveStates();
              dropdownToggle.classList.add("active");
            }
          }
        }
      }
    }
  });
});

document
  .getElementById("signupForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("newUsername").value;
    const email = document.getElementById("newEmail").value;
    const password = document.getElementById("newPassword").value;

    try {
      const res = await fetch("https://custom-core-backend.onrender.com/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Store user in localStorage
        // localStorage.setItem("user", JSON.stringify(data.user));
        
        document.getElementById('signupForm').reset();
        // ✅ Update navbar UI
        updateUIAfterLogin(data.user.name);

        // ✅ Show toast notification
        showSuccessToast("You've successfully logged in!");

        // ✅ Close modal
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("authModal")
        );
        modal.hide();
      } else {
        alert(data.message || data.error);
      }
    } catch (err) {
      alert("Something went wrong during login.");
      console.error(err);
    }
  });

function updateUIAfterLogin(name) {
  const userDropdown = document.getElementById("userDropdown");
  const usernameDisplay = document.getElementById("usernameDisplay");

  usernameDisplay.textContent = name;
  userDropdown.classList.remove("d-none");

  // Hide login button
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) loginBtn.classList.add("d-none");
}

function showSuccessToast(message) {
  const toastEl = document.getElementById("successToast");
  const toastBody = document.getElementById("successToastMessage");
  toastBody.textContent = message;

  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

window.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.name) {
    updateUIAfterLogin(user.name);
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("user");
  location.reload(); // Or reset UI manually
});
