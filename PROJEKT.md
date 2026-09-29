# Mario-Lernapp – Projektplan

Lern- und Portfolio-Projekt: Web-App zum Lernen von Thomas Manns Novelle
*Mario und der Zauberer* (Fischer Taschenbuch, 103 Seiten), gebaut in den
drei Wochen Herbstferien 2026.

---

## 0. Produktbeschreibung (Consumer-Sicht)

**Was ist die App?**
Dein persönlicher Lernbegleiter für *Mario und der Zauberer*. Statt das ganze Buch durchzukämpfen, hast du jemanden, der es in- und auswendig kennt, dir die wichtigen Stellen zeigt und jede Antwort mit Seite und Zeile belegt.

**Das Versprechen:** Du musst das Buch nicht von vorne bis hinten lesen. Die App bringt dich in drei Wochen auf Prüfungsniveau, indem sie dir zeigt, *was* du wissen musst und *wo* es steht.

**Was kannst du damit machen?**
- **Das Buch in 20 Minuten verstehen:** Zusammenfassung der Handlung, Figuren und Kernszenen, jede mit Verweis auf die Originalstelle.
- **Nur das Wichtige lesen:** Die App markiert die Schlüsselpassagen (die Stellen, die in Prüfungen und Aufsätzen vorkommen), sodass du gezielt liest statt alles.
- **Fragen stellen:** „Warum lässt sich Mario hypnotisieren?“ – klare Antwort mit genauer Stelle zum Nachschlagen.
- **Üben:** Quizfragen und Karteikarten, die dich Schritt für Schritt durchs Buch führen und dir zeigen, wo noch Lücken sind.
- **Anhören:** Das Buch oder einzelne Schlüsselszenen vorgelesen, die gesprochene Zeile leuchtet auf.
- **Aussprache üben:** Namen und italienische Ausdrücke (Cipolla, Torre di Venere, Fuggièro…) antippen und hören, nachsprechen, Feedback bekommen. Bei englischen Büchern der Hauptnutzen.
- **Spielen:** Zitat-Duell, tägliches Mini-Quiz mit Streak, „Wer bin ich?“ – gegen Freunde, mit Bestenliste für die Klasse.
- **Sprechen statt tippen:** Frag per Stimme, hör die Antwort.
- **Lernplan:** Drei Wochen, jeden Tag ein kleines Stück, abhaken inklusive.

**Für wen?** Für dich und deine ganze Klasse – ein Link, kein Konto, kein Abo.

**Und andere Bücher?** Ja, auch englische. Jedes Buch passt rein; hochladen, und alles funktioniert wie bei Mario. Öffentlich teilen darf man nur gemeinfreie Bücher (z. B. Orwell, Austen, Shakespeare), neuere bleiben privat für die eigene Klasse.

---

## 1. Ziele

### Lernziel (Schule)
- Die Novelle in drei Wochen sicher beherrschen: Handlung, Figuren, Motive, Erzählperspektive, historischer Kontext (Faschismus, Massenpsychologie).
- **Ohne das Buch komplett lesen zu müssen:** Die App liefert Zusammenfassung, Schlüsselpassagen und gezielte Übungen, sodass man mit deutlich weniger Lesezeit auf Prüfungsniveau kommt. Wer will, kann trotzdem alles lesen.
- Jede Aussage muss mit **Seite und Zeile der Fischer-Ausgabe** belegbar sein.
- Die ganze Klasse soll die App nutzen können, ohne eigenes KI-Konto.

### Portfolio-Ziel (Bewerbung)
- Ein sauber deploytes, produktionsnahes Projekt vorzeigen können.
- Bezug zu **ElevenLabs**: Sprachfunktionen (Vorlesen, Sprach-Tutor).
- Bezug zu **Better Stack**: Monitoring, Logging, Statusseite, Kostenkontrolle.
- README, das Architekturentscheidungen begründet (nicht nur *was*, sondern *warum*).

### Erfolgskriterien
- [ ] Buchtext vollständig per OCR erfasst, stichprobenartig gegen den Scan geprüft (Fehlerquote < 1 %).
- [ ] Jede Antwort der Frage-Funktion enthält mindestens eine Stellenangabe im Format `S. 42, Z. 17`.
- [ ] App ist unter einer öffentlichen URL erreichbar und von 25+ Personen gleichzeitig nutzbar.
- [ ] Tägliches Kostenlimit greift zuverlässig.
- [ ] Ich selbst bestehe eine Probeprüfung über das ganze Buch (Woche 3).

---

## 2. Funktionen

