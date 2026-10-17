# AGENTS.md – Hinweise für Coding-Agents

Website der Medieninformatik-Studiengänge der TH Köln (Campus Gummersbach):
https://www.medieninformatik.th-koeln.de/

Statische Seite, gebaut mit **Hugo (extended, v0.168)**. Dazu Decap CMS für die
Pflege von News/Events, SCSS über Hugo Pipes und etwas Vanilla-JS. Es gibt kein
JS-Build-Tooling (kein Bundler, kein Framework).

Das SCSS kompiliert **Dart Sass**, das als `sass` im `PATH` liegen muss
(lokal z. B. `brew install sass/sass/sass`). Im CI ist die Version über
`DART_SASS_VERSION` in `.github/workflows/hugo.yml` fest eingestellt.

## Sprache

- Kommunikation, Commit-Messages, Code-Kommentare und Inhalte: **Deutsch**,
  mit korrekten Umlauten und ß (nie `ae`/`oe`/`ue`/`ss` als Ersatz).
- Gendern mit Doppelpunkt, wie im bestehenden Content: `Prüfer:innen`,
  `Studierende`.
- Bezeichner in Code (Partials, CSS-Klassen, Variablen) bleiben englisch bzw.
  folgen dem bestehenden `mi-`-Schema.

## Befehle

```sh
npm install              # einmalig (Decap CMS, npm-run-all)
npm run server           # Hugo-Dev-Server auf http://localhost:1313
npm run server:clean     # dasselbe ohne Cache
npm run dev              # Hugo-Server + lokales Decap-Backend (CMS unter /admin)
npm start                # Produktions-Build nach public/
```

- Zur Überprüfung einer Änderung: `hugo --cleanDestinationDir` muss **ohne
  ERROR** durchlaufen. WARN-Ausgaben ansehen und keine neuen erzeugen.
- Es gibt keine Tests und keinen Linter im Build. `.eslintrc.json` (4 Spaces,
  Single Quotes, Semikolons) gilt für JS in `assets/js/`, `.editorconfig` für
  alles andere (2 Spaces, LF).
- Der Dev-Start (`npm run dev`) ist langsam, also geduldig sein und nicht
  vorschnell abbrechen.

## Deployment – Vorsicht

- **Jeder Push auf `master` deployt sofort live** (GitHub Action
  `.github/workflows/hugo.yml`: Hugo-Build, dann rsync auf den MI-Webserver).
- **Committen und Pushen macht ausschließlich der Maintainer.** Agents
  committen und pushen nie von sich aus, auch nicht nach erledigter Aufgabe
  und auch nicht als Vorschlag mit „soll ich?“. Erst wenn ausdrücklich dazu
  aufgefordert wird. Änderungen bleiben bis dahin uncommittet im Working Tree.
- Vor einem Push muss der lokale Build sauber sein.
- `manual-deploy.sh` ist ein lokales Notfall-Skript und steht in `.gitignore`.
  Nicht ausführen.

## Verzeichnisstruktur

| Pfad | Inhalt |
|---|---|
| `content/` | Seiten als Page Bundles (`<slug>/index.md` plus Bilder daneben) |
| `content/blog/`, `content/events/` | News und Termine, Ordnername `JJJJ-MM-TT-slug` |
| `content/study/` | Studiengänge, Modulhandbücher, Studienverlaufspläne |
| `mi-moduls-po4/` | **git subtree** mit den Modulbeschreibungen (PO 4), per Mount eingebunden |
| `layouts/` | Hugo-Templates (seit Hugo 0.146 **ohne** `_default/`) |
| `layouts/partials/{atoms,molecules,organisms,system}/` | Komponenten nach Atomic Design |
| `layouts/partials/dev/tpl-marker.html` | Debug-Marker (siehe unten) |
| `layouts/study/` | View-Templates für die `additionalContent`-Sections der Studienseiten |
| `layouts/shortcodes/` | Shortcodes für den Content |
| `assets/scss/` | SCSS, Einstieg `main.scss`, gleiche Atomic-Struktur wie die Partials |
| `assets/js/` | Vanilla-JS, einzeln in `layouts/baseof.html` eingebunden |
| `data/` | `people.yml`, `studiengaenge.yml`, `schwerpunkte.yml` |
| `static/admin/` | Decap-CMS-Konfiguration (`config.yml`) |
| `static/download/` | PDFs (z. B. Prüfer:innenlisten unter `pruefungsausschuesse/`) |
| `public/`, `resources/` | Build-Artefakte, nicht versioniert, nicht bearbeiten |
| `_stuff/` | Arbeitsmaterial (Rohdaten, Icons), nicht Teil der Seite |
| `_stuff/_input/` | Eingang für Bilder neuer Inhalte (siehe „Bilder für neue Inhalte“) |
| `_recipies/` | lokale Agent-Rezepte, nicht versioniert |

