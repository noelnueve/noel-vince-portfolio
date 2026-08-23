const pageBody = document.body;
const themeToggle = document.querySelector("[data-theme-toggle]");
const photoThemeToggle = document.querySelector(".portrait-frame");
const themeStorageKey = "noel-portfolio-theme";
const rootElement = document.documentElement;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let themeTransitionActive = false;
const sectionNavLinks = [...document.querySelectorAll(".nav-links a")].filter((link) => (
  link.hash
  && link.origin === window.location.origin
  && link.pathname === window.location.pathname
));
const trackedSections = sectionNavLinks
  .map((link) => document.querySelector(link.hash))
  .filter(Boolean);

const applyTheme = (theme) => {
  const useLightTheme = theme === "light";

  pageBody.classList.toggle("light-theme", useLightTheme);
  themeToggle?.setAttribute("aria-pressed", String(useLightTheme));
  themeToggle?.setAttribute(
    "aria-label",
    `Switch to ${useLightTheme ? "dark" : "light"} theme`
  );
  photoThemeToggle?.setAttribute(
    "aria-label",
    `Switch to ${useLightTheme ? "dark" : "light"} theme`
  );
};

const getSavedTheme = () => {
  try {
    return window.localStorage.getItem(themeStorageKey);
  } catch {
    return null;
  }
};

const saveTheme = (theme) => {
  try {
    window.localStorage.setItem(themeStorageKey, theme);
  } catch {
    // Theme remains active for the current page.
  }
};

applyTheme(getSavedTheme() === "light" ? "light" : "dark");

const finishThemeTransition = () => {
  rootElement.classList.remove("theme-transition");
  themeTransitionActive = false;
};

const setTheme = (theme) => {
  const currentTheme = pageBody.classList.contains("light-theme") ? "light" : "dark";
  const canUseViewTransition = typeof document.startViewTransition === "function"
    && !prefersReducedMotion.matches;

  if (themeTransitionActive || theme === currentTheme) return;

  const updateTheme = () => {
    applyTheme(theme);
    saveTheme(theme);
  };

  if (!canUseViewTransition) {
    updateTheme();
    return;
  }

  themeTransitionActive = true;
  rootElement.classList.add("theme-transition");

  try {
    const transition = document.startViewTransition(updateTheme);

    transition.finished.then(finishThemeTransition, finishThemeTransition);
  } catch {
    finishThemeTransition();
    updateTheme();
  }
};

const toggleTheme = () => {
  const theme = pageBody.classList.contains("light-theme") ? "dark" : "light";

  setTheme(theme);
};

document.querySelectorAll("img[data-fallback]").forEach((image) => {
  const showFallback = () => image.classList.add("is-missing");

  if (image.complete && image.naturalWidth === 0) {
    showFallback();
  } else {
    image.addEventListener("error", showFallback, { once: true });
  }
});

themeToggle?.addEventListener("click", toggleTheme);

photoThemeToggle?.addEventListener("click", toggleTheme);
photoThemeToggle?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;

  event.preventDefault();
  toggleTheme();
});