### Muss (MVP, Woche 1)
| Funktion | Beschreibung |
|---|---|
| Schnellüberblick | Handlung, Figuren, Motive und Kernszenen als kompakte Zusammenfassung, jede Aussage mit Stellenangabe |
| Schlüsselpassagen | Die 15–20 prüfungsrelevanten Stellen markiert und als eigene Leseliste; „Pflichtlektüre in 45 Minuten“ |
| Textansicht | Ganzer Novellentext mit Seiten- und Zeilennummern, Volltextsuche |
| Fragen stellen | Frage eingeben → Antwort nur auf Basis des Buchs, mit Stellenangaben; sagt klar, wenn etwas nicht im Text steht |
| Quiz | Multiple-Choice und offene Fragen zu Handlung, Figuren, Motiven, jeweils mit Beleg |
| Karteikarten | Anki-kompatibler Export (CSV) |
| Lernplan | 3-Wochen-Plan, ca. 5 Seiten pro Tag, mit Abhak-Funktion |

### Soll (Woche 2)
| Funktion | Bezug |
|---|---|
| Hörbuch-Modus mit Live-Zeilenmarkierung (Wort-Zeitstempel) | ElevenLabs |
| Aussprache: Wort/Name antippen → Audio; Aussprache-Liste aller Namen und Fremdwörter; Nachsprechen mit Feedback (STT-Vergleich) | ElevenLabs |
| Sprach-Tutor: Frage per Stimme, gesprochene Antwort | ElevenLabs |
| Spiele: Zitat-Duell (wer sagt das / welche Szene), tägliches Mini-Quiz mit Streak und Level, Bestenliste für die Klasse | Engagement |
| Strukturierte Logs pro KI-Anfrage (Dauer, Tokens, Kosten, Fehler) | Better Stack |
| Uptime-Monitor und öffentliche Statusseite | Better Stack |
| Alarm bei Kostenlimit oder erhöhter Antwortzeit | Better Stack |

### Kann (Woche 3, falls Zeit)
- Weitere Spiele: „Wer bin ich?“ (Figuren raten), Reihenfolge-Puzzle (Szenen sortieren), Lückentext-Battle.
- Vorlesen üben: Passage laut lesen, App markiert unklare oder falsch betonte Stellen.
- Mündliche Prüfung: App fragt per Stimme, bewertet die gesprochene Antwort.
- Kosten-Dashboard (Anfragen pro Tag, Kosten pro Nutzer, Cache-Trefferquote).
- Figurennetzwerk als interaktive Grafik.

---

## 3. Stack

| Bereich | Wahl | Begründung |
|---|---|---|
| Framework | Next.js (App Router, TypeScript) | Frontend und API-Routen in einem Projekt, nativ auf Vercel |
| Hosting | Vercel (Free/Hobby) | Zero-Config-Deploy aus GitHub, Umgebungsvariablen für Schlüssel |
| KI | Claude API (Anthropic) mit Prompt-Caching | Ganzer Buchtext im Kontext, gecacht → günstig und präzise |
| Sprache | ElevenLabs API (TTS mit Zeitstempeln, STT) – **Creator-Plan, 3 Monate gratis via Hackathon** | Vorlesen mit Zeilen-Sync, Spracheingabe; genug Kontingent, um das ganze Buch als Hörbuch zu generieren |
| Monitoring | Better Stack (Logs, Uptime, Status Page) | Logging und Alarme ohne eigene Infrastruktur |
| Datenhaltung | Buchtext als JSON im Repo; Fortschritt/Quiz-Stand in `localStorage`; Anfragen, Kosten, Rate-Limit und Bestenliste in Supabase (Postgres) | Kein Nutzer-State auf dem Server, aber jede KI-Anfrage nachvollziehbar und per SQL auswertbar |
| OCR | Tesseract (deu) + manuelle Stichprobenprüfung | Scan → Text mit Zeilenstruktur |
| Rate Limiting | Postgres-Funktion in Supabase | Tageslimit pro gehashter IP und global; kein zusätzlicher Dienst (Entscheid 2026-09-29, ersetzt Upstash Redis) |
| Styling | Tailwind CSS | Schnell, mobil-tauglich (die Klasse nutzt v. a. Handys) |
| Versionierung | GitHub | Grundlage für Vercel-Deploy und Portfolio |

### Bewusst nicht gewählt
- **Kein Redis.** Bei einer Schulklasse als Last reicht eine atomare Postgres-Funktion fürs Rate-Limit. Ein Dienst weniger, ein Konto weniger.
- **Kein RAG** (Chunking, Embeddings, Vektordatenbank). Das Buch (~50 000 Wörter) passt vollständig ins Kontextfenster. Retrieval würde nur Suchfehler und Aufwand hinzufügen; Prompt-Caching löst die Kostenfrage.
- **Keine Datenbank für Nutzerkonten.** Keine Logins, keine personenbezogenen Daten. Fortschritt bleibt lokal im Browser.

