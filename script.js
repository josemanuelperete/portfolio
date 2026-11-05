const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  siteNav.classList.toggle("is-open", !isOpen);
});

siteNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuToggle.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
  }
});

document.querySelector("#current-year").textContent = new Date().getFullYear();

const musicToggle = document.querySelector(".music-toggle");
const musicLabel = musicToggle.querySelector(".music-toggle__label");
const elevatorMelody = [72, 76, 79, 76, 74, 77, 81, 77, 72, 76, 79, 84, 81, 77, 76, 72];
const elevatorChords = [
  [60, 64, 67, 71],
  [62, 65, 69, 72],
  [55, 59, 62, 65],
  [60, 64, 67, 71],
];
const beatLength = 0.42;
let musicContext = null;
let musicMaster = null;
let musicTimer = null;
let musicStep = 0;
let musicPlaying = false;

function midiToFrequency(note) {
  return 440 * 2 ** ((note - 69) / 12);
}

function playTone(note, startAt, duration, volume, type = "sine") {
  const oscillator = musicContext.createOscillator();
  const envelope = musicContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(midiToFrequency(note), startAt);
  envelope.gain.setValueAtTime(0.0001, startAt);
  envelope.gain.linearRampToValueAtTime(volume, startAt + 0.06);
  envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  oscillator.connect(envelope);
  envelope.connect(musicMaster);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.02);
}

function playElevatorBeat() {
  const startAt = musicContext.currentTime + 0.03;
  const melodyNote = elevatorMelody[musicStep];
  if (melodyNote !== null) {
    playTone(melodyNote, startAt, beatLength * 0.82, 0.16);
  }

  if (musicStep % 4 === 0) {
    const chord = elevatorChords[Math.floor(musicStep / 4)];
    chord.forEach((note) => playTone(note, startAt, beatLength * 3.8, 0.035));
    playTone(chord[0] - 12, startAt, beatLength * 3.8, 0.07);
  }

  musicStep = (musicStep + 1) % elevatorMelody.length;
}

musicToggle.addEventListener("click", async () => {
  if (!window.AudioContext) {
    musicLabel.textContent = "AUDIO NO DISPONIBLE";
    musicToggle.disabled = true;
    return;
  }

  musicToggle.disabled = true;
  try {
    if (!musicContext) {
      musicContext = new window.AudioContext();
      musicMaster = musicContext.createGain();
      musicMaster.gain.value = 0.22;
      musicMaster.connect(musicContext.destination);
    }

    if (musicPlaying) {
      window.clearInterval(musicTimer);
      musicTimer = null;
      await musicContext.suspend();
      musicPlaying = false;
      musicToggle.setAttribute("aria-pressed", "false");
      musicToggle.setAttribute("aria-label", "Reanudar música de ascensor");
      musicLabel.textContent = "REANUDAR MÚSICA";
      return;
    }

    if (musicContext.state !== "running") {
      await musicContext.resume();
    }
    playElevatorBeat();
    musicTimer = window.setInterval(playElevatorBeat, beatLength * 1000);
    musicPlaying = true;
    musicToggle.setAttribute("aria-pressed", "true");
    musicToggle.setAttribute("aria-label", "Pausar música de ascensor");
    musicLabel.textContent = "PAUSAR MÚSICA";
  } catch (error) {
    musicLabel.textContent = "NO SE PUDO INICIAR";
    musicToggle.setAttribute("aria-label", "No se pudo iniciar la música");
    console.error("No se pudo iniciar la música de ascensor.", error);
  } finally {
    musicToggle.disabled = false;
  }
});

const revealElements = document.querySelectorAll(
  ".about__grid, .skills, .project-card, .projects__hint, .formation .section-title, .timeline article, .contact .section-label, .contact > p, .contact h2, .contact-link, .social-links"
);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if ("IntersectionObserver" in window && !prefersReducedMotion) {
  document.documentElement.classList.add("motion-ready");

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach((element) => {
    element.setAttribute("data-reveal", "");
    revealObserver.observe(element);
  });
}

if (!prefersReducedMotion) {
  const poseCycles = [
    { selector: ".pixel-person--hero", poses: ["#pixel-person-wave", "#pixel-person-point", "#pixel-person"] },
    { selector: ".pixel-person--about", poses: ["#pixel-person-point", "#pixel-person-wave", "#pixel-person-work"] },
    { selector: ".pixel-person--projects", poses: ["#pixel-person-work", "#pixel-person-point", "#pixel-person-wave"] },
    { selector: ".pixel-person--formation", poses: ["#pixel-person", "#pixel-person-wave", "#pixel-person-point"] },
    { selector: ".pixel-person--contact", poses: ["#pixel-person-wave", "#pixel-person-work", "#pixel-person-point"] },
  ];

  poseCycles.forEach(({ selector, poses }, index) => {
    const character = document.querySelector(selector);
    const sprite = character.querySelector("use");
    let poseIndex = 0;

    window.setInterval(() => {
      poseIndex = (poseIndex + 1) % poses.length;
      character.classList.add("is-changing");
      sprite.setAttribute("href", poses[poseIndex]);
      window.setTimeout(() => character.classList.remove("is-changing"), 450);
    }, 2400 + index * 170);
  });
}
