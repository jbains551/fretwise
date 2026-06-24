/**
 * Fretwise curriculum.
 *
 * A guided path from first chords → strumming → barre chords → scales.
 * Each lesson has instructional `steps` and an optional `practice` spec that
 * the Practice engine can launch directly (metronome, chord-change trainer,
 * scale runner, etc.).
 */

export type PracticeSpec =
  | { kind: "changes"; chords: string[]; seconds: number; targetCpm?: number }
  | { kind: "strum"; bpm: number; pattern: string; chords?: string[]; seconds: number }
  | { kind: "scale"; root: string; scaleId: string; bpm: number }
  | { kind: "metronome"; bpm: number }
  | { kind: "free"; prompt: string; seconds?: number };

export type LessonStep =
  | { kind: "text"; title?: string; body: string }
  | { kind: "tip"; body: string }
  | { kind: "chords"; ids: string[]; body?: string }
  | { kind: "scale"; root: string; scaleId: string; body?: string }
  | { kind: "try"; body: string; practice: PracticeSpec };

export interface Lesson {
  id: string;
  title: string;
  minutes: number;
  summary: string;
  goals: string[];
  steps: LessonStep[];
  chords?: string[];
  practice?: PracticeSpec;
}

export interface Unit {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  lessons: Lesson[];
}