if (trackedSections.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

    if (!visibleEntry) return;

    sectionNavLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${visibleEntry.target.id}`);
    });
  }, {
    rootMargin: "-25% 0px -55%",
    threshold: [0, 0.25, 0.5]
  });

  trackedSections.forEach((section) => sectionObserver.observe(section));
}

const revealTargets = document.querySelectorAll(`
  .section-heading,
  .detail-title,
  .detail-description h2,
  .contribution-panel h2,
  .detail-section h2,
  .text-section .lead-copy,
  .skill-card,
  .experience-card,
  .project-card,
  .education-card,
  .credential-row,
  .contact-grid a,
  .detail-media,
  p.detail-kicker,
  .detail-description > p,
  .metrics-list,
  .contribution-panel,
  .detail-section
`);

const getRevealDelay = (target) => {
  const groupedParent = target.parentElement?.matches(
    ".skills-grid, .project-grid, .credential-list, .contact-grid"
  );

  if (!groupedParent) return 140;

  const siblingIndex = [...target.parentElement.children].indexOf(target);
  return 120 + Math.min(Math.max(siblingIndex, 0) * 70, 210);
};

revealTargets.forEach((target) => {
  target.classList.add("content-reveal");
  target.style.setProperty("--reveal-delay", `${getRevealDelay(target)}ms`);
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    if (!prefersReducedMotion.matches) {
      const finishReveal = (event) => {
        if (event.target !== entry.target) return;

        entry.target.classList.remove("content-reveal");
        entry.target.style.removeProperty("--reveal-delay");
        entry.target.removeEventListener("animationend", finishReveal);
      };

      entry.target.addEventListener("animationend", finishReveal);
    }

    entry.target.classList.add("is-revealed");
    revealObserver.unobserve(entry.target);
  });
}, {
  threshold: 0.2,
  rootMargin: "0px 0px -8%"
});

revealTargets.forEach((target) => revealObserver.observe(target));

const audioPlayer = document.querySelector("#portfolio-audio");
const topbarMusicToggle = document.querySelector("#topbar-music-toggle");
const topbarVolumeInput = document.querySelector("#topbar-volume");
const topbarVolumeControl = document.querySelector(".topbar-volume");
const topbarVolumeButton = document.querySelector(".topbar-volume-button");
const musicDrawer = document.querySelector("#music-drawer");
const coffeeCompanion = document.querySelector("#coffee-companion");
const coffeeButton = document.querySelector(".coffee-button");
const musicStateKey = "noel-portfolio-music-state";
const volumeStorageKey = "noel-portfolio-volume";
const coffeeMessageStorageKey = "noel-portfolio-coffee-message-shown";

if (audioPlayer) {
  const musicToggle = document.querySelector("#music-toggle");
  const musicPanel = document.querySelector("#music-panel");
  const musicPlayButton = document.querySelector("#music-play");
  const musicCollapseButton = document.querySelector("#music-collapse");
  const musicStatus = document.querySelector("#music-status");
  const heroVolumeInput = document.querySelector("#hero-volume");
  const heroVolumeValue = document.querySelector("#hero-volume-value");
  const volumeInputs = [topbarVolumeInput, heroVolumeInput].filter(Boolean);
  let coffeeMessageTimer;
  let coffeeMessageHideTimer;
  let hasShownCoffeeMessage = (() => {
    try {
      return window.sessionStorage.getItem(coffeeMessageStorageKey) === "true";
    } catch {
      return false;
    }
  })();

  const setMusicStatus = (message) => {
    if (musicStatus) musicStatus.textContent = message;
  };

  const saveMusicState = () => {
    try {
      window.sessionStorage.setItem(musicStateKey, JSON.stringify({
        currentTime: audioPlayer.currentTime,
        wasPlaying: !audioPlayer.paused
      }));
    } catch {
      // Playback remains available on the current page.
    }
  };

  const getMusicState = () => {
    try {
      return JSON.parse(window.sessionStorage.getItem(musicStateKey)) || {};
    } catch {
      return {};
    }
  };

  const getSavedVolume = () => {
    try {
      const storedVolume = window.localStorage.getItem(volumeStorageKey);
      const savedVolume = Number(storedVolume);

      return storedVolume !== null && Number.isFinite(savedVolume) && savedVolume >= 0 && savedVolume <= 1
        ? savedVolume
        : 0.3;
    } catch {
      return 0.3;
    }
  };

  const syncVolumeControls = () => {
    const percentage = Math.round(audioPlayer.volume * 100);

    volumeInputs.forEach((input) => {
      input.value = String(audioPlayer.volume);
      input.setAttribute("aria-valuetext", `${percentage}%`);
    });

    if (heroVolumeValue) heroVolumeValue.value = `${percentage}%`;
  };

  const setTopbarVolumeExpanded = (expanded) => {
    topbarVolumeControl?.classList.toggle("is-expanded", expanded);
    topbarVolumeButton?.setAttribute("aria-expanded", String(expanded));
  };

  const supportsHover = window.matchMedia("(hover: hover)");

  topbarVolumeButton?.addEventListener("click", () => {
    if (supportsHover.matches) return;

    const expanded = !topbarVolumeControl?.classList.contains("is-expanded");
    setTopbarVolumeExpanded(expanded);

    if (!expanded) topbarVolumeButton.blur();
  });

  topbarVolumeControl?.addEventListener("focusin", () => {
    topbarVolumeButton?.setAttribute("aria-expanded", "true");
  });

  topbarVolumeControl?.addEventListener("focusout", () => {
    window.setTimeout(() => {
      if (!topbarVolumeControl.contains(document.activeElement)) {
        topbarVolumeButton?.setAttribute("aria-expanded", "false");
      }
    }, 0);
  });

  document.addEventListener("pointerdown", (event) => {
    if (!supportsHover.matches && !topbarVolumeControl?.contains(event.target)) {
      setTopbarVolumeExpanded(false);

      if (document.activeElement instanceof HTMLElement
        && topbarVolumeControl?.contains(document.activeElement)) {
        document.activeElement.blur();
      }
    }
  });

  const setVolume = (value) => {
    const volume = Math.min(1, Math.max(0, Number(value)));

    if (!Number.isFinite(volume)) return;

    audioPlayer.volume = volume;
    syncVolumeControls();

    try {
      window.localStorage.setItem(volumeStorageKey, String(volume));
    } catch {
      // Volume remains active for the current page.
    }
  };

  const popTopbarMusicControl = () => {
    if (!topbarMusicToggle || prefersReducedMotion.matches) return;

    topbarMusicToggle.classList.remove("is-popping");
    void topbarMusicToggle.offsetWidth;
    topbarMusicToggle.classList.add("is-popping");
  };

  const hideCoffeeMessage = () => {
    if (!coffeeCompanion) return;

    window.clearTimeout(coffeeMessageTimer);
    window.clearTimeout(coffeeMessageHideTimer);
    coffeeCompanion.classList.remove("is-message-visible");
    coffeeCompanion.classList.remove("is-message-hiding");
  };

  const showCoffeeMessage = (delay = 0) => {
    if (!coffeeCompanion) return;

    hideCoffeeMessage();
    coffeeMessageTimer = window.setTimeout(() => {
      coffeeCompanion.classList.add("is-message-visible");
      coffeeMessageHideTimer = window.setTimeout(() => {
        coffeeCompanion.classList.remove("is-message-visible");
        coffeeCompanion.classList.add("is-message-hiding");
      }, 1800);
    }, delay);
  };

  const showCoffee = () => {
    if (!coffeeCompanion) return;

    coffeeCompanion.classList.remove("is-exiting");
    coffeeCompanion.classList.remove("is-visible");
    void coffeeCompanion.offsetWidth;
    coffeeCompanion.classList.add("is-visible", "is-grooving");

    if (hasShownCoffeeMessage) return;

    hasShownCoffeeMessage = true;
    try {
      window.sessionStorage.setItem(coffeeMessageStorageKey, "true");
    } catch {}
    showCoffeeMessage(150);
  };

  const hideCoffee = () => {
    if (!coffeeCompanion || !coffeeCompanion.classList.contains("is-visible")) return;

    hideCoffeeMessage();
    if (prefersReducedMotion.matches) {
      coffeeCompanion.classList.remove("is-grooving", "is-exiting", "is-visible");
      return;
    }

    coffeeCompanion.classList.remove("is-grooving");
    coffeeCompanion.classList.add("is-exiting");
  };

  coffeeCompanion?.addEventListener("animationend", (event) => {
    if (event.target !== coffeeCompanion || event.animationName !== "coffee-exit") return;

    coffeeCompanion.classList.remove("is-exiting", "is-visible");
  });

  coffeeButton?.addEventListener("click", () => {
    if (coffeeCompanion?.classList.contains("is-visible")) {
      showCoffeeMessage();
    }
  });

  const setPlaying = (playing) => {
    topbarMusicToggle?.classList.toggle("is-playing", playing);
    topbarMusicToggle?.setAttribute("aria-pressed", String(playing));
    topbarMusicToggle?.setAttribute(
      "aria-label",
      `${playing ? "Pause" : "Play"} background music`
    );

    const topbarLabel = topbarMusicToggle?.querySelector(".topbar-music-label");
    if (topbarLabel) topbarLabel.textContent = playing ? "Pause" : "Play";

    musicDrawer?.classList.toggle("is-playing", playing);
    if (musicPlayButton) {
      musicPlayButton.textContent = playing ? "Pause" : "Play";
      musicPlayButton.setAttribute(
        "aria-label",
        `${playing ? "Pause" : "Play"} Cool Jazz Loops`
      );
    }

    if (playing) {
      showCoffee();
    } else {
      hideCoffee();
    }
  };

  const setExpanded = (expanded) => {
    if (!musicDrawer || !musicToggle || !musicPanel) return;

    musicDrawer.classList.toggle("is-expanded", expanded);
    musicToggle.setAttribute("aria-expanded", String(expanded));
    musicPanel.setAttribute("aria-hidden", String(!expanded));
    musicPanel.toggleAttribute("inert", !expanded);
  };

  const playAudio = async (isRestoring = false) => {
    try {
      await audioPlayer.play();
      if (!isRestoring) setMusicStatus("Playing Cool Jazz Loops.");
    } catch {
      setPlaying(false);
      setMusicStatus("Press play to continue the music.");
    }
  };

  const pauseAudio = () => {
    audioPlayer.pause();
    setMusicStatus("Paused.");
  };

  const restoreMusic = () => {
    const { currentTime, wasPlaying } = getMusicState();

    if (Number.isFinite(currentTime) && currentTime > 0) {
      audioPlayer.currentTime = currentTime;
    }

    if (wasPlaying) playAudio(true);
  };

  audioPlayer.addEventListener("play", () => {
    setPlaying(true);
    popTopbarMusicControl();
    saveMusicState();
  });

  audioPlayer.addEventListener("pause", () => {
    setPlaying(false);
    saveMusicState();
  });

  audioPlayer.addEventListener("ended", () => {
    setPlaying(false);
    saveMusicState();
    setMusicStatus("Finished playing.");
  });

  audioPlayer.addEventListener("error", () => {
    setMusicStatus("Music file could not be loaded.");
  });

  audioPlayer.addEventListener("volumechange", syncVolumeControls);

  volumeInputs.forEach((input) => {
    input.addEventListener("input", () => setVolume(input.value));
  });

  setVolume(getSavedVolume());

  if (audioPlayer.readyState >= 1) {
    restoreMusic();
  } else {
    audioPlayer.addEventListener("loadedmetadata", restoreMusic, { once: true });
  }
  window.addEventListener("pagehide", saveMusicState);

  topbarMusicToggle?.addEventListener("click", () => {
    if (audioPlayer.paused) {
      playAudio();
    } else {
      pauseAudio();
    }
  });

  musicToggle?.addEventListener("click", () => {
    if (musicDrawer?.classList.contains("is-expanded")) {
      setExpanded(false);
      pauseAudio();
      return;
    }

    setExpanded(true);
    playAudio();
  });

  musicPlayButton?.addEventListener("click", () => {
    if (audioPlayer.paused) {
      playAudio();
    } else {
      pauseAudio();
    }
  });

  musicCollapseButton?.addEventListener("click", () => {
    setExpanded(false);
    pauseAudio();
  });
}
