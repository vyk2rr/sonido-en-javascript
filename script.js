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

const container = document.getElementById("noteButtons");

scale.forEach(({ note, freq }) => {
  const btn = document.createElement('div');
  btn.className = 'key';
  btn.textContent = note;
  btn.onclick = () => playNote(freq, `Nota ${note} – Vibración: ${freq.toFixed(2)} Hz`);
  container.appendChild(btn);
});

// Versión embellecida con ADSR y filtro
function playNote(frequency, message) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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
  const attack = 0.05;
  const decay = 0.1;
  const sustainLevel = 0.6;
  const release = 0.3;
  const duration = 1;

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
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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

    // ADSR (ataque más corto para acordes)
    const attack = 0.03;
    const decay = 0.1;
    const sustainLevel = 0.5;
    const release = 0.3;
    const duration = 1;

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
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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

      // ADSR para secuencias, más cortos porque son más rápidas
      const attack = 0.02;
      const decay = 0.05;
      const sustainLevel = 0.6;
      const release = 0.1;

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

  // Semitonos desde A4:
  const semitonesFromA4 = semitoneIndex + (octave - 4) * 12;

  return 440 * Math.pow(2, semitonesFromA4 / 12);
}

function playDScaleNotes() {
  const notes = ['D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#5', 'D5'];
  const sequence = notes.map(note => ({ notes: [note], duration: 0.5 }));

  playChordSequence(sequence);
  document.getElementById('poetryBox').textContent = 'Escala mayor de D en notas D Em F#m G A Bm C#dim D';
}

function playCScaleNotes() {
  const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
  const sequence = notes.map(note => ({ notes: [note], duration: 0.5 }));

  playChordSequence(sequence);
  document.getElementById('poetryBox').textContent = 'Escala mayor de C en notas C Dm Em F G Am Bdim C';
}

function playDScaleChords() {
  const sequence = [
    { notes: ['D4', 'F#4', 'A4'], duration: 0.5 },   // D mayor
    { notes: ['E4', 'G4', 'B4'], duration: 0.5 },    // E menor
    { notes: ['F#4', 'A4', 'C#5'], duration: 0.5 },  // F# menor
    { notes: ['G4', 'B4', 'D5'], duration: 0.5 },    // G mayor
    { notes: ['A4', 'C#5', 'E5'], duration: 0.5 },   // A mayor
    { notes: ['B4', 'D5', 'F#5'], duration: 0.5 },   // B menor
    { notes: ['C#5', 'E5', 'G5'], duration: 0.5 },    // C# disminuido
    { notes: ['D5', 'F#5', 'A5'], duration: 0.5 },   // D mayor
  ];

  playChordSequence(sequence);
  document.getElementById('poetryBox').textContent = 'Escala mayor de D en acordes DF#A EGB F#AC# GBD ACF# BDF# C#EG DFA';
}

function playCScaleChords() {
  const sequence = [
    { notes: ['C4', 'E4', 'G4'], duration: 0.5 },   // C mayor
    { notes: ['D4', 'F4', 'A4'], duration: 0.5 },   // D menor
    { notes: ['E4', 'G4', 'B4'], duration: 0.5 },   // E menor
    { notes: ['F4', 'A4', 'C5'], duration: 0.5 },   // F mayor
    { notes: ['G4', 'B4', 'D5'], duration: 0.5 },   // G mayor
    { notes: ['A4', 'C5', 'E5'], duration: 0.5 },   // A menor
    { notes: ['B4', 'D5', 'F5'], duration: 0.5 },   // B disminuido
    { notes: ['C5', 'E5', 'G5'], duration: 0.5 },   // C mayor
  ];

  playChordSequence(sequence);
  document.getElementById('poetryBox').textContent = 'Escala mayor de C en acordes CEG DFA EGB FAC GBD ACE BDF CEG';
}

