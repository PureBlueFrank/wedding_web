const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxCaption = lightbox.querySelector("p");
const closeButton = lightbox.querySelector(".lightbox-close");

document.querySelectorAll(".photo-card").forEach((card) => {
  card.addEventListener("click", () => {
    lightboxImage.src = card.dataset.src;
    lightboxImage.alt = card.dataset.caption;
    lightboxCaption.textContent = card.dataset.caption;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
  });
});

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
}

closeButton.addEventListener("click", closeLightbox);

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
    closeLightbox();
  }
});

const musicButton = document.querySelector(".music-toggle");
const musicText = musicButton.querySelector(".music-text");
const preferredMusicSources = [
  { src: "media/music/zhizi-zhishou.mp3", type: "audio/mpeg" },
  { src: "media/music/zhizi-zhishou.m4a", type: "audio/mp4" },
  { src: "media/music/zhizi-zhishou.aac", type: "audio/aac" },
];
let songAudio;
let audioContext;
let masterGain;
let musicLoopTimer;
let isMusicPlaying = false;
let hasUserPausedMusic = false;
let usingGeneratedMusic = false;
let activeVoices = [];

const beatDuration = 60 / 128;
const cheerfulChords = [
  [523.25, 659.25, 783.99, 1046.5],
  [587.33, 739.99, 880.0, 1174.66],
  [659.25, 783.99, 987.77, 1318.51],
  [698.46, 880.0, 1046.5, 1396.91],
];

const cheerfulMelody = [
  1046.5,
  1174.66,
  1318.51,
  1567.98,
  1396.91,
  1318.51,
  1174.66,
  1046.5,
  1318.51,
  1567.98,
  1760.0,
  1567.98,
  1396.91,
  1318.51,
  1174.66,
  1318.51,
];

function connectWithPan(source, panValue) {
  if (typeof audioContext.createStereoPanner === "function") {
    const pan = audioContext.createStereoPanner();
    pan.pan.setValueAtTime(panValue, audioContext.currentTime);
    source.connect(pan);
    pan.connect(masterGain);
    return pan;
  }

  source.connect(masterGain);
  return null;
}

function createBellVoice(frequency, startTime, duration, volume = 0.05) {
  const oscillator = audioContext.createOscillator();
  const overtone = audioContext.createOscillator();
  const voiceGain = audioContext.createGain();
  const panValue = (Math.random() - 0.5) * 0.42;

  oscillator.type = "triangle";
  overtone.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startTime);
  overtone.frequency.setValueAtTime(frequency * 2, startTime);

  voiceGain.gain.setValueAtTime(0.0001, startTime);
  voiceGain.gain.exponentialRampToValueAtTime(volume, startTime + 0.025);
  voiceGain.gain.exponentialRampToValueAtTime(volume * 0.22, startTime + duration * 0.45);
  voiceGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(voiceGain);
  overtone.connect(voiceGain);
  connectWithPan(voiceGain, panValue);

  oscillator.start(startTime);
  overtone.start(startTime);
  oscillator.stop(startTime + duration + 0.1);
  overtone.stop(startTime + duration + 0.1);

  return { oscillator, overtone, voiceGain };
}

function createSoftClap(startTime) {
  const bufferSize = Math.floor(audioContext.sampleRate * 0.035);
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  const source = audioContext.createBufferSource();
  const voiceGain = audioContext.createGain();

  for (let index = 0; index < bufferSize; index += 1) {
    data[index] = (Math.random() * 2 - 1) * (1 - index / bufferSize);
  }

  source.buffer = buffer;
  voiceGain.gain.setValueAtTime(0.0001, startTime);
  voiceGain.gain.exponentialRampToValueAtTime(0.018, startTime + 0.006);
  voiceGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.035);
  source.connect(voiceGain);
  connectWithPan(voiceGain, 0);
  source.start(startTime);
  source.stop(startTime + 0.045);

  return { voiceGain };
}

function scheduleCheerfulBar(barIndex = 0) {
  if (!isMusicPlaying || !audioContext) {
    return;
  }

  const startTime = audioContext.currentTime + 0.04;
  const chord = cheerfulChords[barIndex % cheerfulChords.length];
  const createdVoices = [];

  for (let step = 0; step < 16; step += 1) {
    const stepTime = startTime + step * beatDuration * 0.5;
    const melodyNote = cheerfulMelody[(barIndex * 4 + step) % cheerfulMelody.length];
    const chordNote = chord[step % chord.length];

    if (step % 2 === 0) {
      createdVoices.push(createBellVoice(chordNote, stepTime, 0.42, 0.032));
    }

    if (step % 4 === 0 || step % 4 === 3) {
      createdVoices.push(createBellVoice(melodyNote, stepTime, 0.34, 0.045));
    }

    if (step === 4 || step === 12) {
      createdVoices.push(createSoftClap(stepTime));
    }
  }

  activeVoices = activeVoices.concat(createdVoices).slice(-80);
  musicLoopTimer = window.setTimeout(
    () => scheduleCheerfulBar((barIndex + 1) % cheerfulChords.length),
    beatDuration * 8 * 1000
  );
}

