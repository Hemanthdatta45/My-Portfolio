const topbar = document.querySelector(".topbar");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".nav-links a");
const revealItems = document.querySelectorAll(".reveal");
const sections = document.querySelectorAll("main section, .hero");
const progressBar = document.querySelector(".scroll-progress");
const glow = document.querySelector(".pointer-glow");
const hero = document.querySelector(".hero");
const heroContent = document.querySelector(".hero-content");
const typingText = document.querySelector(".typing-text");
const countItems = document.querySelectorAll("[data-count]");
const tiltCards = document.querySelectorAll(".project-card, .credential-card");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function updateHeader() {
  topbar.classList.toggle("scrolled", window.scrollY > 24);
}

function updateScrollProgress() {
  const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = pageHeight > 0 ? (window.scrollY / pageHeight) * 100 : 0;
  progressBar.style.setProperty("--scroll-width", `${progress}%`);
  hero.style.setProperty("--hero-shift", `${Math.min(window.scrollY * 0.12, 80)}px`);
}

function closeMenu() {
  topbar.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

menuToggle.addEventListener("click", () => {
  const isOpen = topbar.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16
  }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min((index % 4) * 80, 240)}ms`;
  revealObserver.observe(item);
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  {
    rootMargin: "-42% 0px -46% 0px"
  }
);

sections.forEach((section) => sectionObserver.observe(section));

function animateCounter(item) {
  const target = Number(item.dataset.count);
  const duration = 900;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    item.textContent = Math.round(target * eased);

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.8
  }
);

countItems.forEach((item) => counterObserver.observe(item));

function startTypingLoop() {
  if (!typingText || prefersReducedMotion) {
    return;
  }

  const roles = typingText.dataset.roles.split("|");
  let roleIndex = 0;
  let letterIndex = roles[0].length;
  let deleting = true;

  function type() {
    const current = roles[roleIndex];
    typingText.textContent = current.slice(0, letterIndex);

    if (deleting) {
      letterIndex -= 1;
      if (letterIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      }
    } else {
      letterIndex += 1;
      if (letterIndex === roles[roleIndex].length) {
        deleting = true;
        setTimeout(type, 1100);
        return;
      }
    }

    setTimeout(type, deleting ? 44 : 72);
  }

  setTimeout(type, 1200);
}

function handlePointerMove(event) {
  if (prefersReducedMotion) {
    return;
  }

  document.documentElement.style.setProperty("--glow-x", `${event.clientX}px`);
  document.documentElement.style.setProperty("--glow-y", `${event.clientY}px`);

  const x = (event.clientX / window.innerWidth - 0.5) * 12;
  const y = (event.clientY / window.innerHeight - 0.5) * 12;
  heroContent.style.setProperty("--hero-x", `${x}px`);
  heroContent.style.setProperty("--hero-y", `${y}px`);
}

tiltCards.forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    if (prefersReducedMotion) {
      return;
    }

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 8;
    const rotateX = ((0.5 - y / rect.height)) * 8;

    card.style.setProperty("--tilt-x", `${rotateX}deg`);
    card.style.setProperty("--tilt-y", `${rotateY}deg`);
  });

  card.addEventListener("mouseleave", () => {
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
  });
});

window.addEventListener("scroll", () => {
  updateHeader();
  updateScrollProgress();
}, { passive: true });

window.addEventListener("pointermove", handlePointerMove, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 840) {
    closeMenu();
  }

  updateScrollProgress();
});

updateHeader();
updateScrollProgress();
startTypingLoop();
