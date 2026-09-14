const fs = require('fs');

const skills = [
  { name: 'HTML',           level: 'solid',        fill: 12 },
  { name: 'CSS',            level: 'solid',        fill: 12 },
  { name: 'GDScript',       level: 'comfortable',  fill: 9  },
  { name: 'JavaScript',     level: 'growing',      fill: 8  },
  { name: 'Pixel Art',      level: 'growing',      fill: 8  },
  { name: 'Graphic Design', level: 'solid',        fill: 12 },
  { name: 'CAD',            level: 'learning',     fill: 5  },
  { name: 'Java',           level: 'early',        fill: 4  },
];

const BG        = '#0F130C';
const INK       = '#EFE8D8';
const INK_DIM   = '#A8A697';
const ACCENT    = '#E0632B';
const LINE      = '#3E4A34';
const BAR_FULL  = '#E0632B';
const BAR_EMPTY = '#2A3525';

const W       = 520;
const ROW_H   = 40;
const PADDING = 24;
const TOP     = 52;
const BAR_X   = 240;
const BAR_W   = 160;
const BAR_H   = 6;
const BAR_R   = 3;
const MAX_FILL = 12;
const DELAY   = 120; // ms between each row
const TOTAL_H = TOP + skills.length * ROW_H + PADDING + 28;

function skillRow(skill, index) {
  const y      = TOP + index * ROW_H;
  const textY  = y + 16;
  const barY   = y + 22;
  const delay  = index * DELAY;
  const fillW  = Math.round((skill.fill / MAX_FILL) * BAR_W);

  return `
  <g opacity="0">
    <animate attributeName="opacity"
      values="0;1" dur="200ms" begin="${delay}ms" fill="freeze"/>

    <!-- skill name -->
    <text x="${PADDING}" y="${textY}"
      font-family="monospace" font-size="13" fill="${INK}">${skill.name}</text>

    <!-- level -->
    <text x="${BAR_X + BAR_W + 12}" y="${textY}"
      font-family="monospace" font-size="11" fill="${INK_DIM}"
      opacity="0">
      <animate attributeName="opacity" values="0;1"
        dur="200ms" begin="${delay + 300}ms" fill="freeze"/>
      ${skill.level}
    </text>

    <!-- bar background -->
    <rect x="${BAR_X}" y="${barY}" width="${BAR_W}" height="${BAR_H}"
      rx="${BAR_R}" fill="${BAR_EMPTY}"/>

    <!-- bar fill -->
    <rect x="${BAR_X}" y="${barY}" width="0" height="${BAR_H}"
      rx="${BAR_R}" fill="${BAR_FULL}">
      <animate attributeName="width"
        values="0;${fillW}" dur="500ms" begin="${delay + 100}ms"
        calcMode="spline" keySplines="0.4 0 0.2 1" fill="freeze"/>
    </rect>

    <!-- row divider -->
    <line x1="${PADDING}" y1="${y + ROW_H - 1}"
      x2="${W - PADDING}" y2="${y + ROW_H - 1}"
      stroke="${LINE}" stroke-width="0.5"/>
  </g>`;
}

const totalDur = skills.length * DELAY + 600;

const svg = `<svg xmlns="http://www.w3.org/2000/svg"
  width="${W}" height="${TOTAL_H}" viewBox="0 0 ${W} ${TOTAL_H}">

  <!-- background -->
  <rect width="${W}" height="${TOTAL_H}" rx="6" fill="${BG}"/>
  <rect width="${W}" height="${TOTAL_H}" rx="6"
    fill="none" stroke="${LINE}" stroke-width="1"/>

  <!-- header -->
  <text x="${PADDING}" y="30"
    font-family="monospace" font-size="12" fill="${ACCENT}"
    letter-spacing="2">SKILLS</text>
  <line x1="${PADDING}" y1="38" x2="${W - PADDING}" y2="38"
    stroke="${ACCENT}" stroke-width="1" opacity="0.35"/>

  <!-- rows -->
  ${skills.map((s, i) => skillRow(s, i)).join('')}

  <!-- blinking cursor -->
  <text x="${PADDING}" y="${TOTAL_H - 10}"
    font-family="monospace" font-size="12" fill="${ACCENT}" opacity="0">
    <animate attributeName="opacity" values="0;1"
      begin="${totalDur}ms" dur="1ms" fill="freeze"/>
    <animate attributeName="opacity" values="1;0;1"
      dur="900ms" begin="${totalDur + 100}ms" repeatCount="indefinite"/>
    _
  </text>
</svg>`;

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/skills.svg', svg);
console.log('skills.svg generated — ' + TOTAL_H + 'px tall');
