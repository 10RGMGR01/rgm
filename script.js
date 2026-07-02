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

document.querySelector(".contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector("button");
  const originalText = button.textContent;
  button.textContent = "Message ready";
  setTimeout(() => {
    button.textContent = originalText;
  }, 1600);
});
