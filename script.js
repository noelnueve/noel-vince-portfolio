const pageBody = document.body;
const themeButtons = document.querySelectorAll("[data-theme]");
const navLinks = document.querySelectorAll(".nav-links a");
const sectionNavLinks = [...navLinks].filter((link) => (
  link.hash
  && link.origin === window.location.origin
  && link.pathname === window.location.pathname
));
const trackedSections = sectionNavLinks
  .map((link) => document.querySelector(link.hash))
  .filter(Boolean);

document.querySelectorAll("img[data-fallback]").forEach((image) => {
  const showFallback = () => image.classList.add("is-missing");

  if (image.complete && image.naturalWidth === 0) {
    showFallback();
  } else {
    image.addEventListener("error", showFallback, { once: true });
  }
});

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const useLightTheme = button.dataset.theme === "light";
    pageBody.classList.toggle("light-theme", useLightTheme);
    themeButtons.forEach((themeButton) => {
      themeButton.setAttribute("aria-pressed", String(themeButton === button));
    });
  });
});

const activeSectionObserver = new IntersectionObserver((entries) => {
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

trackedSections.forEach((section) => activeSectionObserver.observe(section));

const animatedHeadings = document.querySelectorAll(
  ".section-heading h2, .detail-title, .detail-description h2, .contribution-panel h2, .detail-section h2"
);

const prepareHeadingWave = (heading) => {
  const headingText = heading.textContent.replace(/\s+/g, " ").trim();
  if (!headingText) return;

  heading.setAttribute("aria-label", headingText);

  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let textNode = walker.nextNode();

  while (textNode) {
    textNodes.push(textNode);
    textNode = walker.nextNode();
  }

  let letterIndex = 0;

  textNodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    const waveText = document.createElement("span");

    waveText.className = "wave-text";
    waveText.setAttribute("aria-hidden", "true");

    Array.from(node.nodeValue).forEach((character) => {
      const letter = document.createElement("span");
      const isSpace = /\s/.test(character);

      letter.className = isSpace ? "wave-letter wave-letter--space" : "wave-letter";
      letter.setAttribute("aria-hidden", "true");
      letter.textContent = isSpace ? "\u00a0" : character;
      letter.style.setProperty("--wave-delay", `${Math.min(letterIndex * 16, 200)}ms`);

      if (!isSpace) letterIndex += 1;
      waveText.append(letter);
    });

    fragment.append(waveText);
    node.replaceWith(fragment);
  });
};

animatedHeadings.forEach(prepareHeadingWave);

const headingEntranceObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    entry.target.classList.add("heading-3d-enter");
    headingEntranceObserver.unobserve(entry.target);
  });
}, {
  threshold: 0.35
});

animatedHeadings.forEach((heading) => headingEntranceObserver.observe(heading));

const contentRevealTargets = document.querySelectorAll(
  ".text-section .lead-copy, .skill-card, .experience-card, .project-card, .education-card, .credential-row, .contact-grid a, .detail-media, p.detail-kicker, .detail-description > p, .metrics-list, .contribution-panel, .detail-section"
);

const getRevealDelay = (target) => {
  const groupedParent = target.parentElement?.matches(
    ".skills-grid, .project-grid, .credential-list, .contact-grid"
  );

  if (!groupedParent) return 140;

  const siblingIndex = [...target.parentElement.children].indexOf(target);
  return 120 + Math.min(Math.max(siblingIndex, 0) * 70, 210);
};

contentRevealTargets.forEach((target) => {
  target.classList.add("content-reveal");
  target.style.setProperty("--reveal-delay", `${getRevealDelay(target)}ms`);
});

const contentRevealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    entry.target.classList.add("is-revealed");
    contentRevealObserver.unobserve(entry.target);
  });
}, {
  threshold: 0.2,
  rootMargin: "0px 0px -8%"
});

contentRevealTargets.forEach((target) => contentRevealObserver.observe(target));

const musicDrawer = document.querySelector("#music-drawer");

