# Ammon Salter: personal website

The source of [ammonsalter-del.github.io/personal-website](https://ammonsalter-del.github.io/personal-website/). Seven pages about my research, teaching, collaborators, career, the free simulation games I build, and the academic cartoons I draw badly.

Plain HTML, one stylesheet, two scripts and a folder of pictures. No framework, no build step, no server code, no tracking. GitHub Pages serves the files as they are.

## The site

| Page | What is on it |
|---|---|
| `index.html` | A split-flap board of papers and games, a short biography, and the Substack panel |
| `research.html` | Recent articles, special issues, books, all 71 refereed articles with their DOIs, reports, current projects |
| `teaching.html` | This year's courses at Warwick and earlier teaching |
| `collaborators.html` | Co-authors by papers together, post-doctoral researchers, doctoral students, each line opening their page |
| `cv.html` | Posts held, visiting roles, prizes, leadership, public and policy roles, reports, databases, impact cases, editorial work |
| `games.html` | The I&E Playbook: The Disruptor, The Slingshot, Build, Bin, Boost, the educator's packs, the smaller games, how they are made, data and privacy |
| `cartoons.html` | Twelve cartoons in a viewer |
| `404.html` | Served for an address that does not exist |

## How it is built

`styles.css` holds everything visual: the night palette as custom properties, a per-page accent colour switched by `html[data-strand]`, and the split-flap boards. `solari.js` does the animation: the picture board on the home page draws to a canvas, and the list boards turn each cell or line through a few wrong values before landing. Boards start when they come into view. `sounds.js` is the optional board sound, off until asked for.

Everything is relative, so the site works from any folder or domain without changes. It degrades sensibly: with JavaScript off, every board shows its final text, and with `prefers-reduced-motion` set, nothing animates. On a phone the tabs fall into two rows of three, the boards stack, and the page titles scale down.

## Changing it

The pages are generated, not hand-edited, so an edit made here is lost at the next rebuild. The generator and the words document live outside this repository, with the working folder for the site. The words of every page sit in one Word document; it is edited, sent back, and the seven pages are rebuilt from it.

Pictures go in `images/` and are resized for the web before they are added.

## Publishing

Settings, Pages, deploy from a branch, `main`, folder `/ (root)`. A commit to `main` redeploys in a minute or two. `.nojekyll` stops GitHub from running the files through Jekyll.

For a custom domain: add a `CNAME` file at the root holding the domain alone, point the domain at GitHub (an ALIAS or ANAME record to `ammonsalter-del.github.io`, or GitHub's four A records), then turn on Enforce HTTPS once the certificate is issued. The canonical links, the `og:url` and `og:image` tags, `sitemap.xml` and `robots.txt` all carry the current address and have to be rebuilt for the new one.

## Credits and licence

Written and built by Ammon Salter, Warwick Business School, with AI assistance. The text and the pictures of my own work are mine. The games and their materials are released under CC BY-NC-SA 4.0. The board sound is by [matucha](https://freesound.org/s/174056/), CC BY-NC 4.0. The two typefaces, Barlow Condensed and Atkinson Hyperlegible, come from Google Fonts; Atkinson Hyperlegible was designed for low-vision readers, which is why it sets the body text.
