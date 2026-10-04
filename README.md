# Florel Core — Website

All text, images and sections come from **`content/site.json`**.
Edit that file, save, refresh the browser, and the change shows up. You don't need to touch any HTML or JavaScript.

```
index.html             page shell (no content inside)
content/site.json      ← ALL website content lives here
assets/css/style.css   design
assets/js/app.js       reads site.json and builds the pages
assets/images/         logo, photos (put new photos here)
```

## Running it

The site must be served by a web server, because browsers block reading JSON from a file opened by double-click.

- **VS Code:** install the "Live Server" extension, right-click `index.html`, then choose "Open with Live Server".
- **Terminal:** run `npx serve` in this folder, then open the address it prints.
- **Hosting:** upload the whole folder to any static host (Netlify, Vercel, cPanel, etc.).

## Common edits

| I want to… | Change this in `site.json` |
|---|---|
| Change phone, email, WhatsApp message | `contact` |
| Edit a service or its photo | `services[]` → `title`, `summary`, `items`, `image` |
| Add a project with photos | add an entry to `projects[]` (see below) |
| Add a real testimonial | `testimonials[]` → fill `quote`, `name`, `role`, set `"placeholder": false` |
| Add social media icons | `social` → `[{ "platform": "instagram", "url": "https://..." }]` (instagram, facebook, linkedin, tiktok, youtube, x) |
| Change page title / Google description | `pages.<page>.seoTitle` / `seoDescription` |
| Receive form enquiries by email instead | contact section → `"sendVia": "email"`, or put a Formspree URL in `"endpoint"` |

**Images:** copy the photo into `assets/images/…` and put its path in the `image` field.
If you leave `image` empty (`""`), an elegant "Photo coming soon" placeholder is shown.

**Example project:**
```json
{
  "title": "Villa Interior, Khalifa City",
  "categories": ["Residential", "Interior Design"],
  "location": "Abu Dhabi",
  "description": "Complete interior design and fit-out of a 5-bedroom villa.",
  "image": "assets/images/projects/villa-khalifa.jpg",
  "imageAlt": "Living room of a villa in Khalifa City",
  "shape": "portrait"
}
```
Leave `shape` out to show the photo at its natural size (recommended for real photos). You can also force `portrait`, `landscape` or `square`.
Set `"featured": true` to show a project in the **"Happy Clients. Completed Spaces."** section on the home page. The first 7 featured projects appear, in list order, and the first one gets the big tile.
Clicking any project photo opens it full screen (use the arrow keys or buttons to browse).
Filter buttons with no projects in that category are hidden automatically.

## Adding a new section

Each page has a `sections` list. Sections appear in that order. To add one, insert an object with a `type`:

| type | What it shows | Main fields |
|---|---|---|
| `hero` | Full-screen image banner | badge, title, titleAccent, subtitle, text, image, buttons |
| `pageHero` | Top banner of inner pages | kicker, title, lead, image (optional) |
| `text` | Simple heading + paragraphs | kicker, title, paragraphs[], buttons, background (`alt`/`dark`), align (`center`) |
| `split` | Text beside an image | kicker, title, paragraphs[], image, reverse (true/false), button |
| `features` | Numbered cards grid | kicker, title, lead, items[{title,text}], background |
| `intro` | Text + steps + two photos | kicker, title, paragraphs, steps, images |
| `services` | Service cards (from `services`) | kicker, title, lead, limit, link |
| `serviceIndex` / `serviceDetails` | Services page sticky menu + rows | button |
| `process` | Dark numbered steps | kicker, title, lead, steps[] |
| `checklist` | Image + grouped lists | kicker, title, text, image, groups[{title,items}] |
| `experience` | Client / organization names | kicker, title, text, names[], note |
| `missionVision` | Two statement cards | items[{label,text,points}] |
| `statement` | Large italic quote line | text, button |
| `marquee` | Scrolling words strip | items[] |
| `gallery` | Filterable projects (from `projects`) | — |
| `showcase` | Photo grid of featured projects | kicker, title, lead, limit, link |
| `testimonials` | Testimonial cards (from `testimonials`) | — |
| `cta` | Image banner with buttons | kicker, title, text, image, buttons |
| `contact` | Contact details + enquiry form | fields[], successMessage, sendVia, endpoint |

**Buttons:** `{ "label": "…", "href": "#/contact", "style": "gold" }`
- `style`: `gold`, `green`, `outline`, `outline-light`, `whatsapp`
- special `href` values: `whatsapp` (opens WhatsApp with the pre-filled message), `tel` (calls the first phone number), `email`

**New page:** add `"pages": { "careers": { "seoTitle": "...", "sections": [ ... ] } }`, then add `{ "label": "Careers", "href": "#/careers" }` to `navigation.links`.

> Tip: JSON is strict. Every item except the last one in a list needs a comma, and all text must be in "double quotes". If the site shows "Content could not be loaded", paste the file into jsonlint.com to find the mistake.
