"""Generate the EchoCare demo narration with ElevenLabs.

Run it and paste your API key when asked (the typing stays hidden and is never saved).
Never write the key into this file or the page.
Writes one MP3 per demo step into ./audio, plus the EchoCare voice that replies to Mdm Tan.

    python make_voices.py
    Optional:    $env:NARRATOR_VOICE = "<voice id>"   $env:ECHO_VOICE = "<voice id>"

Find voice ids in ElevenLabs under Voices (open a voice, then "Copy voice ID").
Only standard-library Python is used, so no install is needed.
"""
import getpass, json, os, sys, urllib.request, urllib.error

def clipboard_key():
    """Read a copied ElevenLabs key (it starts with sk_) from the Windows clipboard, so nothing has to be pasted."""
    try:
        import subprocess
        t = subprocess.run(["powershell", "-NoProfile", "-Command", "Get-Clipboard"], capture_output=True, text=True, timeout=10).stdout.strip()
        return t if t.startswith("sk_") and " " not in t else ""
    except Exception:
        return ""

def file_key():
    """Read the key from key.txt beside this script (made in Notepad), then delete the file so the key is not left on disk."""
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "key.txt")
    if not os.path.exists(p):
        return ""
    with open(p, encoding="utf-8-sig") as f:
        k = f.read().strip()
    os.remove(p)
    print("Read the key from key.txt and deleted the file.")
    return k

KEY = (os.environ.get("ELEVENLABS_API_KEY") or "").strip() or file_key() or clipboard_key()
if KEY:
    print(f"Using API key ending ...{KEY[-4:]}")
else:
    KEY = getpass.getpass("No key found. Copy your ElevenLabs key (starts with sk_) and run this again, or type it here: ").strip()
if not KEY:
    sys.exit("No API key given.")

# Voice ids are not secret. Replace with any voice id from your ElevenLabs library
NARRATOR = os.environ.get("NARRATOR_VOICE", "QnYI2oCbco37NvlkNHTK")  # your chosen narrator voice
ECHO = os.environ.get("ECHO_VOICE", "21m00Tcm4TlvDq8ikWAM")          # warm voice for EchoCare talking to Mdm Tan
MODEL = os.environ.get("ELEVEN_MODEL", "eleven_multilingual_v2")

# Same words as the demo captions, in order. Edit freely; the page plays whatever file has the matching name.
LINES = [
    ("demo-1", NARRATOR, "Meet Mdm Tan. She is 78, lives alone, and takes 7 medicines from 3 sources: her GP, the memory clinic, and a neighbour. Her daughter Rachel looks out for her from across town."),
    ("demo-2", NARRATOR, "Mdm Tan's app shows only her next medicine, with pictures of the actual pills, and three big buttons. No menus, no settings."),
    ("demo-3", NARRATOR, "She says how she feels in her own words. EchoCare files it as a symptom and checks it against when each medicine started. No forms."),
    ("demo-3-reply", ECHO, "I'm sorry to hear about the swollen ankles or feet. I've noted it. It may be connected to one of your medicines, so I have added a question for your doctor. Please don't stop any medicine on your own."),
    ("demo-4", NARRATOR, "On Rachel's Today screen, the top safety finding comes before anything else. Ibuprofen from the neighbour likely raised her blood pressure, and that led to a new blood-pressure pill."),
    ("demo-5", NARRATOR, "This is the cascade map. Each new medicine was prescribed to treat a side effect of the one before. The amlodipine is now swelling her ankles, and the usual next step is a water pill: a third medicine treating the first two."),
    ("demo-6", NARRATOR, "The FDA has 3,753 reports of ankle swelling in people over 65 taking amlodipine. EchoCare shows it as context for the doctor, never as a diagnosis."),
    ("demo-7", NARRATOR, "EchoCare never tells anyone to stop a medicine. Every finding becomes a clear question on a one-page sheet for her GP visit."),
    ("demo-8", NARRATOR, "EchoCare turns a lonely elder's everyday words into the evidence a doctor needs to stop a prescribing cascade, before the next pill is added."),
]

out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "audio")
os.makedirs(out_dir, exist_ok=True)

for name, voice, text in LINES:
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128",
        data=json.dumps({"text": text, "model_id": MODEL,
                         "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}}).encode(),
        headers={"xi-api-key": KEY, "Content-Type": "application/json", "Accept": "audio/mpeg"},
        method="POST")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            data = r.read()
    except urllib.error.HTTPError as e:
        sys.exit(f"{name}: ElevenLabs answered {e.code}: {e.read().decode(errors='replace')[:300]}")
    path = os.path.join(out_dir, name + ".mp3")
    with open(path, "wb") as f:
        f.write(data)
    print(f"saved {name}.mp3 ({len(data) // 1024} KB)")

print("Done. Tell Claude the files are ready so they can be added to the demo.")
