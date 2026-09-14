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

const W        = 520;
const ROW_H    = 40;
const PADDING  = 24;
const TOP      = 52;
const BAR_X    = 220;
const BAR_W    = 170;
const BAR_H    = 7;
const BAR_R    = 3;
const MAX_FILL = 12;
const DELAY    = 150;
const TOTAL_H  = TOP + skills.length * ROW_H + PADDING + 24;

function skillRow(skill, index) {
  const y     = TOP + index * ROW_H;
  const textY = y + 20;
  const barY  = y + 14;
  const delay = index * DELAY;
  const fillW = Math.round((skill.fill / MAX_FILL) * BAR_W);

  return `
  <g>
    <!-- skill name — always visible, no animation -->
    <text x="${PADDING}" y="${textY}"
      font-family="monospace" font-size="13" fill="${INK}">${skill.name}</text>

    <!-- level — always visible -->
    <text x="${BAR_X + BAR_W + 12}" y="${textY}"
      font-family="monospace" font-size="11" fill="${INK_DIM}">${skill.level}</text>

    <!-- bar background — always visible -->
    <rect x="${BAR_X}" y="${barY}" width="${BAR_W}" height="${BAR_H}"
      rx="${BAR_R}" fill="${BAR_EMPTY}"/>

    <!-- bar fill — animates width from 0 -->
    <rect x="${BAR_X}" y="${barY}" width="0" height="${BAR_H}"
      rx="${BAR_R}" fill="${BAR_FULL}">
      <animate attributeName="width"
        from="0" to="${fillW}"
        dur="600ms" begin="${delay}ms"
        calcMode="spline" keySplines="0.4 0 0.2 1"
        fill="freeze"/>
    </rect>

    <!-- row divider -->
    <line x1="${PADDING}" y1="${y + ROW_H - 1}"
      x2="${W - PADDING}" y2="${y + ROW_H - 1}"
      stroke="${LINE}" stroke-width="0.5"/>
  </g>`;
}

const totalDur = skills.length * DELAY + 700;

const svg = `<svg xmlns="http://www.w3.org/2000/svg"
  width="${W}" height="${TOTAL_H}" viewBox="0 0 ${W} ${TOTAL_H}">

  <rect width="${W}" height="${TOTAL_H}" rx="6" fill="${BG}"/>
  <rect width="${W}" height="${TOTAL_H}" rx="6"
    fill="none" stroke="${LINE}" stroke-width="1"/>

  <text x="${PADDING}" y="30"
    font-family="monospace" font-size="11" fill="${ACCENT}"
    letter-spacing="3">SKILLS</text>
  <line x1="${PADDING}" y1="38" x2="${W - PADDING}" y2="38"
    stroke="${ACCENT}" stroke-width="1" opacity="0.3"/>

  ${skills.map((s, i) => skillRow(s, i)).join('')}

  <!-- blinking cursor -->
  <text x="${PADDING}" y="${TOTAL_H - 8}"
    font-family="monospace" font-size="12" fill="${ACCENT}">
    <animate attributeName="opacity"
      values="1;0;1" dur="900ms"
      begin="${totalDur}ms" repeatCount="indefinite"/>
    _
  </text>
</svg>`;

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/skills.svg', svg);
console.log('done — ' + TOTAL_H + 'px');