export const CURRICULUM: Unit[] = [
  {
    id: "first-steps",
    title: "First Steps",
    subtitle: "Hold it, tune it, and read the maps",
    emoji: "🎸",
    lessons: [
      {
        id: "holding",
        title: "Holding the guitar & your hands",
        minutes: 6,
        summary: "Posture and hand position that prevent pain and make everything else easier.",
        goals: ["Sit and hold the guitar in a relaxed, sustainable way", "Position the fretting hand with arched fingers", "Find a comfortable picking-hand anchor"],
        steps: [
          { kind: "text", title: "Sit tall, guitar centered", body: "Rest the waist of the guitar on your right leg (if right-handed). Keep your back straight and bring the guitar to you — don't hunch over it. The neck should angle slightly upward." },
          { kind: "text", title: "Fretting hand: thumb behind the neck", body: "Place your thumb on the back of the neck, roughly opposite your middle finger. Curl your fingers so you press the strings with your fingertips, not the flat pads. Short nails on this hand are essential." },
          { kind: "tip", body: "If your hand cramps, you're squeezing too hard. Press just enough to get a clean note — usually less than you think." },
          { kind: "text", title: "Picking hand", body: "Hold the pick between your thumb and the side of your index finger, with just a few millimeters poking out. Let your forearm rest on the body's edge so the hand floats over the strings." },
        ],
      },
      {
        id: "tuning",
        title: "Tuning your guitar",
        minutes: 5,
        summary: "Standard tuning (E A D G B E) and how to keep it in tune.",
        goals: ["Name the six open strings", "Tune using a tuner or reference pitches", "Understand why fresh strings drift"],
        steps: [
          { kind: "text", title: "The six strings, low to high", body: "Thickest to thinnest: E – A – D – G – B – E. A classic memory aid: 'Eddie Ate Dynamite, Good Bye Eddie.' The thick low E is the 6th string; the thin high E is the 1st." },
          { kind: "text", title: "Use the built-in tuner", body: "Open the Fretboard tab and tap each open string to hear its target pitch, or use a clip-on tuner / phone tuner app. Turn the tuning peg until the pitch matches — tune up to the note, not down to it, so the string settles." },
          { kind: "tip", body: "New strings stretch and go flat for a few days. Gently tug each string and re-tune; it'll stabilize." },
          { kind: "try", body: "Play each open string slowly and listen. Can you sing the pitch back?", practice: { kind: "free", prompt: "Tune up, then play all six open strings cleanly from low E to high E.", seconds: 120 } },
        ],
      },
      {
        id: "reading-diagrams",
        title: "Reading chord diagrams & tab",
        minutes: 6,
        summary: "Decode the dots, X's, O's, and numbers you'll see everywhere in this app.",
        goals: ["Read a chord diagram", "Know what X and O mean", "Understand finger numbers 1–4"],
        steps: [
          { kind: "text", title: "A chord box is a mini fretboard", body: "Vertical lines are strings (low E on the left), horizontal lines are frets. The thick line at top is the nut. A dot shows where to press; the number inside is which finger (1 = index, 2 = middle, 3 = ring, 4 = pinky)." },
          { kind: "text", title: "X and O above the strings", body: "O means play that string open. X means don't play (mute) that string. A bar across several strings means one finger presses them all — that's a barre." },
          { kind: "chords", ids: ["Em", "C"], body: "Here are two you'll learn next. Tap a diagram to hear it." },
        ],
      },
    ],
  },
  {
    id: "open-chords",
    title: "Open Chords",
    subtitle: "The eight shapes behind a thousand songs",
    emoji: "🎵",
    lessons: [
      {
        id: "em-am",
        title: "Your first chords: Em & Am",
        minutes: 8,
        summary: "Two-finger shapes that sound great immediately.",
        goals: ["Play Em and Am cleanly", "Strum all/most strings without buzz", "Switch between them slowly"],
        steps: [
          { kind: "chords", ids: ["Em", "Am"], body: "Press with your fingertips, right behind (not on top of) the fret." },
          { kind: "text", title: "Check each string", body: "Pick the strings one at a time. Buzzing usually means you're not pressing hard enough or too far from the fret. A muted thud means a finger is leaning against a neighboring string — arch those knuckles." },
          { kind: "try", body: "Switch Em ↔ Am as cleanly as you can for one minute. Notice your ring and middle fingers stay on the same frets — only the shape shifts strings.", practice: { kind: "changes", chords: ["Em", "Am"], seconds: 60, targetCpm: 20 } },
        ],
        chords: ["Em", "Am"],
        practice: { kind: "changes", chords: ["Em", "Am"], seconds: 60, targetCpm: 20 },
      },
      {
        id: "c-g",
        title: "C and G",
        minutes: 10,
        summary: "The two most common chords in pop and folk — and the trickiest beginner jump.",
        goals: ["Play C and G cleanly", "Use a fingering that makes the change efficient"],
        steps: [
          { kind: "chords", ids: ["C", "G"], body: "For G, try fingers 2-3-4 (middle, ring, pinky). It feels odd at first but makes the change to C and D much faster." },
          { kind: "tip", body: "Going C → G, keep your ring finger anchored — it slides along the same path. Tiny movements beat big jumps." },
          { kind: "try", body: "60 seconds of C ↔ G. Don't rush — accuracy first, speed follows.", practice: { kind: "changes", chords: ["C", "G"], seconds: 60, targetCpm: 16 } },
        ],
        chords: ["C", "G"],
        practice: { kind: "changes", chords: ["C", "G"], seconds: 60, targetCpm: 16 },
      },
      {
        id: "d-a",
        title: "D and A",
        minutes: 9,
        summary: "Two bright chords that open up the key of D and G.",
        goals: ["Play D (top four strings) and A cleanly", "Avoid hitting the muted strings"],
        steps: [
          { kind: "chords", ids: ["D", "A"], body: "D uses only the top four strings — start your strum on the open D (4th) string. A crams three fingers into the 2nd fret." },
          { kind: "tip", body: "If A feels cramped, try rolling one finger to barre strings 2–4, or use fingers 1-2-3 angled slightly." },
          { kind: "try", body: "Switch D ↔ A for a minute, then try G → D → A — the backbone of countless songs.", practice: { kind: "changes", chords: ["D", "A", "G"], seconds: 75, targetCpm: 18 } },
        ],
        chords: ["D", "A"],
        practice: { kind: "changes", chords: ["G", "D", "A"], seconds: 75, targetCpm: 18 },
      },
      {
        id: "clean-changes",
        title: "The secret to clean changes",
        minutes: 8,
        summary: "Minimal movement, common anchors, and the 'one-minute change' drill.",
        goals: ["Identify shared/anchor fingers between chords", "Use the change trainer to measure progress"],
        steps: [
          { kind: "text", title: "Look for what stays", body: "Before switching chords, find any finger that stays on the same string/fret (an 'anchor') or moves only slightly. Move all fingers as one shape, together, not one at a time." },
          { kind: "text", title: "Practice the change, not the chords", body: "You already know the chords. The skill is the transition. Drill just the two-chord switch with a timer and count how many clean changes you make per minute. Watch the number climb week to week." },
          { kind: "try", body: "Pick your weakest pair and run the change trainer.", practice: { kind: "changes", chords: ["C", "G"], seconds: 60 } },
        ],
      },
    ],
  },
  {
    id: "rhythm",
    title: "Strumming & Rhythm",
    subtitle: "Make it groove with a metronome",
    emoji: "🥁",
    lessons: [
      {
        id: "downstrokes",
        title: "Downstrokes & the metronome",
        minutes: 8,
        summary: "Steady time is more important than fancy patterns. Start here.",
        goals: ["Strum steady quarter-note downstrokes in time", "Keep your strumming hand always moving"],
        steps: [
          { kind: "text", title: "From the elbow and wrist", body: "Strum mostly from the wrist with a relaxed arm. Brush through the strings — don't dig in. Aim for an even, consistent volume on every strum." },
          { kind: "text", title: "Lock in with the click", body: "Set the metronome to 70 BPM and strum one downstroke per click on an Em chord. Your goal is boring perfection: every strum lands exactly on the beat." },
          { kind: "try", body: "Strum quarter-note downstrokes on Em at 70 BPM for two minutes.", practice: { kind: "strum", bpm: 70, pattern: "D - D - D - D -", chords: ["Em"], seconds: 120 } },
        ],
        practice: { kind: "strum", bpm: 70, pattern: "D D D D", chords: ["Em"], seconds: 120 },
      },
      {
        id: "upstrokes",
        title: "Adding upstrokes (eighth notes)",
        minutes: 8,
        summary: "Keep the hand moving down-up to double your rhythm.",
        goals: ["Play even down-up eighth notes", "Keep a constant pendulum motion"],
        steps: [
          { kind: "text", title: "The pendulum never stops", body: "Your hand moves down on the beat and up on the 'and' — like a clock pendulum that never pauses. Count out loud: '1 & 2 & 3 & 4 &', down on numbers, up on '&'." },
          { kind: "tip", body: "On upstrokes you only need to catch the top three or four strings. Lighter is fine." },
          { kind: "try", body: "Down-up eighths on Em at 75 BPM.", practice: { kind: "strum", bpm: 75, pattern: "D U D U D U D U", chords: ["Em"], seconds: 120 } },
        ],
        practice: { kind: "strum", bpm: 75, pattern: "D U D U D U D U", chords: ["Em"], seconds: 120 },
      },
      {
        id: "ddu-udu",
        title: "The most useful strum pattern",
        minutes: 10,
        summary: "D – D U – U D U: the pattern hiding in a huge share of pop songs.",
        goals: ["Play the D DU UDU pattern in time", "Apply it while changing chords"],
        steps: [
          { kind: "text", title: "Count it", body: "Pattern over '1 & 2 & 3 & 4 &': Down (1), Down (2) Up (&), Up (&) Down (3... rest the down) Up. The trick: keep the pendulum going and simply miss the strings where there's no strum. The missed downs keep your timing honest." },
          { kind: "text", title: "Hands separate", body: "First master the strum on one chord. Only then add chord changes. Slow the metronome until you can play it without stopping." },
          { kind: "try", body: "Play D-DU-UDU on G at 70 BPM, then try switching G → C every two bars.", practice: { kind: "strum", bpm: 70, pattern: "D - D U - U D U", chords: ["G", "C"], seconds: 150 } },
        ],
        practice: { kind: "strum", bpm: 70, pattern: "D - D U - U D U", chords: ["G", "C"], seconds: 150 },
      },
      {
        id: "first-song",
        title: "Your first song: the 4-chord loop",
        minutes: 12,
        summary: "G – D – Em – C: play hundreds of songs with these four.",
        goals: ["Loop G–D–Em–C with a steady strum", "Change chords without stopping the rhythm"],
        steps: [
          { kind: "chords", ids: ["G", "D", "Em", "C"], body: "One bar (four beats) each, then repeat. This I–V–vi–IV loop is everywhere." },
          { kind: "tip", body: "If a change is too slow, give the last beat of each bar to lifting/moving your hand. A slightly early change beats a late one." },
          { kind: "try", body: "Loop G → D → Em → C, one bar each, at 65 BPM. Keep strumming even if a chord is fuzzy.", practice: { kind: "strum", bpm: 65, pattern: "D - D U - U D U", chords: ["G", "D", "Em", "C"], seconds: 180 } },
        ],
        chords: ["G", "D", "Em", "C"],
        practice: { kind: "strum", bpm: 65, pattern: "D - D U - U D U", chords: ["G", "D", "Em", "C"], seconds: 180 },
      },
    ],
  },
  {
    id: "color-chords",
    title: "Color Chords",
    subtitle: "7ths, sus, and add chords",
    emoji: "🎨",
    lessons: [
      {
        id: "sevenths",
        title: "Dominant 7th chords",
        minutes: 9,
        summary: "E7, A7, D7, G7 — the bluesy, restless chords that pull you forward.",
        goals: ["Play the common open 7th chords", "Hear how a 7th wants to resolve"],
        steps: [
          { kind: "chords", ids: ["E7", "A7", "D7", "G7"], body: "Most are tiny tweaks of chords you know. E7 is E with a finger lifted; G7 swaps one note of G." },
          { kind: "text", title: "Tension and release", body: "A dominant 7 chord sounds slightly unresolved — it 'wants' to move. D7 pulls to G, A7 pulls to D, E7 pulls to A. That pull is the engine of blues and folk." },
          { kind: "try", body: "Play a 12-bar-ish shuffle feel: A7 → D7 → E7. Hear the bluesy push.", practice: { kind: "changes", chords: ["A7", "D7", "E7"], seconds: 90 } },
        ],
        chords: ["E7", "A7", "D7", "G7"],
      },
      {
        id: "sus-add",
        title: "Sus & add chords",
        minutes: 8,
        summary: "Dsus4, Dsus2, Cadd9 — easy embellishments that make strumming sing.",
        goals: ["Decorate D and C with simple finger lifts/adds", "Use Cadd9 next to G"],
        steps: [
          { kind: "chords", ids: ["Dsus4", "Dsus2", "Cadd9"], body: "From a D chord, add your pinky for Dsus4, lift a finger for Dsus2 — wiggling between them is instantly musical." },
          { kind: "tip", body: "G → Cadd9 keeps your ring and pinky planted on the top two strings. Super smooth, very 'singer-songwriter'." },
          { kind: "try", body: "Wiggle D → Dsus4 → D → Dsus2 in a steady rhythm.", practice: { kind: "strum", bpm: 70, pattern: "D - D U - U D U", chords: ["D", "Dsus4", "D", "Dsus2"], seconds: 120 } },
        ],
        chords: ["Dsus4", "Dsus2", "Cadd9"],
      },
    ],
  },
  {
    id: "barre",
    title: "Barre Chords",
    subtitle: "Movable shapes that unlock the whole neck",
    emoji: "💪",
    lessons: [
      {
        id: "barre-mechanics",
        title: "The mechanics of barring",
        minutes: 10,
        summary: "How to press multiple strings with one finger — without the buzz.",
        goals: ["Build the index-finger barre", "Position the thumb and elbow for leverage"],
        steps: [
          { kind: "text", title: "Roll, don't flatten", body: "Lay your index finger across the strings, then roll it slightly toward the nut so you press with the bony side of the finger, not the soft middle. Keep it close to the fret." },
          { kind: "text", title: "Leverage beats force", body: "Drop your thumb to the middle/back of the neck and let your arm weight pull back, rather than squeezing. Bring your elbow in toward your body. This is a skill that takes weeks — sore is normal, painful is not." },
          { kind: "try", body: "Barre across the 5th fret with just your index finger and strum slowly. Aim for every string to ring.", practice: { kind: "free", prompt: "Barre all six strings at the 5th fret. Pick string by string and chase out the buzzes.", seconds: 120 } },
        ],
      },
      {
        id: "easy-f",
        title: "Fmaj7 → the full F",
        minutes: 10,
        summary: "Bridge to the dreaded F with a beautiful stepping-stone chord.",
        goals: ["Play Fmaj7 (no barre)", "Attempt the full F barre"],
        steps: [
          { kind: "chords", ids: ["Fmaj7", "F"], body: "Start with Fmaj7 — no barre, gorgeous sound. When ready, add the index barre across the first fret for full F." },
          { kind: "tip", body: "For full F, you don't need all six strings on day one. Get the top strings ringing first; the low strings will come." },
          { kind: "try", body: "Switch C → Fmaj7 → C. Then attempt C → F.", practice: { kind: "changes", chords: ["C", "Fmaj7"], seconds: 90 } },
        ],
        chords: ["Fmaj7", "F"],
      },
      {
        id: "e-shape-barre",
        title: "E-shape barre chords (movable)",
        minutes: 9,
        summary: "One shape, every fret — major and minor anywhere on the neck.",
        goals: ["Understand the movable E-shape", "Name barre chords by root on the 6th string"],
        steps: [
          { kind: "text", title: "F is just E, moved up", body: "The full F is the open E chord shape with the nut replaced by your index barre. Slide that whole shape up: barre at fret 3 = G, fret 5 = A, fret 7 = B. The note under your barre on the low E string names the chord." },
          { kind: "chords", ids: ["F", "F#m"], body: "Major and minor E-shapes. The minor just lifts one finger — exactly like E vs Em." },
          { kind: "try", body: "Play F (1st fret) → G (3rd) → A (5th) using the same shape.", practice: { kind: "changes", chords: ["F", "F#m"], seconds: 90 } },
        ],
        chords: ["F", "F#m"],
      },
      {
        id: "a-shape-bm",
        title: "A-shape barres & Bm",
        minutes: 9,
        summary: "Root on the 5th string — and finally, Bm.",
        goals: ["Play the A-shape barre", "Add Bm to your chord vocabulary"],
        steps: [
          { kind: "chords", ids: ["Bb", "Bm"], body: "A-shape barres put the root on the 5th string. Bm (A-minor shape at fret 2) shows up in a huge number of songs in the key of D and A." },
          { kind: "tip", body: "Don't worry about the high E string in A-shape barres — many players let their barre finger mute it." },
          { kind: "try", body: "Work D → Bm → G → A — a gorgeous, very common progression.", practice: { kind: "changes", chords: ["D", "Bm", "G", "A"], seconds: 120 } },
        ],
        chords: ["Bb", "Bm"],
      },
    ],
  },
  {
    id: "scales",
    title: "Scales & Lead",
    subtitle: "Warm-ups, the pentatonic, and your first licks",
    emoji: "🎼",
    lessons: [
      {
        id: "chromatic",
        title: "The 1-2-3-4 chromatic warm-up",
        minutes: 7,
        summary: "Finger independence, synchronization, and a daily warm-up for life.",
        goals: ["Play one-finger-per-fret across all strings", "Sync fretting and picking hands to a click"],
        steps: [
          { kind: "text", title: "One finger per fret", body: "On the low E, play frets 1-2-3-4 with fingers 1-2-3-4, one note per metronome click. Move to the A string, and so on up to the high E, then come back down. Keep fingers close to the strings." },
          { kind: "tip", body: "Use alternate picking: down, up, down, up. The goal is both hands hitting at exactly the same instant." },
          { kind: "try", body: "Run the chromatic warm-up at 60 BPM, one note per click.", practice: { kind: "metronome", bpm: 60 } },
        ],
        practice: { kind: "metronome", bpm: 60 },
      },
      {
        id: "min-pentatonic",
        title: "Minor pentatonic — box 1",
        minutes: 10,
        summary: "The single most useful scale for rock and blues soloing.",
        goals: ["Learn the box-1 minor pentatonic shape", "Play it ascending and descending in time"],
        steps: [
          { kind: "scale", root: "A", scaleId: "minPent", body: "Here's A minor pentatonic across the neck. Box 1 starts at the 5th fret — root on the low E (5th fret)." },
          { kind: "text", title: "Two notes per string", body: "Box 1 is wonderfully symmetrical: mostly two notes per string. Memorize the shape, then practice saying the root each time you land on it. This is where solos are born." },
          { kind: "try", body: "Play A minor pentatonic up and down at 70 BPM, two notes per click.", practice: { kind: "scale", root: "A", scaleId: "minPent", bpm: 70 } },
        ],
        practice: { kind: "scale", root: "A", scaleId: "minPent", bpm: 70 },
      },
      {
        id: "major-scale",
        title: "The major scale",
        minutes: 9,
        summary: "Where melody and music theory begin.",
        goals: ["Play a major scale shape", "Hear the do-re-mi steps"],
        steps: [
          { kind: "scale", root: "C", scaleId: "major", body: "The C major scale — all the natural notes. Sing 'do re mi fa sol la ti do' as you play." },
          { kind: "text", title: "Whole and half steps", body: "The major scale's pattern of steps is W-W-H-W-W-W-H (a 'step' is two frets, a 'half-step' one). That pattern is the DNA behind keys, chords, and why songs sound the way they do." },
          { kind: "try", body: "Play C major ascending and descending at 65 BPM.", practice: { kind: "scale", root: "C", scaleId: "major", bpm: 65 } },
        ],
        practice: { kind: "scale", root: "C", scaleId: "major", bpm: 65 },
      },
      {
        id: "first-licks",
        title: "Your first licks",
        minutes: 8,
        summary: "Turn the pentatonic box into actual music with bends and phrasing.",
        goals: ["Play a simple blues lick", "Add a bend and a slide"],
        steps: [
          { kind: "text", title: "Notes are just the alphabet", body: "Phrasing is the poetry. Take 3–4 notes from box 1 and repeat them with feeling — leave space, let notes ring. A bend (push the string up to raise its pitch) and a slide instantly sound expressive." },
          { kind: "tip", body: "Less is more. B.B. King built a career on a handful of notes played with conviction." },
          { kind: "try", body: "Improvise slowly over the A minor pentatonic. Aim for 'musical', not 'fast'.", practice: { kind: "scale", root: "A", scaleId: "minPent", bpm: 60 } },
        ],
        practice: { kind: "scale", root: "A", scaleId: "minPent", bpm: 60 },
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Flat helpers                                                       */
/* ------------------------------------------------------------------ */

export interface FlatLesson extends Lesson {
  unitId: string;
  unitTitle: string;
  index: number; // global order
}

export const FLAT_LESSONS: FlatLesson[] = CURRICULUM.flatMap((u) =>
  u.lessons.map((l) => ({ ...l, unitId: u.id, unitTitle: u.title, index: 0 })),
).map((l, i) => ({ ...l, index: i }));

export const TOTAL_LESSONS = FLAT_LESSONS.length;

export function getLesson(id: string): FlatLesson | undefined {
  return FLAT_LESSONS.find((l) => l.id === id);
}

export function nextLesson(id: string): FlatLesson | undefined {
  const i = FLAT_LESSONS.findIndex((l) => l.id === id);
  return i >= 0 ? FLAT_LESSONS[i + 1] : undefined;
}

/** First lesson the user hasn't completed, given a progress map. */
export function firstIncomplete(progress: Record<string, unknown>): FlatLesson {
  return FLAT_LESSONS.find((l) => !progress[l.id]) ?? FLAT_LESSONS[FLAT_LESSONS.length - 1];
}