## Konventionen

### Komponenten

- Eine Komponente besteht aus einem Partial unter
  `layouts/partials/<ebene>/mi-<name>/` und optional SCSS unter
  `assets/scss/<ebene>/mi-<name>/mi-<name>.scss`. Das SCSS muss in der
  jeweiligen Sammeldatei (z. B. `assets/scss/atoms/atoms.scss`) importiert
  werden.
- Neues strukturelles Partial (molecules, organisms, system): als erste Zeile
  `{{ partial "dev/tpl-marker.html" . }}` einfügen.
- Partials mit einem kurzen `{{/* … */}}`-Kommentar beginnen, der Zweck und
  Parameter beschreibt.
- Spacing und Schriftgrößen folgen den Renard-Reihen (siehe Kommentar am Ende
  von `assets/scss/main.scss`), Variablen stehen in `_mi-vars.scss`.

### Hugo-Templates

- Literale HTML-Kommentare (`<!-- -->`) entfernt Go `html/template` aus dem
  Output. Wenn ein Kommentar im HTML landen soll:
  `{{ printf "<!-- … -->" | safeHTML }}`.
- `.Render` löst keine Slash-Pfade mehr auf. Views liegen deshalb flach in
  `layouts/study/`; `layouts/study/overview.html` schneidet das `views/`-Präfix
  aus dem Frontmatter ab.
- Keine veralteten APIs verwenden: `.Site.Language.Locale` statt
  `.Site.LanguageCode`, `hugo.Data` statt `.Site.Data`.
- Bilder über Hugo Image Processing ausliefern (siehe `atoms/mi-image`,
  `atoms/mi-lqip`), nicht als Rohdatei verlinken.
- Teaser-Bilder in einem Page Bundle heißen `teaser*` und werden darüber
  gefunden (u. a. für `og:image`).

### Content

- Neue News/Events als Page Bundle anlegen, z. B.
  `content/blog/2026-10-08-mein-thema/index.md`. Frontmatter wie bei den
  bestehenden Einträgen (`date`, `title`, `linkTitle`, `autor` bzw. bei Events
  `termin`, `datum`).
- Die Felder müssen zu den Collections in `static/admin/config.yml` passen,
  sonst bricht die Pflege über Decap.
- `markup.goldmark.renderer.unsafe = true`: HTML im Markdown ist erlaubt.

### Bilder für neue Inhalte (`_stuff/_input/`)

- Bilder für neue Artikel legt die Redaktion in `_stuff/_input/` ab.
- Beim Anlegen eines Artikels die Bilder von dort in das Page Bundle des
  Artikels **verschieben** (nicht kopieren), z. B. nach
  `content/blog/2026-10-08-mein-thema/`. Danach liegt in `_stuff/_input/` nur
  noch `.gitkeep`.
- Das Aufmacherbild bekommt das Präfix `teaser-` (z. B. `teaser-kickoff.jpg`).
  Weitere Bilder bekommen sprechende Namen in Kleinbuchstaben, ohne
  Leerzeichen und Umlaute.
- Ist unklar, welches Bild zu welchem Artikel gehört oder welches der Teaser
  sein soll: nachfragen, nicht raten.
- `.gitkeep` nicht löschen, damit der Ordner erhalten bleibt.

### Modulbeschreibungen (`mi-moduls-po4/`)

- Das ist ein git subtree aus dem Modul-Repo. Lokale Änderungen werden beim
  nächsten Subtree-Pull überschrieben bzw. führen zu Konflikten. Inhaltliche
  Korrekturen deshalb upstream machen und hier nur im Notfall.
- Bekannte Stolperfallen: `published: true/false` als Boolean (in
  `config.toml` per `[frontmatter]` entschärft) und doppelte leere
  `infourl:`-Keys (YAML-Fehler). Beides kann ein Subtree-Pull wieder
  einschleppen.
- Eingebunden über `[[module.mounts]]` in `config.toml`, **nicht** über
  Symlinks: Hugo folgt symlinkten Content-Ordnern seit 0.146 nicht mehr.

## Debugging

- Im gerenderten HTML zeigen Kommentare wie
  `<!-- tpl-page ▶ blog/single.html -->` und `<!-- tpl ▶ _partials/… -->`,
  welches Template rendert. Abschaltbar über `[params] templateMarkers = false`
  in `config.toml`.
- Minify ist deaktiviert (`[minify] disable = true`), das HTML im Output ist
  also lesbar.

## Commits

- Committen nur auf ausdrückliche Anweisung (siehe „Deployment – Vorsicht“).
- Commit-Messages auf Deutsch im Imperativ und als ganzer Satz, z. B.
  „Füge Parallax-Effekte zur Hero-Image-Komponente hinzu“.
- Kleine, thematisch saubere Commits. Content-Änderungen und Template-Umbauten
  nicht mischen.
