// =====================
// CONFIGURACIÓN GENERAL
// =====================
const scale = [
  { note: "C", freq: 261.63 },
  { note: "C#", freq: 277.18 },
  { note: "D", freq: 293.66 },
  { note: "D#", freq: 311.13 },
  { note: "E", freq: 329.63 },
  { note: "F", freq: 349.23 },
  { note: "F#", freq: 369.99 },
  { note: "G", freq: 392.00 },
  { note: "G#", freq: 415.30 },
  { note: "A", freq: 440.00 },
  { note: "A#", freq: 466.16 },
  { note: "B", freq: 493.88 }
];

window.scale = scale;

const degreeMap = [
  { name: "I",    chord: ['C4','E4','G4'] },
  { name: "ii",   chord: ['D4','F4','A4'] },
  { name: "iii",  chord: ['E4','G4','B4'] },
  { name: "IV",   chord: ['F4','A4','C5'] },
  { name: "V",    chord: ['G4','B4','D5'] },
  { name: "vi",   chord: ['A4','C5','E5'] },
  { name: "vii°", chord: ['B4','D5','F5'] }
];

const rootColorMap = {
  'C': '#e74c3c',     // rojo
  'D': '#e67e22',     // naranja
  'E': '#f1c40f',     // amarillo
  'F': '#2ecc71',     // verde
  'G': '#3498db',     // azul
  'A': '#1a237e',     // azul oscuro
  'B': '#9b59b6'      // morado
};

// =====================
// AUDIO CONTEXT GLOBAL
// =====================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// =====================
// UTILIDADES
// =====================
function getRootColorFromNote(note) {
  // note es un string como 'C4', 'D#5', etc.
  return rootColorMap[note[0]] || '#fff';
}

function getRootColor(chord) {
  // chord es un array como ['C4','E4','G4']
  const root = chord[0][0];
  return rootColorMap[root] || '#fff';
}

function noteToFrequency(note) {
  const noteRegex = /^([A-G])(#|b)?(\d)$/;
  const noteSemitones = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
  const match = note.match(noteRegex);
  if (!match) throw new Error('Nota inválida: ' + note);
  let [, pitch, accidental, octave] = match;
  octave = parseInt(octave);
  let semitoneIndex = noteSemitones[pitch.toUpperCase()];
  if (accidental === '#') semitoneIndex += 1;
  else if (accidental === 'b') semitoneIndex -= 1;
  const semitonesFromA4 = semitoneIndex + (octave - 4) * 12;
  return 440 * Math.pow(2, semitonesFromA4 / 12);
}

// =====================
// GENERACIÓN DE BOTONES DE NOTA
// =====================
const container = document.getElementById("noteButtons");
let originalNoteButtonsBg = null;
let noteBgClickId = 0;

scale.forEach(({ note, freq }) => {
  const btn = document.createElement('div');
  btn.className = 'key';
  btn.textContent = note;
  btn.onclick = () => {
    const noteButtonsDiv = document.getElementById('noteButtons');
    if (originalNoteButtonsBg === null) {
      originalNoteButtonsBg = noteButtonsDiv.style.background;
    }
    noteBgClickId++;
    const thisClickId = noteBgClickId;
    noteButtonsDiv.style.background = getRootColorFromNote(note);
    playNote(freq, `Nota ${note} – Vibración: ${freq.toFixed(2)} Hz`);
    setTimeout(() => {
      if (noteBgClickId === thisClickId) {
        noteButtonsDiv.style.background = originalNoteButtonsBg;
      }
    }, 1000);
  };
  container.appendChild(btn);
});

// =====================
// FUNCIONES DE AUDIO
// =====================
function playNote(frequency, message) {
  const now = audioCtx.currentTime;
  const oscillator = audioCtx.createOscillator();
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(frequency, now);

  const gainNode = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1200, now);

  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  // ADSR
  const attack = 0.05, decay = 0.1, sustainLevel = 0.6, release = 0.3, duration = 1;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(1, now + attack);
  gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attack + decay);
  gainNode.gain.setValueAtTime(sustainLevel, now + duration - release);
  gainNode.gain.linearRampToValueAtTime(0, now + duration);

  oscillator.start(now);
  oscillator.stop(now + duration);

  document.getElementById('poetryBox').textContent = message;
}

