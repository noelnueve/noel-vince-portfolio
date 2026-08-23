# Noel V. Portfolio

A responsive personal portfolio for Noel V., a Computer Engineering graduate focused on software development, embedded systems, computer vision, and interactive web experiences.

Built as a dependency-free static site with HTML, CSS, and JavaScript.

## Features

- Responsive single-page portfolio with dedicated project detail pages
- Dark and light themes with a diagonal view-transition effect
- Theme-aware hero photo transition
- One-time scroll reveal animations with reduced-motion support
- Interactive local music player with play/pause, synchronized volume controls, and animated equalizers
- Music-reactive coffee companion with an on-demand speech bubble
- Accessible keyboard controls for the theme, music, volume, portrait, and coffee companion
- Downloadable resume and direct email, GitHub, LinkedIn, and phone links

## Project structure

```text
.
├── index.html                    # Main portfolio page
├── projects/
│   ├── tela-sorb.html            # TELA-SORB project details
│   └── chexam.html               # CHEXAM project details
├── style.css                     # Shared visual styles and responsive rules
├── script.js                     # Theme, animation, music, and UI behavior
└── assets/
    ├── profile/                  # Light and dark hero photos
    ├── projects/                 # Project card and detail images
    ├── music/                    # Local background track
    ├── coffeeAnimation/          # Coffee companion artwork
    └── resume/                   # Downloadable PDF resume
```

## Run locally

Open the project folder in a local static server, such as the VS Code Live Server extension, then visit `index.html` in your browser.

No package installation, build step, or environment variables are required.

For a quick JavaScript syntax check:

```bash
node --check script.js
```

## Deploy to Vercel

This is a static HTML/CSS/JavaScript project. Vercel does not need a build step for this setup.

1. Commit and push the complete project, including `assets/music/` and `assets/coffeeAnimation/`.
2. Import the Git repository into Vercel.
3. Set the Framework Preset to **Other**.
4. Leave the Build Command blank.
5. Leave the Output Directory at the project root (`.`), then deploy.

Vercel’s current guidance for static websites is to use the **Other** framework preset and skip the build step: [Vercel static build configuration](https://vercel.com/docs/builds#skipping-the-build-step).

## Before each deployment

- Confirm all image, music, and resume files are present under `assets/`.
- Keep asset filenames and capitalization aligned with the paths used in the HTML; Vercel runs on a case-sensitive filesystem.
- Verify the resume download at `assets/resume/noelNueve-resume.pdf`.
- Confirm you have the right to publish the music file in `assets/music/`.
- Run `node --check script.js` and test the homepage plus both project pages.

## Notes for future updates

- Add new project images under `assets/projects/` and create a matching page under `projects/` when needed.
- The shared topbar, theme, music player, and coffee companion are used by every page, so update their markup consistently across `index.html` and project detail pages.
- Theme preference, volume, music position, and the coffee message state are stored in the browser to keep navigation between project pages smooth.
