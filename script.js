
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  const navItems = document.querySelectorAll(".nav-link");
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  const currentYear = document.getElementById("currentYear");

  // Automatically update the footer year.
  currentYear.textContent = new Date().getFullYear();

  // Mobile navigation.
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );
  });

  // Close the mobile menu when a navigation link is clicked.
  navItems.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");

      navItems.forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
    });
  });

  // Highlight the section currently visible on the screen.
  const sections = document.querySelectorAll("main section[id]");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          navItems.forEach((link) => {
            const matches = link.getAttribute("href") ===
              `#${entry.target.id}`;

            link.classList.toggle("active", matches);
          });
        });
      },
      {
        rootMargin: "-25% 0px -60% 0px",
        threshold: 0
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  // Contact form: send data to the Express server.
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    formStatus.textContent = "";
    formStatus.classList.remove("error");

    const submitButton = contactForm.querySelector(
      'button[type="submit"]'
    );

    const formData = {
      name: contactForm.elements.name.value.trim(),
      email: contactForm.elements.email.value.trim(),
      subject: contactForm.elements.subject.value.trim(),
      message: contactForm.elements.message.value.trim()
    };

    if (!formData.name || !formData.email || !formData.message) {
      formStatus.textContent = "Please complete all required fields.";
      formStatus.classList.add("error");
      return;
    }

    if (formData.name.length > 100 ||
        formData.email.length > 150 ||
        formData.subject.length > 150 ||
        formData.message.length > 3000) {
      formStatus.textContent = "One or more fields exceed the allowed length.";
      formStatus.classList.add("error");
      return;
    }

    submitButton.disabled = true;
    submitButton.innerHTML = "Sending message...";

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to send your message.");
      }

      formStatus.textContent =
        result.message || "Your message was submitted successfully.";

      contactForm.reset();
    } catch (error) {
      formStatus.textContent =
        error.message || "Could not send the message. Please try again.";
      formStatus.classList.add("error");
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Send Message <span>↗</span>';
    }
  });
});