---

## 4. Architektur

```
Browser (Next.js Frontend)
   │
   ├── /api/ask      → prüft Rate-Limit → Claude API (Buchtext gecacht) → Antwort + Belege
   ├── /api/tts      → ElevenLabs TTS mit Zeitstempeln → Audio + Wort-Timing
   ├── /api/stt      → ElevenLabs STT → Text
   └── jede Route    → strukturiertes Log an Better Stack (Dauer, Tokens, Kosten, Status)

Better Stack Uptime  → pingt /api/health → Statusseite + Alarm
```

**Sicherheit**
- Alle API-Schlüssel ausschliesslich serverseitig (Vercel Environment Variables).
- Rate-Limit: z. B. 30 Fragen pro IP und Tag, globales Kostenlimit pro Tag; darüber freundliche Fehlermeldung.
- Eingaben werden gekürzt (max. Zeichen) und im System-Prompt strikt auf das Buch begrenzt.

**Datenformat Buchtext** (`book.json`)
```json
{ "page": 42, "line": 17, "text": "..." }
```

**Prompt-Regeln (Frage-Funktion)**
- Antworte nur auf Basis des mitgelieferten Textes.
- Jede Behauptung mit `S. X, Z. Y` belegen.
- Wenn die Antwort nicht im Text steht: das sagen, nicht raten.

---

## 5. Zeitplan (3 Wochen)

### Woche 1 – Grundlage und MVP
| Tag | Aufgabe |
|---|---|
| 1 | PDF in 3 Teile splitten, OCR durchführen, Zeilenstruktur erzeugen |
| 2 | OCR gegen Scan prüfen (jede 10. Seite komplett, Rest stichprobenartig), `book.json` finalisieren |
| 3 | Next.js-Projekt aufsetzen, Textansicht mit Suche, GitHub-Repo, erster Vercel-Deploy |
| 4 | `/api/ask` mit Claude API, Prompt-Caching, System-Prompt mit Belegpflicht |
| 5 | Rate-Limit und Kostenlimit, Fehlerbehandlung |
| 6 | Quiz und Karteikarten (Fragenkatalog aus dem Buch generieren, Belege prüfen) |
| 7 | Schnellüberblick und Schlüsselpassagen erstellen, Lernplan-Ansicht, Link an Klasse, Feedback einholen |

Parallel: täglich ca. 5 Seiten lesen und per App abfragen (S. 1–35).

### Woche 2 – Sprache und Monitoring
| Tag | Aufgabe |
|---|---|
| 8–9 | Hörbuch-Modus: TTS mit Zeitstempeln, Zeilen-Highlighting |
| 10 | Aussprache-Funktion (Tipp-Audio, Aussprache-Liste, Nachsprechen) und Sprach-Tutor |
| 11 | Spiele: Zitat-Duell und tägliches Mini-Quiz mit Streak, Bestenliste |
| 12 | Better Stack Logging in alle API-Routen, Health-Endpoint, Uptime-Monitor, Statusseite, Alarme |
| 13 | Bugfixes aus Klassen-Feedback |
| 14 | Puffer |

Parallel: S. 36–70 lesen und abfragen.

### Woche 3 – Wiederholung und Portfolio
| Tag | Aufgabe |
|---|---|
| 15–16 | S. 71–103 lesen, dann nur noch Wiederholung über das ganze Buch |
| 17 | Probeprüfung über die App; Schwachstellen gezielt wiederholen |
| 18 | README schreiben: Motivation, Architektur, Entscheidungen, Screenshots, Metriken |
| 19 | Optional: Kosten-Dashboard oder mündliche Prüfung |
| 20 | Code aufräumen, Lighthouse-Check (Performance, Mobile) |
| 21 | Abschluss: Demo-Video (2 Min.), Repo öffentlich, Links für Bewerbung bereit |

---

## 6. Portfolio-Bezug

### ElevenLabs Creator-Plan (Hackathon, 3 Monate)
- Kontingent: ca. 100 000 Zeichen/Monat (ca. 2 Stunden Audio), kommerzielle Nutzung, höhere Audioqualität, Voice Cloning. Genaue Limits im Dashboard prüfen.
- Den Hörbuch-Modus **früh generieren** (Woche 2), damit das Kontingent sicher reicht; Audio-Dateien einmalig erzeugen und cachen (z. B. Vercel Blob), nicht bei jedem Aufruf neu.
- Vor Ablauf der 3 Monate: entweder Audio-Dateien behalten (bleiben nutzbar) oder auf Free-Tier zurückstufen, dann nur noch Sprach-Tutor mit kleinen Textmengen.
- **Im README und in der Bewerbung erwähnen:** Hackathon-Teilnahme, was mit dem Creator-Plan gebaut wurde, welche Features (Timestamps, STT) genutzt wurden.
- Kalender-Erinnerung setzen: Ablaufdatum des Plans, 1 Woche vorher prüfen.