function playChord(notes, message) {
  const now = audioCtx.currentTime;
  notes.forEach(note => {
    const freq = typeof note === 'string' ? noteToFrequency(note) : note;
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(freq, now);

    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // ADSR para acordes
    const attack = 0.03, decay = 0.1, sustainLevel = 0.5, release = 0.3, duration = 1;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + attack);
    gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attack + decay);
    gainNode.gain.setValueAtTime(sustainLevel, now + duration - release);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  });
  document.getElementById('poetryBox').textContent = message || '—';
}

function playChordSequence(sequence) {
  let currentTime = audioCtx.currentTime;
  sequence.forEach(({ notes, duration }) => {
    notes.forEach(note => {
      const freq = typeof note === 'string' ? noteToFrequency(note) : note;
      const oscillator = audioCtx.createOscillator();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(freq, currentTime);

      const gainNode = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, currentTime);

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      // ADSR para secuencias
      const attack = 0.02, decay = 0.05, sustainLevel = 0.6, release = 0.1;
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(1, currentTime + attack);
      gainNode.gain.linearRampToValueAtTime(sustainLevel, currentTime + attack + decay);
      gainNode.gain.setValueAtTime(sustainLevel, currentTime + duration - release);
      gainNode.gain.linearRampToValueAtTime(0, currentTime + duration);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + duration);
    });
    currentTime += duration;
  });
}

// =====================
// FUNCIONES DE ESCALAS Y ACORDES
// =====================
function playDScaleNotes() {
  const notes = ['D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#5', 'D5'];
  const sequence = notes.map(note => ({ notes: [note], duration: 0.5 }));

  let i = 0;
  function playNextNote() {
    if (i < sequence.length) {
      playChord(sequence[i].notes);
      highlightPianoKey(sequence[i].notes[0], sequence[i].duration * 1000 + 100);
      i++;
      setTimeout(playNextNote, sequence[i - 1].duration * 1000 + 100);
    } else {
      setTimeout(() => {
        document.querySelectorAll('.white-key, .black-key').forEach(key => key.classList.remove('active-key'));
      }, 600);
    }
  }
  playNextNote();

  document.getElementById('poetryBox').textContent = 'Escala mayor de D en notas D Em F#m G A Bm C#dim D';
}

function playCScaleNotes() {
  const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
  const sequence = notes.map(note => ({ notes: [note], duration: 0.5 }));

  let i = 0;
  function playNextNote() {
    if (i < sequence.length) {
      playChord(sequence[i].notes);
      highlightPianoKey(sequence[i].notes[0], sequence[i].duration * 1000 + 100);
      i++;
      setTimeout(playNextNote, sequence[i - 1].duration * 1000 + 100);
    } else {
      setTimeout(() => {
        document.querySelectorAll('.white-key, .black-key').forEach(key => key.classList.remove('active-key'));
      }, 600);
    }
  }
  playNextNote();

  document.getElementById('poetryBox').textContent = 'Escala mayor de C en notas C Dm Em F G Am Bdim C';
}

function playDScaleChords() {
  const sequence = [
    { notes: ['D4', 'F#4', 'A4'], duration: 0.5 },
    { notes: ['E4', 'G4', 'B4'], duration: 0.5 },
    { notes: ['F#4', 'A4', 'C#5'], duration: 0.5 },
    { notes: ['G4', 'B4', 'D5'], duration: 0.5 },
    { notes: ['A4', 'C#5', 'E5'], duration: 0.5 },
    { notes: ['B4', 'D5', 'F#5'], duration: 0.5 },
    { notes: ['C#5', 'E5', 'G5'], duration: 0.5 },
    { notes: ['D5', 'F#5', 'A5'], duration: 0.5 }
  ];

  let i = 0;
  function playNextChord() {
    if (i < sequence.length) {
      playChord(sequence[i].notes);
      highlightPianoKey(sequence[i].notes);
      i++;
      setTimeout(playNextChord, sequence[i - 1].duration * 1000 + 100); // +100ms para evitar solapamiento
    } else {
      setTimeout(() => {
        document.querySelectorAll('.white-key, .black-key').forEach(key => key.classList.remove('active-key'));
      }, 600);
    }
  }
  playNextChord();

  document.getElementById('poetryBox').textContent = 'Escala mayor de D en acordes DF#A EGB F#AC# GBD ACF# BDF# C#EG DFA';
}

