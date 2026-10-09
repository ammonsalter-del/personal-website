# Ammon Salter, personal website

A static site: seven HTML pages, one stylesheet, two scripts, and the pictures. No build step, no framework, no server code. It is published with GitHub Pages straight from this repository.

## What is here

| File | What it is |
|---|---|
| `index.html` | Home: the split-flap picture board, the biography, the Substack panel |
| `research.html` | Research: recent articles, special issues, books, the full article list, reports, current projects |
| `teaching.html` | Teaching: this year's courses and earlier teaching |
| `collaborators.html` | Co-authors, post-doctoral researchers, doctoral students |
| `cv.html` | Career: posts, visiting roles, prizes, leadership, public and policy roles, reports, databases, impact cases, editorial work |
| `games.html` | The I&E Playbook: the three simulations, educator's packs, smaller games, how they are made, data and privacy |
| `cartoons.html` | The cartoon viewer |
| `404.html` | Shown for an address that does not exist |
| `styles.css` | All the styling |
| `solari.js` | The split-flap boards and the picture board |
| `sounds.js` | The optional board sound |
| `images/` | Pictures, 62 files |
| `favicon.svg`, `apple-touch-icon.png` | The browser-tab and home-screen icons |
| `robots.txt` | Lets search engines index everything |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are |

## Publishing it

1. Make a repository and put these files at its root, keeping `images/` as a folder.
2. In the repository's Settings, Pages, set the source to "Deploy from a branch", branch `main`, folder `/ (root)`.
3. The site appears at `https://<user>.github.io/<repository>/` after a minute or two.
4. For the domain from Mythic Beasts: add a file called `CNAME` at the root holding the domain and nothing else, then point the domain at GitHub (an ALIAS or ANAME record to `<user>.github.io`, or the four A records GitHub lists). Turn on "Enforce HTTPS" in Settings, Pages once the certificate is issued.

## Still to add once the domain is settled

- `CNAME`
- A `<link rel="canonical">` on each page, and `og:url` and `og:image` for link previews, all of which need the full address
- `sitemap.xml`, which needs absolute addresses

## Editing the words

The words come from a Word document, SITE-WORDS-vNN.docx, kept with the mock in the folder this was built from. Edit that, send it back, and the pages are rebuilt from it.

Licence: the text and pictures are Ammon Salter's. The games and their materials are released under CC BY-NC-SA 4.0. The board sound is by matucha, CC BY-NC 4.0.
