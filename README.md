# Tilawah — Quran app prototype

A phone-friendly web app (installable to the home screen) with:

- **Full mushaf** — the King Fahd Complex Madinah Mushaf (1441 AH, 604 pages, 15 lines), drawn page by page exactly as printed, with surah headers, ayah markers, waqf signs and rub' al-hizb marks. Swipe or tap the page edges to turn pages, tap the middle to hide the bars, go to any surah, juz or page, bookmark pages and ayahs, highlight ayahs in four colours, and pick up where you stopped. Works offline for pages you've opened. Dark mode included.
- **Play and recite on the page** — tap any word to select its ayah, then play it or recite from it. While a reciter plays, the current ayah is highlighted on the page; while you recite, each word turns green, red (wrong) or amber (skipped), and the page turns with you.
- **Text view** — one surah at a time in the same Madinah script, with the English translation (Sahih International) as an option, off by default.
- **Reciters, ayah by ayah** — Muhammad Ayyub, Mahmoud Khalil Al-Husary, Abdur-Rahman as-Sudais, Maher Al-Muaiqly, Abdul Basit (Murattal and Mujawwad), Abu Bakr al-Shatri, Raad Muhammad al-Kurdi, Saad al-Ghamdi, Saud al-Shuraim and Yasser al-Dossari. Tap the reciter's name on the player (or Settings → Reciter) to switch. Playback speed 0.75×–2×, repeat each ayah 1–10 times, continuous play, lock-screen controls.
- **Translation and tafsir on the page** — select an ayah in the mushaf and tap Translation or Tafsir to read the English meaning or Tafsir Ibn Kathir without leaving the page. In text view, both can be switched on in Settings.
- **Recite to find** — start reciting anywhere in the Quran, without choosing an ayah first. After a few words the app finds where you are, opens that page and follows you word by word (like Tarteel). Tap the mic in the mushaf with no ayah selected, or Recite to find an ayah on the Quran screen.
- **Live recitation checking** — each word turns green, red or amber as you recite, with an optional pop-up showing the correct word, and a summary at the end (score, time, mistakes with buttons to hear the ayah or retry). In memorization mode, tap a hidden word to peek at it.
- **Memorization mode** — words stay hidden while you recite and appear as you say them.
- **Listen and repeat** — the reciter plays an ayah, then the mic opens for you to repeat it, then the next ayah plays.
- **Qibla finder** — GPS bearing and distance to the Kaaba, a live compass on phones, manual coordinates as a fallback.
- **Library** — all nine main hadith books and the eight selections exactly as published on Sunnah.com (51,775 hadith with Arabic, English, chapter headings, grades and Sunnah.com's own reference numbers; jump to any hadith number, copy), plus shelves for the Sirah (Ibn Kathir's Al-Sira al-Nabawiyya, 4 volumes), Ibn al-Qayyim (27 books), Ibn Taymiyyah (21 books) and Kitab at-Tawhid. Books open in the app's own reader.
- **IndoPak Mushaf** — listed in Settings as coming soon.

## Put it online free with GitHub Pages (works on iPhone)

1. Make a free account at github.com.
2. Install **GitHub Desktop** (free) from desktop.github.com and sign in. The website's upload box takes only 100 files at a time, and this app has about 950, so the desktop app is the easy way.
3. In GitHub Desktop: **File → Add Local Repository**, choose the `tilawah` folder, and click **create a repository** when it offers. Name it `tilawah`, then click **Create Repository**.
4. Click **Publish repository**. Untick **Keep this code private** (free GitHub Pages sites must be public), then **Publish**.
5. On github.com, open the `tilawah` repository → **Settings** → **Pages**. Under **Branch**, choose `main` and `/ (root)`, then **Save**.
6. After a minute or two, the page shows your link: `https://YOUR-USERNAME.github.io/tilawah/`.
7. On your iPhone, open that link in **Safari** and tap **Install** on the Quran screen (or Share → Add to Home Screen).

To update the app later: replace the files in the folder, then in GitHub Desktop write a short summary, click **Commit to main**, then **Push origin**. The installed app picks up the update the next time it's opened online.

On GitHub Pages, book PDFs open in the phone's own PDF viewer, because GitHub can't pass them through to the in-app reader. Everything else works the same.

## Run it

The microphone and compass only work over **https**, so the app needs to be hosted. Easiest way:

1. Go to https://app.netlify.com/drop
2. Drag the whole `tilawah` folder onto the page.
3. Open the link on your phone. The Quran screen shows an Install card (also in Settings → Install Tilawah) with the steps: on iPhone, Safari's Share button → Add to Home Screen; on Android, Chrome's Install app. Installed, Tilawah opens full screen from its own icon with a launch screen, like an App Store app, and works offline.

To try it on a computer instead: in this folder run `python3 -m http.server 8000` and open http://localhost:8000.

**Browser support for recitation checking:** Chrome (Android, desktop), Edge, and Safari (iPhone, Mac). Firefox has no speech recognition.

## Add books

Add an entry to a shelf in `SHELVES` near the top of `app.js`, or add a new shelf. `file` can be a link to a PDF online or a PDF placed in the `books/` folder (e.g. `file: 'books/my-book.pdf'`).

## Change the reciters

In `app.js`, edit `RECITERS` near the top. Each `id` is a folder name on everyayah.com (the audio URL is `https://everyayah.com/data/<id>/001001.mp3` for Al-Fatiha ayah 1). To use your own audio host, change `AUDIO_BASE`; files must be named `SSSAAA.mp3` (surah and ayah, three digits each).

## Rename the app

Change `APP_NAME` in `app.js`, the `<title>` in `index.html`, and `name`/`short_name` in `manifest.webmanifest`.

## How the recitation check works, and its limits

The prototype uses the browser's built-in Arabic speech recognition (on Chrome this is Google's service, so audio is sent to Google to transcribe). `matcher.js` compares the transcript to the expected words of each ayah, allowing for small spelling differences, repeated phrases, extra words, and the opening letters of surahs like Alif Lam Mim.

It catches wrong, missing and skipped words. It does not judge tajweed (elongation, ghunnah, makharij), and a general-purpose recognizer is less accurate on Quranic recitation than a model trained on it.

For the production app, replace the browser recognizer with a Quran-trained speech model (for example the open Whisper models fine-tuned on Quran recitation that Tarteel has published on Hugging Face), running on a server or on the device. `matcher.js` stays the same: it only needs the stream of recognized words.

## Data sources

No Quran text, tafsir or hadith is written or edited by hand anywhere in the app.

- **Quran text, page layout and script:** King Fahd Glorious Quran Printing Complex, Madinah Mushaf 1441 AH (calligraphy by Uthman Taha), QCF v4 fonts, from the open `quran-qcf4` dataset. Stored in `mushaf/madinah/`. That dataset leaves out the waqf signs; they were restored from the official fonts, each placed directly after the word it belongs to. The font files may be used for displaying the Quran; redistributing them in a published app needs the rights holders' permission (see `mushaf/madinah/LICENSE.md`).
- **Tafsir Ibn Kathir (English, abridged):** loaded as published from the Quran.com API, with its headings, paragraphs and Arabic quotations. The app only removes code; it never changes the text.
- **English translation of the Quran:** Sahih International, from the Al Quran Cloud API.
- **Hadith:** the nine books and the selections, copied from Sunnah.com's pages (Arabic, English, chapter headings, grades and references as shown there). Hadith that Sunnah.com has no English for, such as all of Sunan ad-Darimi, are shown in Arabic only. `tools/build_hadith.py` turns a Sunnah.com export into the files in `hadith/`.
- **Recitation audio:** EveryAyah.com (per-ayah files) and MP3Quran.net (full-surah recordings, cut into ayahs with MP3Quran's published ayah timings, used for Saad al-Ghamdi and Raad Muhammad al-Kurdi).
- **Books:** classical works by Ibn Kathir, Ibn al-Qayyim, Ibn Taymiyyah and Muhammad ibn Abdul Wahhab, in English translation. The PDFs are hosted on Kalamullah.com and the Internet Archive, which collect them; they are not the authors or translators. The original works are centuries old; the English translations are modern and belong to their translators and publishers, so check with them before a public release.

## Reading books inside the app

Book PDFs open in the app's own reader (zoom, go to page, page bookmarks, highlight passages by selecting text, remembers where you stopped, night view in dark mode). Scanned books are images of pages, so they can be bookmarked but not highlighted. The sites that host the PDFs don't allow other websites to load their files directly, so the `_redirects` file tells Netlify to fetch them and serve them from your own site. This works once the app is on Netlify; when the app runs on your computer, the reader says so and offers to open the PDF instead. If a host refuses Netlify's request, the reader shows the reason it was given.
