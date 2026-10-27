/* Recitation matcher: compares what the speech recognizer heard against the
   expected Quran words and decides, word by word, what was correct, wrong or
   skipped. Kept free of DOM code so it can be tested on its own. */
(function (root) {
  'use strict';

  // Harakat, Quranic annotation marks, dagger alif, tatweel.
  const DIACRITICS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;

  function normalize(word) {
    return String(word || '')
      .replace(DIACRITICS, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي')
      .replace(/ء/g, '')
      .replace(/[^ء-ي]/g, '');
  }

  function tokenize(text) {
    return String(text || '').split(/\s+/).map(normalize).filter(Boolean);
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    let prev = new Array(b.length + 1);
    let cur = new Array(b.length + 1);
    for (let j = 0; j <= b.length; j++) prev[j] = j;
    for (let i = 1; i <= a.length; i++) {
      cur[0] = i;
      for (let j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      [prev, cur] = [cur, prev];
    }
    return prev[b.length];
  }

  // Short words must match exactly; longer words tolerate small spelling
  // differences between the recognizer and the mushaf text.
  function similar(a, b) {
    if (!a || !b) return false;
    if (a === b) return true;
    const len = Math.max(a.length, b.length);
    if (len <= 3) return false;
    const d = levenshtein(a, b);
    return len <= 5 ? d <= 1 : d <= 2;
  }

  // Disjointed letters that open some surahs (Alif Lam Mim, Ya Sin...).
  // Recognizers spell them out as letter names, so they are matched loosely.
  const MUQATTAAT = new Set(['الم', 'المص', 'الر', 'المر', 'كهيعص', 'طه', 'طسم', 'طس', 'يس', 'ص', 'حم', 'عسق', 'ق', 'ن']);
  function isMuqattaat(norm, surah, ayah, wordIndex) {
    if (wordIndex !== 0 || !MUQATTAAT.has(norm)) return false;
    return ayah === 1 || (surah === 42 && ayah === 2);
  }

  /* expected: [{norm, free}] in reading order.
     tokens:   normalized words heard so far.
     final:    true when recitation has stopped (resolve trailing words).
     hasInterim: the last token may still change.
     Returns {status: Array<'ok'|'wrong'|'skip'|null>, pos}. */
  function align(expected, tokens, opts) {
    const final = !!(opts && opts.final);
    const hasInterim = !!(opts && opts.hasInterim);
    const status = new Array(expected.length).fill(null);
    let p = 0;
    let freeUsed = 0;

    for (let i = 0; i < tokens.length && p < expected.length; i++) {
      const t = tokens[i];
      const next = tokens[i + 1];
      const isLast = i === tokens.length - 1;
      const unstable = hasInterim && isLast;
      const exp = expected[p];

      if (exp.free) {
        const after = expected[p + 1];
        if (after && similar(t, after.norm)) {
          status[p] = 'ok'; status[p + 1] = 'ok'; p += 2; freeUsed = 0; continue;
        }
        if (similar(t, exp.norm)) { status[p] = 'ok'; p++; freeUsed = 0; continue; }
        if (++freeUsed <= 5) { status[p] = 'ok'; continue; }
        p++; freeUsed = 0; i--; continue;
      }

      if (similar(t, exp.norm)) { status[p] = 'ok'; p++; continue; }

      // Recognizer joined two words into one.
      const exp2 = expected[p + 1];
      if (exp2 && similar(t, exp.norm + exp2.norm)) {
        status[p] = 'ok'; status[p + 1] = 'ok'; p += 2; continue;
      }
      // Recognizer split one word into two.
      if (next && similar(t + next, exp.norm)) { status[p] = 'ok'; p++; i++; continue; }

      if (unstable) break;

      // The reciter repeated something they already said: ignore it.
      let repeat = false;
      for (let k = Math.max(0, p - 6); k < p; k++) if (similar(t, expected[k].norm)) { repeat = true; break; }
      if (repeat) continue;

      // The reciter jumped ahead: the words in between were skipped.
      let jump = 0;
      for (let k = 1; k <= 3 && p + k < expected.length; k++) {
        if (similar(t, expected[p + k].norm)) { jump = k; break; }
      }
      if (jump) {
        for (let k = 0; k < jump; k++) status[p + k] = 'skip';
        status[p + jump] = 'ok';
        p += jump + 1;
        continue;
      }

      // An extra word, followed by the correct one.
      if (next && similar(next, exp.norm)) continue;

      // Need the next word before judging the last one, unless we are done.
      if (isLast && !final) break;

      status[p] = 'wrong';
      p++;
    }
    return { status, pos: p };
  }

  const api = { normalize, tokenize, levenshtein, similar, isMuqattaat, align };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Matcher = api;
})(this);