### Für ElevenLabs zeigen
- Sprache als Lernwerkzeug, nicht als Gimmick: Aussprache italienischer Namen, Nachsprechen mit Feedback, Vorlesen mit Zeilen-Sync.
- Wort-genaue Synchronisation von Audio und Text (Timestamps richtig verarbeitet).
- Sprach-Ein- und Ausgabe in einem echten Lern-Use-Case, nicht nur Demo.
- Umgang mit Latenz (Streaming, Vorladen der nächsten Seite).

### Für Better Stack zeigen
- Strukturierte Logs mit sinnvollen Feldern (request_id, route, model, tokens_in/out, cost_usd, duration_ms, cache_hit).
- Alarme, die ein echtes Problem abfangen (Kostenexplosion, Ausfall).
- Öffentliche Statusseite als Teil des Produkts.

### Abgleich mit den Stellenprofilen (Stand 2026-09-29)

Beide Zielstellen sind Full-Stack-Rollen. Was sie verlangen und wie Narra es belegt:

| Anforderung | Stelle | Beleg in Narra |
|---|---|---|
| TypeScript/React, Features end-to-end | ElevenLabs (Full-Stack, Front-End Leaning) | Next.js + TypeScript, jede Funktion von API-Route bis UI |
| Saubere, intuitive UI, Interesse an UX | ElevenLabs, Better Stack („pixel-perfect“) | Designrichtungen auf Canvas, Hell/Dunkel, Handy- und Desktop-Layout |
| Beurteilung über Projekte und GitHub, nicht Abschlüsse | ElevenLabs | Öffentliches Repo, README mit Entscheidungen, Demo-Video |
| Schnell und end-to-end shippen, mit KI-Werkzeugen | Better Stack | Tägliche Deploys, kleine Commits, offen dokumentiert: gebaut mit Claude Code |
| Sicherheit ohne blindes Framework-Vertrauen | Better Stack | Schlüssel nur serverseitig, Rate-Limit, Eingabelimits, Security-Header |
| SQL und Query-Optimierung, Redis | Better Stack | Postgres (Supabase) für Anfrage-Log, Kosten, Rate-Limit und Dashboard per SQL; Redis bewusst weggelassen und im README begründet |
| Performance, SEO, Barrierefreiheit | Better Stack | Lighthouse-Check, Metadaten, Tastatur- und Screenreader-Bedienung |
| Pragmatismus: die unwichtigen 5 % weglassen | Better Stack | „Bewusst nicht gewählt“ im README (kein RAG, keine Konten) |

Konsequenzen für den Plan:
- **Supabase (Postgres) statt Upstash Redis:** Jede KI-Anfrage landet als Zeile in Supabase (Route, Tokens, Kosten, Cache-Treffer, Dauer). Daraus kommen Tageslimit, Rate-Limit, Kosten-Dashboard und Bestenliste. Better Stack bleibt für Logs, Uptime und Alarme zuständig. Der Health-Endpoint fragt die Datenbank ab; der Uptime-Monitor hält damit das Free-Tier-Projekt wach.
- **Repo früh öffentlich, kleine Commits:** Die Commit-Historie zeigt das Tempo, das Better Stack sucht.
- **Barrierefreiheit und Lighthouse laufend prüfen**, nicht erst an Tag 20.

### Im README beantworten
- Warum kein RAG?
- Wie werden Kosten kontrolliert?
- Wie wurde die OCR-Qualität gesichert?
- Was würde ich beim Skalieren auf 10 Bücher ändern?

---

## 7. Offene Punkte
- [ ] PDF in 3 Teilen hochladen (S. 1–35, 36–70, 71–103)
- [ ] GitHub-Konto und Repo-Name
- [ ] Anthropic-API-Schlüssel und Budget pro Tag festlegen
- [ ] ElevenLabs Creator-Plan über den Hackathon aktivieren, Ablaufdatum notieren
- [ ] Better-Stack-Konto (Free-Tier reicht zum Start)
- [ ] Konkrete Stelle bei ElevenLabs / Better Stack nennen → Schwerpunkt anpassen
- [ ] Rechtliches: nur Novellentext (gemeinfrei seit 2026) in die App, Vor-/Nachwort und Anmerkungen der Fischer-Ausgabe weglassen