if (musicDrawer) {
  const spotifyTrackUrl = "https://open.spotify.com/track/5pmITEphUtjpCLmKiYIPl9";
  const musicToggle = document.querySelector("#music-toggle");
  const musicPanel = document.querySelector("#music-panel");
  const musicPlayButton = document.querySelector("#music-play");
  const musicCollapseButton = document.querySelector("#music-collapse");
  const musicStatus = document.querySelector("#music-status");
  const spotifyEmbed = document.querySelector("#spotify-embed");
  const musicFallback = document.querySelector("#music-fallback");
  let spotifyController;
  let spotifyApiPromise;
  let playerInitializing = false;
  let playerReady = false;
  let playRequested = false;
  let isPlaying = false;

  const setMusicStatus = (message) => {
    musicStatus.textContent = message;
  };

  const setPlaying = (playing) => {
    isPlaying = playing;
    musicDrawer.classList.toggle("is-playing", playing);
    musicPlayButton.textContent = playing ? "Pause" : "Play";
    musicPlayButton.setAttribute(
      "aria-label",
      `${playing ? "Pause" : "Play"} Soft Spot by keshi`
    );
  };

  const setExpanded = (expanded) => {
    musicDrawer.classList.toggle("is-expanded", expanded);
    musicToggle.setAttribute("aria-expanded", String(expanded));
    musicPanel.setAttribute("aria-hidden", String(!expanded));
    musicPanel.toggleAttribute("inert", !expanded);
  };

  const showFallback = () => {
    musicDrawer.classList.add("has-error");
    musicFallback.hidden = false;
    musicPlayButton.disabled = true;
    setMusicStatus("Spotify could not load here. Use the official Spotify link instead.");
  };

  const loadSpotifyApi = () => {
    if (spotifyApiPromise) return spotifyApiPromise;

    spotifyApiPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector("script[data-spotify-iframe-api]");
      const timeout = window.setTimeout(() => reject(new Error("Spotify API timeout")), 10000);
      const previousReadyHandler = window.onSpotifyIframeApiReady;

      window.onSpotifyIframeApiReady = (iframeApi) => {
        window.clearTimeout(timeout);
        previousReadyHandler?.(iframeApi);
        resolve(iframeApi);
      };

      if (existingScript) return;

      const spotifyScript = document.createElement("script");
      spotifyScript.src = "https://open.spotify.com/embed/iframe-api/v1";
      spotifyScript.async = true;
      spotifyScript.dataset.spotifyIframeApi = "true";
      spotifyScript.addEventListener("error", () => {
        window.clearTimeout(timeout);
        reject(new Error("Spotify API failed to load"));
      }, { once: true });
      document.body.append(spotifyScript);
    });

    return spotifyApiPromise;
  };

  const requestPlayback = () => {
    if (!spotifyController) return;

    try {
      spotifyController.resume();
      setMusicStatus("Starting playback…");
    } catch {
      setMusicStatus("Use the official Spotify controls below to start playback.");
    }
  };

  const initializePlayer = async () => {
    if (playerReady || spotifyController || playerInitializing) return;

    playerInitializing = true;
    musicPlayButton.disabled = true;
    setMusicStatus("Loading official Spotify player…");

    try {
      const iframeApi = await loadSpotifyApi();

      iframeApi.createController(spotifyEmbed, {
        url: spotifyTrackUrl,
        width: "100%",
        height: 80
      }, (controller) => {
        spotifyController = controller;
        playerInitializing = false;
        playerReady = true;
        musicPlayButton.disabled = false;
        setMusicStatus("Official Spotify player ready.");

        controller.addListener("playback_update", (event) => {
          const playing = !event.data.isPaused;
          setPlaying(playing);
          setMusicStatus(playing ? "Playing from Spotify." : "Paused.");
        });

        if (musicDrawer.classList.contains("is-expanded") && playRequested) {
          requestPlayback();
        }
      });
    } catch {
      playerInitializing = false;
      showFallback();
    }
  };

  const openPlayer = () => {
    setExpanded(true);
    playRequested = true;

    if (playerReady) {
      requestPlayback();
    } else {
      initializePlayer();
    }
  };

  const collapsePlayer = () => {
    playRequested = false;
    setExpanded(false);

    if (spotifyController) {
      try {
        spotifyController.pause();
      } catch {
        // Spotify's own controls remain available when programmatic pause is unavailable.
      }
    }

    setPlaying(false);
  };

  musicToggle.addEventListener("click", () => {
    if (musicDrawer.classList.contains("is-expanded")) {
      collapsePlayer();
      return;
    }

    openPlayer();
  });

  musicPlayButton.addEventListener("click", () => {
    if (!playerReady) return;

    if (isPlaying) {
      try {
        spotifyController.pause();
      } catch {
        setMusicStatus("Use the official Spotify controls below to pause playback.");
      }
      return;
    }

    playRequested = true;
    requestPlayback();
  });

  musicCollapseButton.addEventListener("click", collapsePlayer);
}
