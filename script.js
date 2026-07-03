const nav = document.querySelector("[data-nav]");
const menuButton = document.querySelector("[data-menu-button]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const mouseGlow = document.querySelector(".mouse-glow");
const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll(".counter");

window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 24);
});

menuButton.addEventListener("click", () => {
  document.body.classList.toggle("menu-open");
  mobileNav.classList.toggle("open");
});

mobileNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
    mobileNav.classList.remove("open");
  });
});

window.addEventListener("pointermove", (event) => {
  mouseGlow.style.transform = `translate(${event.clientX - 180}px, ${event.clientY - 180}px)`;
});

function animateCounter(counter) {
  const target = Number(counter.dataset.target);
  const duration = 1200;
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    counter.textContent = Math.round(target * eased);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("visible");

      if (entry.target.classList.contains("stat-card")) {
        const counter = entry.target.querySelector(".counter");
        if (counter && !counter.dataset.done) {
          counter.dataset.done = "true";
          animateCounter(counter);
        }
      }

      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.18 }
);

revealItems.forEach((item) => observer.observe(item));
counters.forEach((counter) => {
  const card = counter.closest(".stat-card");
  if (card) observer.observe(card);
});

const loadEmailJS = () => {
  if (typeof emailjs !== "undefined") {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load EmailJS SDK."));
    document.head.appendChild(script);
  });
};

const initEmailJS = async () => {
  try {
    await loadEmailJS();
    if (typeof emailjs !== "undefined" && emailjs.init) {
      emailjs.init("_vHZp-xdVXsqPZXlm");
    }
  } catch (error) {
    console.warn("EmailJS SDK not loaded.", error);
  }
};

initEmailJS();

const contactForm = document.getElementById("contact-form") || document.querySelector(".contact-form");
const contactFeedback = document.getElementById("contact-feedback");
let contactFeedbackTimeout = null;

const showContactFeedback = (message, type) => {
  if (!contactFeedback) return;
  if (contactFeedbackTimeout) {
    clearTimeout(contactFeedbackTimeout);
  }
  contactFeedback.textContent = message;
  contactFeedback.hidden = false;
  contactFeedback.classList.toggle("success", type === "success");
  contactFeedback.classList.toggle("error", type === "error");
  contactFeedbackTimeout = setTimeout(hideContactFeedback, 5000);
};

const hideContactFeedback = () => {
  if (!contactFeedback) return;
  contactFeedback.hidden = true;
  contactFeedback.classList.remove("success", "error");
  if (contactFeedbackTimeout) {
    clearTimeout(contactFeedbackTimeout);
    contactFeedbackTimeout = null;
  }
};

if (contactForm) {
  const submitButton = contactForm.querySelector("button");
  const originalButtonText = submitButton ? submitButton.textContent : "Send";

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideContactFeedback();
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    if (typeof emailjs === "undefined") {
      showContactFeedback("Loading EmailJS. Please wait and try again.", "error");
      await initEmailJS();
      if (typeof emailjs === "undefined" || !emailjs.sendForm) {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
        return;
      }
    }

    if (typeof emailjs !== "undefined" && emailjs.sendForm) {
      emailjs
        .sendForm("service_ww7fwaf", "service_ww7fwaf", contactForm)
        .then(() => {
          if (submitButton) submitButton.textContent = "Sent!";
          contactForm.reset();
          showContactFeedback("Message sent successfully. I will reply soon.", "success");
        })
        .catch(() => {
          if (submitButton) submitButton.textContent = "Try again";
          showContactFeedback("Message failed to send. Please try again.", "error");
        })
        .finally(() => {
          setTimeout(() => {
            if (submitButton) {
              submitButton.disabled = false;
              submitButton.textContent = originalButtonText;
            }
          }, 1600);
        });
    } else {
      console.warn("EmailJS not available — cannot send form.");
      showContactFeedback("EmailJS is not loaded. Please refresh and try again.", "error");
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
} else {
  console.warn("Contact form not found in the document.");
}
