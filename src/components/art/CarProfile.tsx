import type { BodyType } from "@/types/models";

/**
 * Generic side-profile line drawings, one per body type. They are technical
 * illustrations of a *category*, not of any specific car, and are used when no
 * licensed photograph is available. Car faces right; ground line at y = 222.
 */
interface Profile {
  body: string;
  details: string[];
  wheels: [number, number, number][];
}

const profiles: Record<BodyType, Profile> = {
  "open-wheel": {
    body: "M772 199 L706 191 L650 180 L578 166 L528 154 L500 140 L470 128 L432 124 L404 112 L372 116 L330 132 L262 152 L236 162 L170 166 L160 198 Z",
    details: [
      "M706 199 L792 199 L792 207 L700 207 Z", // front wing
      "M786 186 L792 186 L792 210 L786 210", // endplate
      "M96 98 L214 92 L214 104 L96 112 Z", // rear wing upper
      "M104 120 L206 114 L206 122 L104 128 Z",
      "M112 98 L112 182 M200 94 L200 176", // endplates
      "M532 152 C510 120 474 118 446 126", // halo
      "M330 132 L330 186 M262 152 L560 172", // sidepod
      "M404 112 L410 96 L428 96 L432 124", // airbox
    ],
    wheels: [
      [196, 180, 44],
      [618, 184, 39],
    ],
  },
  prototype: {
    body: "M782 204 L776 182 L742 168 L706 150 L664 140 L622 142 L572 150 L520 104 L470 88 L414 86 L366 94 L318 112 L262 134 L222 140 L150 146 L70 156 L56 200 Z",
    details: [
      "M30 116 L156 122 L156 132 L30 128 Z", // rear wing
      "M72 128 L82 154 M130 132 L136 150",
      "M414 86 L330 104 L156 124", // shark fin
      "M520 104 L586 148", // A-pillar
      "M470 88 C480 104 500 124 534 140", // canopy line
      "M300 196 L520 196", // side skirt
      "M740 204 L792 206", // splitter
    ],
    wheels: [
      [206, 188, 37],
      [624, 188, 37],
    ],
  },
  gt: {
    body: "M772 204 L776 178 L752 164 L700 154 L626 146 L548 112 L490 92 L416 88 L352 96 L290 120 L240 138 L160 146 L116 160 L100 176 L104 204 Z",
    details: [
      "M70 108 L210 106 L210 116 L70 120 Z", // rear wing
      "M120 118 L140 146 M180 116 L190 140", // swan necks
      "M548 112 L520 146 M416 88 L410 140 M352 96 L330 140", // pillars / windows
      "M290 120 L330 140 L520 146",
      "M230 200 L560 200", // sill
      "M740 206 L790 208", // splitter
    ],
    wheels: [
      [200, 190, 35],
      [608, 190, 35],
    ],
  },
  rally: {
    body: "M764 196 L760 162 L728 146 L652 134 L566 92 L470 80 L344 80 L266 92 L246 138 L236 196 Z",
    details: [
      "M206 78 L290 82 L286 92 L214 90 Z", // roof spoiler
      "M566 92 L540 134 L652 134 M470 80 L466 134 M344 80 L340 134 L540 134", // glass
      "M150 190 L150 222 M682 196 L690 224", // mud flaps
      "M300 196 L540 196",
      "M760 176 L790 180 L790 196", // front bumper
    ],
    wheels: [
      [226, 186, 38],
      [592, 186, 38],
    ],
  },
  "rally-raid": {
    body: "M770 186 L762 138 L704 122 L640 112 L580 60 L430 52 L320 56 L250 66 L236 122 L210 186 Z",
    details: [
      "M580 60 L556 112 L640 112 M430 52 L426 112 M320 56 L318 112 L556 112",
      "M230 46 L330 48 M330 48 L330 56", // roof scoop
      "M120 130 L210 130 L210 186 L120 186 Z", // spare / rear
      "M640 120 L760 140",
    ],
    wheels: [
      [250, 176, 46],
      [606, 176, 46],
    ],
  },
  stock: {
    body: "M786 206 L782 168 L744 154 L646 142 L560 108 L480 92 L392 90 L318 100 L262 118 L172 126 L134 134 L126 206 Z",
    details: [
      "M128 116 L176 120 L176 128 L128 126 Z", // spoiler
      "M560 108 L534 142 L646 142 M480 92 L476 140 M392 90 L388 140 M318 100 L310 140 L534 142",
      "M262 200 L560 200",
      "M760 206 L796 208",
    ],
    wheels: [
      [222, 192, 34],
      [610, 192, 34],
    ],
  },
  touring: {
    body: "M774 204 L770 168 L734 152 L640 140 L560 100 L476 86 L376 86 L300 96 L258 118 L160 128 L132 140 L128 204 Z",
    details: [
      "M120 112 L190 112 L190 122 L120 124 Z",
      "M560 100 L534 140 L640 140 M476 86 L472 140 M376 86 L370 140 M300 96 L292 140 L534 140",
      "M262 198 L548 198",
    ],
    wheels: [
      [216, 190, 35],
      [602, 190, 35],
    ],
  },
  dragster: {
    body: "M784 208 L640 202 L420 194 L300 184 L232 170 L210 178 L212 196 L420 204 L780 214 Z",
    details: [
      "M40 52 L210 44 L210 62 L40 72 Z", // rear wing
      "M100 66 L140 140 M180 56 L196 150", // struts
      "M262 168 L276 138 L300 140 L300 180", // cockpit
      "M720 206 L700 186 L746 186 L760 206", // front wing
    ],
    wheels: [
      [146, 164, 60],
      [742, 210, 13],
    ],
  },
  "sprint-car": {
    body: "M700 192 L640 176 L560 168 L470 150 L370 150 L300 160 L270 192 Z",
    details: [
      "M250 46 L560 34 L560 46 L250 64 Z", // top wing
      "M250 46 L250 120 M560 34 L560 120", // side boards
      "M330 120 L330 150 M480 116 L480 150",
      "M640 176 L700 152 L720 152 L700 192", // nose wing
    ],
    wheels: [
      [270, 172, 52],
      [624, 184, 38],
    ],
  },
};

