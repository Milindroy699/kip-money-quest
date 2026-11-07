"""
Synthesises Kip: Money Quest's sound effects and run music from scratch (no samples, no licences).
Run:  python3 scripts/make_sounds.py   (needs numpy). Writes assets/sounds/*.wav (22.05 kHz mono).
"""
import os
import wave

import numpy as np

SR = 22050
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "sounds")
rng = np.random.default_rng(7)


def t(sec):
    return np.arange(int(SR * sec)) / SR


def env(n, attack=0.005, decay=6.0):
    x = np.arange(n) / SR
    a = np.clip(x / attack, 0, 1)
    return a * np.exp(-decay * x)


def tone(freq, sec, decay=6.0, harmonics=((1, 1.0), (2, 0.25), (3, 0.08)), attack=0.004):
    x = t(sec)
    w = sum(amp * np.sin(2 * np.pi * freq * h * x) for h, amp in harmonics)
    return w * env(len(x), attack, decay)


def place(buf, sig, at):
    i = int(at * SR)
    end = min(len(buf), i + len(sig))
    buf[i:end] += sig[: end - i]
    return buf


def lowpass(sig, k):
    kernel = np.ones(k) / k
    return np.convolve(sig, kernel, mode="same")


def write(name, sig, peak=0.7):
    sig = sig / (np.max(np.abs(sig)) + 1e-9) * peak
    fade = int(0.004 * SR)  # tiny fades: no clicks
    sig[:fade] *= np.linspace(0, 1, fade)
    sig[-fade:] *= np.linspace(1, 0, fade)
    os.makedirs(OUT, exist_ok=True)
    with wave.open(os.path.join(OUT, f"{name}.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((sig * 32767).astype(np.int16).tobytes())


NOTE = lambda n: 440.0 * 2 ** ((n - 69) / 12)  # MIDI → Hz

# Coin: a bright two-note "ding".
b = np.zeros(int(SR * 0.3))
place(b, tone(NOTE(88), 0.25, 14), 0)
place(b, tone(NOTE(95), 0.25, 12), 0.06)
write("coin", b, 0.55)

# Bank: a rising major arpeggio with a bell tail.
b = np.zeros(int(SR * 0.7))
for i, n in enumerate([84, 88, 91, 96]):
    place(b, tone(NOTE(n), 0.5, 7), i * 0.06)
write("bank", b, 0.6)

# Hit: a low thump that drops in pitch, plus a puff of noise.
x = t(0.22)
freq = 170 * np.exp(-x * 9) + 55
thump = np.sin(2 * np.pi * np.cumsum(freq) / SR) * env(len(x), 0.002, 14)
noise = lowpass(rng.normal(0, 1, len(x)), 6) * env(len(x), 0.001, 30) * 0.5
write("hit", thump + noise, 0.75)

# The Melt: a soft low rumble that swells and fades.
x = t(0.9)
swell = np.sin(np.pi * x / x[-1]) ** 1.5
rumble = lowpass(rng.normal(0, 1, len(x)), 60) * 6 + 0.4 * np.sin(2 * np.pi * 55 * x + 2 * np.sin(2 * np.pi * 3 * x))
write("melt", rumble * swell, 0.5)

# Right answer: three happy rising notes.
b = np.zeros(int(SR * 0.6))
for i, n in enumerate([79, 83, 86]):
    place(b, tone(NOTE(n), 0.35, 8), i * 0.09)
write("correct", b, 0.6)

# Wrong answer: two falling notes, a little buzzy, never harsh.
b = np.zeros(int(SR * 0.6))
for i, n in enumerate([64, 60]):
    place(b, tone(NOTE(n), 0.32, 7, harmonics=((1, 1.0), (3, 0.3), (5, 0.12))), i * 0.16)
write("wrong", b, 0.5)

# Shield: a metallic "ping" with slightly inharmonic partials.
b = tone(880, 0.6, 6, harmonics=((1, 1.0), (2.76, 0.4), (5.4, 0.2)))
write("shield", b, 0.5)

# Celebrate: an arpeggio up two octaves with sparkles on top.
b = np.zeros(int(SR * 1.4))
for i, n in enumerate([72, 76, 79, 84, 88, 91, 96]):
    place(b, tone(NOTE(n), 0.6, 5), i * 0.07)
for _ in range(14):
    place(b, tone(NOTE(int(rng.integers(96, 108))), 0.12, 25) * 0.35, 0.35 + rng.random() * 0.9)
write("celebrate", b, 0.6)

# Run music: a 4-bar loop at 100 BPM in C major pentatonic (seamless: exact bar length).
BPM = 100
beat = 60 / BPM
bars = 4
length = int(SR * beat * 4 * bars)
music = np.zeros(length)
melody = [72, 74, 76, 79, 81, 79, 76, 74, 72, 76, 79, 81, 84, 81, 79, 76,
          74, 76, 79, 76, 74, 72, 69, 72, 76, 79, 81, 79, 76, 74, 72, 72]
for i, n in enumerate(melody):  # eighth notes, soft triangle-ish lead
    place(music, tone(NOTE(n), beat * 0.48, 5, harmonics=((1, 1.0), (3, 0.11), (5, 0.04))) * 0.45, i * beat / 2)
bass = [48, 48, 55, 55, 45, 45, 52, 52, 41, 41, 48, 48, 43, 43, 50, 50]
for i, n in enumerate(bass):
    place(music, tone(NOTE(n), beat * 0.9, 3, harmonics=((1, 1.0), (2, 0.3))) * 0.5, i * beat)
for i in range(bars * 8):  # light hi-hat on every eighth
    hat = lowpass(rng.normal(0, 1, int(SR * 0.04)), 2) * env(int(SR * 0.04), 0.001, 80)
    place(music, hat * (0.12 if i % 2 else 0.2), i * beat / 2)
write("music_run", music, 0.42)

print("sounds written to", os.path.abspath(OUT))
