# EchoCare

**A medication-safety companion for older adults who live alone.** DSH Hacks V2 · AI x Healthcare.

EchoCare listens to what an older adult says about how they feel, and spots **prescribing cascades**: when a side effect of one medicine is treated with another medicine. It turns them into a clear question for the doctor, never an instruction to stop a medicine.

**Live demo:** https://echocare-dsh-hacks-v2.pages.dev

Full version (claude.ai): https://claude.ai/artifact/HetAvtkABAhgHGxS1CwZeu

## The problem

Mdm Tan (an example patient) is 78 and takes seven medicines from three places: her GP, a memory clinic, and a neighbour. Ibuprofen from the neighbour can raise blood pressure, so she is started on amlodipine. Amlodipine commonly swells the ankles, and the usual next step is a water pill. Each new pill treats the last one's side effect, and nobody sees the whole picture.

## Key features

**Her app (one thing at a time, large type)**
- Next medicine card with pictures, or real photos, of each pill. "I've taken it" unlocks only when the dose is due.
- Reminders that chime, flash, vibrate and read themselves aloud. Snooze or skip in one tap. Family is alerted if a dose is still missed after 2 hours.
- Talk to EchoCare: tap answers, type, or **speak** (browser speech recognition, with the phone keyboard's microphone as a fallback).
- Call family in one tap. "I need help" sends an urgent alert.
- English, Mandarin, Malay and Tamil.

**Guardian view (family)**
- **Today:** doses, daily check-in and supervision rings, the top safety finding in plain words, plus Check-in, Symptoms and Conversation.
- **Her care:** appointments (with calendar links) and medicines (days left, refill request, "What is it?" plain-language explanations, a safety check before any new medicine is added).
- **Health log:** Notes, the cascades in plain words. "Not relevant" hides a note, with Undo.
- **Doctor memo:** a short memo with symptoms, medicines, missed doses and each possible cascade with its evidence. **Print memo (PDF)** builds a printable A4 PDF.
- **Pharmacist view:** patients sorted by medication risk.
- **Care circle:** one live record shared between her phone and the family's phones.

## How it works

1. **She talks.** Claude reads her words (and medicine photos) into structured records: symptoms, doses, new medicines and mood.
2. **Rules check.** 25 cascade rules from ThinkCascades and the AGS Beers Criteria compare each symptom and medicine with when each medicine started. It also checks interactions and duplicate ingredients.
3. **Evidence.** openFDA adverse-event counts for 89 common medicines (people over 65) are built in as context, never as a diagnosis.
4. **A question, not an order.** Findings go to the family and the doctor memo as questions.

## Safety by design

- Never tells anyone to start, stop or change a medicine.
- Medicine links come from fixed published rules, not AI. AI ideas are labelled.
- Chest pain, stroke signs or severe breathlessness: "call 995 now", and family is alerted. Feeling faint: call 995 only if it does not pass. Falls and confusion: family is alerted and a doctor visit suggested, never 995.
- Emergency words are recognised offline in English, Mandarin, Malay and Tamil, even when the AI is unavailable.
- The AI receives her first name only.
- Built-in engine check: 19 textbook cases including false-alarm controls, plus 11 language checks (Settings > Trust and limits).

## Running it

- **Demo website:** runs on the built-in rules with the example patient, including voice input. Nothing is saved, and features that need Claude say so.
- **Full version:** open the claude.ai link above. Claude, saving and the care circle need a signed-in claude.ai account.
- **On your computer:** serve the folder (for example `python -m http.server`) and open `http://localhost:8000`.
- **Guided demo:** add `#demo` to the address, or press **Play demo**.

## Project structure

No framework and no build step for the website: plain HTML, CSS and JavaScript files, loaded in order.

| Path | What it is |
|---|---|
| `index.html` | Page skeleton: loads the stylesheets and scripts below |
| `css/base.css` | Colours (light and dark), layout, navigation, overlays |
| `css/elder.css` | Her app: one task per screen, very large type |
| `css/guardian.css` | Family view, forms, doctor memo, charts, guided demo |
| `js/data/` | Utilities, medicine and symptom dictionaries, the 25 cascade rules, translations, openFDA snapshot, example patient |
| `js/engine/` | Cascade detection and interactions, conversation parsing and safety replies, Claude calls, built-in engine and language checks |
| `js/app/` | State and saving, care circle, page rendering, Today, forms, care pages, doctor memo and PDF, pharmacist view, her app |
| `js/demo.js` | Guided demo |
| `js/main.js` | Click, change and submit handling, and start-up |
| `audio/` | Pre-recorded narration for the guided demo (ElevenLabs) |
| `tools/bundle.py` | Builds `dist/echocare-claude.html`, the single-file version for claude.ai, from the same files |
| `tools/make_voices.py` | Script that generated the narration. It reads the API key at run time and never stores it |
| `docs/demo-script.md` | Slide-by-slide demo script and recording steps |

## Built with

- HTML, CSS and JavaScript, with no framework.
- **Claude** (Anthropic): conversation understanding, medicine photo identification and plain-language explanations, through the claude.ai artifact runtime.
- **openFDA**: adverse-event data snapshot.
- **ElevenLabs**: demo narration.
- **jsPDF**: the doctor memo PDF.
- Built by David Wong, with Claude Code as a coding assistant.

## Limits

EchoCare is not a medical device. Every rule still needs a pharmacist's review. Alerts only reach phones with EchoCare open. The translations need a native-speaker review.
