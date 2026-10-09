# Personal academic website

The source of [ammonsalter-del.github.io/personal-website](https://ammonsalter-del.github.io/personal-website/), the website of Ammon Salter, Professor of Technology and Innovation Management at Warwick Business School. It has seven pages: research, teaching, collaborators, career, the simulation games of the I&E Playbook, academic humour comics, and a home page.

GitHub Pages publishes the site from this repository, which is why the repository is public. Anyone who wants a site like it is welcome to fork it.

## What it is made of

Plain HTML and CSS with two small scripts. There is no framework and no build step. The only outside request is for two typefaces from Google Fonts. It comes to about 7 MB, nearly all of that pictures.

| | |
|---|---|
| `index.html` and six more pages | research, teaching, collaborators, career, the games, the comics |
| `404.html` | for an address that does not exist |
| `styles.css` | the palette, the per-page accent colour, the boards |
| `solari.js` | the animation: a canvas picture board on the home page, and boards whose cells or lines turn through a few wrong values before they land |
| `sounds.js`, `sounds/` | the board sound, eight short clips, fetched only if a reader turns it on |
| `images/` | 51 pictures |

The design copies a railway departures board of the sort Solari made. The tabs are the departures strip, and page titles and lists turn over like the flaps.

With JavaScript switched off, every board shows its final text. A reader whose system asks for reduced motion gets no animation. On a phone the tabs fall into two rows, the boards put each column on its own line, and the titles scale down. The body typeface is Atkinson Hyperlegible, which the Braille Institute designed for low-vision readers.

## Running it

Clone the repository and open `index.html`, or serve the folder with `python3 -m http.server` or anything else static. Nothing needs installing. The paths are all relative, so it runs from any folder or domain.

To publish a fork: Settings, Pages, deploy from a branch, `main`, folder `/ (root)`. The empty `.nojekyll` file stops GitHub running everything through Jekyll first. A custom domain needs a `CNAME` file holding the domain by itself, a DNS record pointing at GitHub, and Enforce HTTPS switched on once the certificate arrives. The canonical links, the `og:` tags and `sitemap.xml` all name the current address, so they need editing too.

## Changing it

Everything a reader sees is in the HTML, so a text editor will do.

The pages are self-contained. Each has the header and tab strip, then its content, then the footer. To add one, copy a page, rename it, and edit the tab strip in all of them.

The palette sits in `:root` at the top of `styles.css`. `--accent` is set per page by `html[data-strand="..."]`, which gives each tab its own colour.

The home page ends with a `PICTURE_FRAMES` list, one entry per frame: an id, an image and a caption. Replace them with your own pictures, about 1200px wide, and the board handles the cropping.

A list board is a `div.solari` holding `div.row`s, each row a few `span`s. `data-cells` sets the column widths in characters and `data-href` turns a row into a link. The class `title` sets a board in letter tiles; without it each column turns as a line of text.

If you do not want the sound, delete `sounds.js`, the `sounds/` folder and the Sound button. Nothing else uses them.

My own pages are written out by a script that works from a Word document holding all the site's words, so anything I edit in the HTML is lost at the next rebuild. That script is not in this repository, and the problem does not arise in a fork.

## Licence and credits

Built by Ammon Salter with AI assistance. The code is free to reuse. The text, the comics and the pictures of my own work are not. The games and their materials are released under CC BY-NC-SA 4.0. The board sound is "pragotron_split-flap-display" by [matucha](https://freesound.org/s/174056/), CC BY-NC 4.0, cut into eight clips. The typefaces are Barlow Condensed and Atkinson Hyperlegible, both from Google Fonts.