function setMusicVolume(value) {
  if (!masterGain) {
    return;
  }

  masterGain.gain.cancelScheduledValues(audioContext.currentTime);
  masterGain.gain.linearRampToValueAtTime(value, audioContext.currentTime + 0.45);
}

function setSongVolume(value) {
  if (songAudio) {
    songAudio.volume = value;
  }
}

function ensureSongAudio() {
  if (songAudio) {
    return songAudio;
  }

  songAudio = document.createElement("audio");
  preferredMusicSources.forEach(({ src, type }) => {
    const source = document.createElement("source");
    source.src = src;
    source.type = type;
    songAudio.appendChild(source);
  });
  songAudio.loop = true;
  songAudio.preload = "auto";
  songAudio.volume = 0.62;
  songAudio.setAttribute("playsinline", "");
  songAudio.setAttribute("webkit-playsinline", "");
  songAudio.addEventListener("error", () => {
    if (isMusicPlaying && !usingGeneratedMusic) {
      startGeneratedMusic();
    }
  });
  document.body.appendChild(songAudio);

  return songAudio;
}

function startGeneratedMusic() {
  if (!audioContext) {
    const AudioEngine = window.AudioContext || window.webkitAudioContext;
    if (!AudioEngine) {
      return;
    }
    audioContext = new AudioEngine();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.0001;
    masterGain.connect(audioContext.destination);
  }

  usingGeneratedMusic = true;
  setMusicVolume(0.28);

  const resumeAudio = typeof audioContext.resume === "function" ? audioContext.resume() : Promise.resolve();
  resumeAudio
    .then(() => {
      scheduleCheerfulBar();
    })
    .catch(stopMusic);
}

function startMusic() {
  if (isMusicPlaying) {
    if (songAudio && songAudio.paused) {
      songAudio.play().catch(startGeneratedMusic);
    }

    if (audioContext && audioContext.state === "suspended" && typeof audioContext.resume === "function") {
      audioContext.resume().catch(stopMusic);
    }
    return;
  }

  isMusicPlaying = true;
  musicButton.classList.add("is-playing");
  musicButton.setAttribute("aria-label", "暂停背景音乐");
  musicButton.setAttribute("aria-pressed", "true");
  musicText.textContent = "Playing";

  const audio = ensureSongAudio();
  setSongVolume(0.62);
  setMusicVolume(0.0001);

  audio.play()
    .then(() => {
      usingGeneratedMusic = false;
      window.clearTimeout(musicLoopTimer);
    })
    .catch(startGeneratedMusic);
}

function stopMusic() {
  isMusicPlaying = false;
  usingGeneratedMusic = false;
  window.clearTimeout(musicLoopTimer);
  if (songAudio) {
    songAudio.pause();
  }
  activeVoices.forEach(({ voiceGain }) => {
    if (audioContext) {
      voiceGain.gain.cancelScheduledValues(audioContext.currentTime);
      voiceGain.gain.linearRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);
    }
  });
  activeVoices = [];
  setMusicVolume(0.0001);
  musicButton.classList.remove("is-playing");
  musicButton.setAttribute("aria-label", "播放背景音乐");
  musicButton.setAttribute("aria-pressed", "false");
  musicText.textContent = "Music";
}

musicButton.addEventListener("click", () => {
  if (isMusicPlaying) {
    hasUserPausedMusic = true;
    stopMusic();
    return;
  }

  hasUserPausedMusic = false;
  startMusic();
});

function requestAutoplay() {
  if (hasUserPausedMusic) {
    return;
  }

  startMusic();
}

window.addEventListener("load", () => {
  window.setTimeout(requestAutoplay, 450);
});

document.addEventListener("WeixinJSBridgeReady", requestAutoplay, false);
document.addEventListener("touchstart", requestAutoplay, { once: true, passive: true });
document.addEventListener("click", requestAutoplay, { once: true });

document.querySelectorAll("video").forEach((video) => {
  video.addEventListener("play", () => {
    setSongVolume(0.18);
    setMusicVolume(0.08);
  });
  video.addEventListener("pause", () => {
    if (isMusicPlaying) {
      setSongVolume(0.62);
      setMusicVolume(0.28);
    }
  });
});
