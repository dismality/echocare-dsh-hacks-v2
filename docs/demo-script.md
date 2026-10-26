# EchoCare Demo Deck: transcript

29 slides, about 10 to 11 minutes. **SAY** is spoken. **RECORD** steps are what to screen-record on the demo slides.

---

## 1. Meet Mdm Tan (about 16 s)
Meet Mdm Tan. She's 78, and she lives alone in a flat in Singapore.
Her daughter Rachel lives across town, and visits twice a week.
Mdm Tan is an example patient. But her story is a very common one.

## 2. Seven medicines, three sources (about 18 s)
Every day, she takes seven medicines, from three different places.
Four come from her GP. One comes from a memory clinic.
And two she got herself, including ibuprofen that a neighbour gave her for her knee.

## 3. A prescribing cascade (about 28 s)
Here's what can happen next.
Ibuprofen can raise blood pressure. So at her next check-up, her GP starts her on amlodipine.
Amlodipine commonly causes swollen ankles.
And the usual treatment for swollen ankles is a water pill.
Each new medicine is treating a side effect of the one before.
Doctors call this a prescribing cascade. And every extra pill brings new side effects of its own.

## 4. It's measurable (about 20 s)
This isn't a made-up example.
A 2025 study of over half a million older adults in Ireland looked for known cascades.
The strongest one it found was exactly this: amlodipine-type pills, followed by a water pill.
And the FDA holds 3,753 reports of ankle swelling in people over 65 taking amlodipine.

## 5. Nobody sees the whole picture (about 22 s)
So why does nobody catch it?
Because no one sees the whole picture.
The GP never hears about the neighbour's ibuprofen.
Rachel sees her mum, but not the timeline of when each symptom started.
And Mdm Tan only knows that she feels worse.
The clues are there, in what she says between visits. Nobody is listening for them.

## 6. A growing problem in Singapore (about 22 s)
And this problem is growing.
About 87,000 seniors in Singapore live alone. That's double the number ten years ago.
By 2030, one in four Singapore citizens will be 65 or older.
And around one in five older adults in hospital has a reaction to a medicine. Most of those reactions are predictable.
Predictable means preventable, if someone spots the pattern in time.

## 7. EchoCare (about 14 s)
That's why we built EchoCare.
An AI medication-safety companion that listens to older adults, and spots prescribing cascades before the next pill is added.

## 8. How it works, in 3 steps (about 24 s)
EchoCare works in three steps.
First, Mdm Tan simply talks to it, in her own words, on a very simple phone app.
Second, EchoCare turns what she says into health records, and checks them against when each medicine started.
Third, Rachel and the doctor get a clear question to ask. Never an instruction to stop a medicine.

## 9. Demo 1: her phone (about 28 s)
**RECORD**
1. Open the EchoCare link, press Open Mdm Tan's app.
2. Hold on the home screen: next medicine card with pill pictures.
3. Tap I've taken it (if locked: Her app > Reminder times, set morning to a minute ago).
4. Scroll past This week, Talk to EchoCare, Call Rachel, I need help.

**SAY**
Let's see it in action. This is Mdm Tan's app.
It shows one thing at a time: her next medicine, with pictures of the actual pills.
When it's time, a reminder chimes, flashes, and reads itself aloud.
One tap tells EchoCare she's taken them.
And big buttons let her talk to EchoCare, call Rachel, or ask for help.

## 10. Reminders (about 18 s)
Reminders are built so she can't miss them.
They chime, flash, and read themselves aloud, with a picture or a real photo of each pill.
She can snooze or skip in one tap.
And if a dose is still missed two hours later, Rachel is told.

## 11. Demo 2: she talks (about 32 s)
**RECORD**
1. Tap Talk to EchoCare.
2. Tap Not so good > Legs or feet > Swollen ankles > Quite bad. Pause on the reply.
3. Tap Speak to EchoCare and say: My ankles are worse today and my knee still hurts. Tap I've finished speaking. (If the browser blocks the microphone, the typing box opens: tap the microphone on the phone keyboard and say it.)

**SAY**
When she taps Talk to EchoCare, it asks how she's feeling.
She says she's not so good, and that her ankles are swollen.
EchoCare logs the symptom, and notices it may be a side effect of amlodipine.
So it adds a question for her doctor, and reminds her not to stop any medicine on her own.
She can also just speak, in her own words. EchoCare writes down what she says, and Claude turns it into records.
And words like chest pain always get a call-995 reply, and Rachel is alerted straight away.

## 12. Her language (about 18 s)
EchoCare speaks her language: English, Mandarin, Malay or Tamil.
The text is large, in three sizes, and the voice can slow down.
She can tap an answer, type, or just speak.
The translations still need a native-speaker review before real use.

## 13. Never alone (about 18 s)
And she's never alone.
One tap calls Rachel. I need help sends an urgent alert to the family.
If she says a symptom is very bad, Rachel is told straight away.
And if a dose is still missed two hours later, Rachel is told too.

## 14. 25 published rules (about 20 s)
Behind the scenes, the safety checks come from published research, not AI guesses.
25 cascade rules come from ThinkCascades and the AGS Beers Criteria.
It also checks interactions, like bleeding risk, kidney strain, or two NSAID painkillers at once.
And it catches the same ingredient hiding in two different medicines.

## 15. Demo 3: adding a medicine safely (about 28 s)
**RECORD** (family view)
1. Family settings (PIN 1234) > Medicines > Add medicine.
2. Choose a photo of a medicine box > Identify with AI (form fills in).
3. Type Furosemide, tick Morning, reason Ankle swelling > Add medicine.
4. Hold on the yellow warning.