export function CarProfile({ body, accent = "var(--color-apex)", className }: { body: BodyType; accent?: string; className?: string }) {
  const p = profiles[body];
  return (
    <svg viewBox="0 0 820 240" className={className} aria-hidden="true" fill="none">
      <line x1="0" y1="222.5" x2="820" y2="222.5" stroke="rgb(255 255 255 / 0.14)" />
      {p.wheels.map(([cx, , r], i) => (
        <ellipse key={i} cx={cx} cy={222} rx={r * 1.25} ry={4} fill="black" opacity="0.6" />
      ))}
      <path d={p.body} fill="rgb(255 255 255 / 0.035)" stroke="rgb(242 241 238 / 0.82)" strokeWidth="1.6" strokeLinejoin="round" />
      {p.details.map((d, i) => (
        <path key={i} d={d} stroke="rgb(242 241 238 / 0.42)" strokeWidth="1.1" strokeLinejoin="round" />
      ))}
      {/* Livery stripe in the championship accent */}
      <path d={p.body} stroke={accent} strokeWidth="1.6" strokeDasharray="60 2000" strokeDashoffset="-40" opacity="0.95" />
      {p.wheels.map(([cx, cy, r], i) => (
        <g key={`w${i}`}>
          <circle cx={cx} cy={cy} r={r} fill="#0b0c0d" stroke="rgb(242 241 238 / 0.8)" strokeWidth="1.6" />
          <circle cx={cx} cy={cy} r={r * 0.62} stroke="rgb(242 241 238 / 0.3)" strokeWidth="1" />
          <circle cx={cx} cy={cy} r={r * 0.16} fill="rgb(242 241 238 / 0.5)" />
        </g>
      ))}
      {/* Dimension line: wheelbase */}
      {p.wheels.length === 2 ? (
        <g stroke="rgb(255 255 255 / 0.28)" strokeWidth="0.8">
          <line x1={p.wheels[0]![0]} y1="234" x2={p.wheels[1]![0]} y2="234" />
          <line x1={p.wheels[0]![0]} y1="229" x2={p.wheels[0]![0]} y2="239" />
          <line x1={p.wheels[1]![0]} y1="229" x2={p.wheels[1]![0]} y2="239" />
        </g>
      ) : null}
    </svg>
  );
}