function playCScaleChords() {
  const sequence = [
    { notes: ['C4', 'E4', 'G4'], duration: 0.5 },
    { notes: ['D4', 'F4', 'A4'], duration: 0.5 },
    { notes: ['E4', 'G4', 'B4'], duration: 0.5 },
    { notes: ['F4', 'A4', 'C5'], duration: 0.5 },
    { notes: ['G4', 'B4', 'D5'], duration: 0.5 },
    { notes: ['A4', 'C5', 'E5'], duration: 0.5 },
    { notes: ['B4', 'D5', 'F5'], duration: 0.5 },
    { notes: ['C5', 'E5', 'G5'], duration: 0.5 }
  ];

  let i = 0;
  function playNextChord() {
    if (i < sequence.length) {
      playChord(sequence[i].notes);
      highlightPianoKey(sequence[i].notes);
      i++;
      setTimeout(playNextChord, sequence[i - 1].duration * 1000 + 100); // +100ms para evitar solapamiento
    } else {
      setTimeout(() => {
        document.querySelectorAll('.white-key, .black-key').forEach(key => key.classList.remove('active-key'));
      }, 600);
    }
  }
  playNextChord();

  document.getElementById('poetryBox').textContent = 'Escala mayor de C en acordes CEG DFA EGB FAC GBD ACE BDF CEG';
}

// =====================
// EAR TRAINER: PROGRESIONES RANDOM
// =====================
let currentProgression = {
  display: "I → V → I",
  chords: [degreeMap[0].chord, degreeMap[4].chord, degreeMap[0].chord]
};

function randomProgression(length = 4) {
  const tonicIndex = 0; // I
  let indices = [];
  // Decide aleatoriamente si la tónica va al inicio o al final
  const tonicAtStart = Math.random() < 0.5;
  if (tonicAtStart) indices.push(tonicIndex);
  while (indices.length < length - (tonicAtStart ? 0 : 1)) {
    let idx = Math.floor(Math.random() * degreeMap.length);
    // Evita la tónica en medio y acordes consecutivos iguales
    if (
      idx !== tonicIndex &&
      (indices.length === 0 || indices[indices.length - 1] !== idx)
    ) {
      indices.push(idx);
    }
  }
  if (!tonicAtStart) indices.push(tonicIndex);
  return {
    display: indices.map(i => degreeMap[i].name).join(" → "),
    chords: indices.map(i => degreeMap[i].chord)
  };
}

function playProgression() {
  const prog = currentProgression.chords;
  const duration = 900; 
  let i = 0;
  function playNext() {
    if (i < prog.length) {
      document.getElementById('progressionBox').style.background = getRootColor(prog[i]);
      playChord(prog[i]);
      highlightPianoKey(prog[i], duration); 
      i++;
      setTimeout(playNext, duration);
    } else {
      document.getElementById('progressionBox').style.background = '';
    }
  }
  playNext();
}

function refreshProgression() {
  currentProgression = randomProgression(3 + Math.floor(Math.random() * 2)); // 3 o 4 grados
  document.getElementById('progressionDisplay').textContent = currentProgression.display;
}

function highlightPianoKey(note, duration = 1000) {
  document.querySelectorAll('.white-key, .black-key').forEach(key => key.classList.remove('active-key'));
  if (Array.isArray(note)) {
    note.forEach(n => {
      const key = document.querySelector(`[data-note="${n}"]`);
      if (key) key.classList.add('active-key');
    });
  } else {
    const key = document.querySelector(`[data-note="${note}"]`);
    if (key) key.classList.add('active-key');
  }
  setTimeout(() => {
    document.querySelectorAll('.white-key, .black-key').forEach(key => key.classList.remove('active-key'));
  }, duration);
}