**SAY**
Rachel can add medicines from a photo of the box. Claude reads the label and fills in the form.
But before anything is saved, EchoCare checks it.
Here, Rachel tries to add a water pill for her mum's ankles.
EchoCare warns her: the swelling may come from amlodipine. Ask the doctor before adding a third medicine.

## 16. FDA evidence (about 18 s)
Every medicine card carries real-world evidence.
US FDA report data from people over 65 is built in for 89 common medicines.
Any symptom she has mentioned is highlighted in red.
It's shown as context for the doctor, never as a diagnosis.

## 17. AI second opinion (about 18 s)
Claude can also give a second opinion: possible links the rules may have missed.
But those ideas are always marked as AI, and never mixed into the rule findings.
The doctor decides.

## 18. Demo 4: Rachel's phone (about 32 s)
**RECORD**
1. Today: hold on the three circles and the red Worth asking the doctor about card.
2. Health log > Notes: scroll through the notes.
3. Press Add to doctor memo.

**SAY**
This is Rachel's view. Her Today screen shows her mum's doses, her daily check-in, and who visited.
The most important safety finding always comes first, in plain words.
The notes show the whole chain at a glance.
The neighbour's ibuprofen led to amlodipine. And amlodipine is now swelling her ankles.
With one tap, it becomes a question for the next doctor's visit.

## 19. Daily check-in (about 18 s)
Every day, Rachel fills in one quick check-in: mood, sleep and pain.
Any new symptom is checked against when each medicine started.
She records who supervised her mum that day.
And if her routine starts slipping, it shows up early.

## 20. Medicines never run out (about 18 s)
EchoCare also makes sure medicines never run out.
Every medicine shows how many days are left, and EchoCare writes the refill request, ready to copy to the pharmacy.
Tap What is it, and Claude explains the medicine in plain words, then sends it to Mdm Tan's phone with a Listen button.

## 21. Demo 5: care circle (about 28 s)
**RECORD** (two windows side by side)
1. Signed in to claude.ai: Settings > Guardian > Start a care circle. Copy invite link.
2. Open the link in a second window: This is Mdm Tan's phone.
3. Mdm Tan window: I need help > Yes, tell Rachel.
4. Hold on the family window's alarm with the Call button.

**SAY**
Rachel and her mum share one live record, through a care circle.
Mdm Tan's phone joins with a simple invite link.
Now, if Mdm Tan presses I need help...
...Rachel's phone raises an alarm within seconds, with a one-tap call.

## 22. Demo 6: doctor and pharmacist (about 28 s)
**RECORD**
1. Doctor memo: scroll slowly, pause on section 5, Possible prescribing cascades, with the openFDA line.
2. Press Print memo (PDF), accept the save, and show the PDF open, ready to print.
3. Pharmacist view: hold on the table sorted by risk.

**SAY**
Before the appointment, EchoCare writes a short memo for the doctor.
It starts with a one-line summary of her week, then symptoms, medicines and any missed doses.
Each possible cascade comes with its evidence, including FDA reports.
With one tap, Rachel turns it into a PDF to print and bring along, or she can share a link with the doctor.
And pharmacists see their patients sorted by medication risk, so the riskiest people are reviewed first.

## 23. Demo 7: when the AI is unavailable (about 22 s)
**RECORD** (Mdm Tan's app with Claude unavailable)
1. Tap Talk to EchoCare > Say something else.
2. Type: Dada saya sakit sangat. Send.
3. Hold on the call-995 reply.

**SAY**
We also tested what happens when the AI is unavailable.
With Claude switched off, she types in Malay: my chest really hurts.
The offline rules still recognise it. EchoCare tells her to call 995, and alerts Rachel.
Emergency phrases work in English, Mandarin, Malay and Tamil.

## 24. The third prescription becomes a question (about 16 s)
So what changes?
Without EchoCare, the chain usually grows: a third pill to treat the second.
With EchoCare, that third prescription becomes a question for her doctor.
If the doctor agrees, that's one less pill, and one less set of side effects.

## 25. Built to be safe (about 22 s)
In healthcare, safety has to come first. So it's built into the design.
EchoCare never tells anyone to start, stop or change a medicine.
Medicine links come from 25 published rules, not AI guesses. Any AI ideas are clearly labelled.
Emergency words always get a call-995 reply, even when the AI is offline.
And the AI only ever receives her first name.

## 26. Checked every time (about 17 s)
And it's tested. The engine passes all 19 of its checks, including ones that must not raise false alarms.
Emergency phrases are recognised in English, Mandarin, Malay and Tamil.
And FDA data is built in for 89 common medicines.

## 27. How it's built (about 20 s)
Under the hood, EchoCare is a web app that runs on any phone.
Claude turns her words and photos into structured health records.
A rule engine and FDA data do the safety checks, and a live database keeps the whole family in sync.

## 28. Limits and next steps (about 22 s)
It has real limits. EchoCare isn't a medical device yet, and every rule still needs a pharmacist's review.
Alerts only reach phones that have EchoCare open, and the translations need checking by native speakers.
Next, we want to pilot it with a polyclinic or pharmacy, and add push alerts and phone-call check-ins for people without a smartphone.

## 29. Stop the third prescription (about 16 s)
EchoCare turns an older adult's everyday words...
...into the evidence a doctor needs to stop a prescribing cascade, before the third prescription.
Thank you.