function playHymnOfJoy() {
  const sequence = [
    { notes: ['C4', 'E4', 'G4'], duration: 0.5 }, // C – acompaña E
    { notes: ['C4', 'E4', 'G4'], duration: 0.5 }, // C
    { notes: ['F4', 'A4', 'C5'], duration: 0.5 }, // F – acompaña F
    { notes: ['G4', 'B4', 'D5'], duration: 0.5 }, // G – acompaña G

    { notes: ['G4', 'B4', 'D5'], duration: 0.5 }, // G
    { notes: ['F4', 'A4', 'C5'], duration: 0.5 }, // F
    { notes: ['C4', 'E4', 'G4'], duration: 0.5 }, // C
    { notes: ['D4', 'F4', 'A4'], duration: 0.5 }, // Dm

    { notes: ['C4', 'E4', 'G4'], duration: 0.5 }, // C
    { notes: ['C4', 'E4', 'G4'], duration: 0.5 }, // C
    { notes: ['D4', 'F4', 'A4'], duration: 0.5 }, // Dm
    { notes: ['C4', 'E4', 'G4'], duration: 0.5 }, // C

    { notes: ['C4', 'E4', 'G4'], duration: 0.5 }, // C
    { notes: ['D4', 'F4', 'A4'], duration: 0.5 }, // Dm
  ];

  playChordSequence(sequence);
  document.getElementById('poetryBox').textContent = 'Himno a la Alegría – versión armónica simple';
}

function playHymnOfJoyWithMelody() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let currentTime = audioCtx.currentTime;

  const melody = [
    'E5', 'E5', 'F5', 'G5',  // E E F G
    'G5', 'F5', 'E5', 'D5',  // G F E D
    'C5', 'C5', 'D5', 'E5',  // C C D E
    'E5', 'D5', 'D5'         // E D D
  ];

  const chords = [
    ['C4', 'E4', 'G4'],
    ['C4', 'E4', 'G4'],
    ['F4', 'A4', 'C5'],
    ['G4', 'B4', 'D5'],

    ['G4', 'B4', 'D5'],
    ['F4', 'A4', 'C5'],
    ['C4', 'E4', 'G4'],
    ['D4', 'F4', 'A4'],

    ['C4', 'E4', 'G4'],
    ['C4', 'E4', 'G4'],
    ['D4', 'F4', 'A4'],
    ['C4', 'E4', 'G4'],

    ['C4', 'E4', 'G4'],
    ['D4', 'F4', 'A4'],
  ];

  // Recorrer melodía y acordes al mismo tiempo
  for (let i = 0; i < melody.length; i++) {
    const noteFreq = noteToFrequency(melody[i]);

    const melodyOsc = audioCtx.createOscillator();
    melodyOsc.type = 'sine';
    melodyOsc.frequency.setValueAtTime(noteFreq, currentTime);
    melodyOsc.connect(audioCtx.destination);
    melodyOsc.start(currentTime);
    melodyOsc.stop(currentTime + 0.45);

    // reproducir acorde si existe (evita error en mismatch)
    if (chords[i]) {
      chords[i].forEach(note => {
        const chordFreq = noteToFrequency(note);
        const osc = audioCtx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(chordFreq, currentTime);
        osc.connect(audioCtx.destination);
        osc.start(currentTime);
        osc.stop(currentTime + 0.45);
      });
    }

    currentTime += 0.5;
  }

  document.getElementById('poetryBox').textContent = '🎶 Himno a la Alegría (Melodía + Armonía)';
}

const degreeMap = [
  { name: "I",    chord: ['C4','E4','G4'] },
  { name: "ii",   chord: ['D4','F4','A4'] },
  { name: "iii",  chord: ['E4','G4','B4'] },
  { name: "IV",   chord: ['F4','A4','C5'] },
  { name: "V",    chord: ['G4','B4','D5'] },
  { name: "vi",   chord: ['A4','C5','E5'] },
  { name: "vii°", chord: ['B4','D5','F5'] }
];

let currentProgression = {
  display: "I → V → I",
  chords: [degreeMap[0].chord, degreeMap[4].chord, degreeMap[0].chord]
};

function randomProgression(length = 3) {
  let indices = [];
  while (indices.length < length) {
    let idx = Math.floor(Math.random() * degreeMap.length);
    // Evita repetir el mismo grado consecutivamente
    if (indices.length === 0 || indices[indices.length - 1] !== idx) {
      indices.push(idx);
    }
  }
  return {
    display: indices.map(i => degreeMap[i].name).join(" → "),
    chords: indices.map(i => degreeMap[i].chord)
  };
}

function playProgression() {
  const prog = currentProgression.chords;
  let i = 0;
  function playNext() {
    if (i < prog.length) {
      playChord(prog[i]);
      i++;
      setTimeout(playNext, 900);
    }
  }
  playNext();
}

function refreshProgression() {
  // Puedes cambiar el 3 por otro número para progresiones más largas
  currentProgression = randomProgression(3 + Math.floor(Math.random() * 2)); // 3 o 4 grados
  document.getElementById('progressionDisplay').textContent = currentProgression.display;
}

