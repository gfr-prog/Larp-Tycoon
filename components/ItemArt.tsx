import type { Slot } from "@/lib/catalog";

export default function ItemArt({
  slot,
  color,
}: {
  slot: Slot;
  color: string;
}) {
  return (
    <svg className="item-art" viewBox="0 0 180 160" aria-hidden="true">
      <defs>
        <filter id="shadow">
          <feDropShadow dx="0" dy="9" stdDeviation="5" floodOpacity=".12" />
        </filter>
      </defs>
      <g
        filter="url(#shadow)"
        fill={color}
        stroke="#000"
        strokeOpacity=".09"
        strokeWidth="1"
      >
        {slot === "top" ? (
          <>
            <path d="M58 27l-34 21 18 33 17-9-4 65h72l-5-65 17 9 18-33-35-21-13 9H72Z" />
            <path
              d="M72 29q17 19 36 0"
              fill="none"
              stroke="#000"
              strokeOpacity=".2"
              strokeWidth="3"
            />
            <text
              x="90"
              y="85"
              textAnchor="middle"
              fill="#fff"
              stroke="none"
              fontSize="10"
              opacity=".7"
            >
              STUDIO
            </text>
          </>
        ) : slot === "pants" ? (
          <>
            <path d="M53 22h73l10 115h-34L88 65 77 137H43Z" />
            <path d="M53 35h73M88 23v42" fill="none" />
            <path d="M54 43l13 12m45-12-12 12" fill="none" />
          </>
        ) : slot === "shoes" ? (
          <>
            <path d="M26 66l22-25 20 11 20 30 44 8q25 4 23 27H25q-14-8 1-51Z" />
            <path d="M26 108h129v13H26Z" fill="#e5e1d4" />
            <path
              d="M62 66l18 2m-10 9 18 1m-9 9 18 1"
              stroke="#e9e5d9"
              strokeWidth="4"
            />
            <path d="M34 69l16 19 25 7" fill="none" />
          </>
        ) : slot === "hat" ? (
          <>
            <path d="M40 97q-6-70 51-70 50 0 51 58l-50 18Z" />
            <path d="M40 94q62-17 115 0l-26 24-83-13Z" />
            <path d="M91 29v52" fill="none" />
            <text
              x="91"
              y="67"
              fill="#eee"
              stroke="none"
              fontSize="19"
              textAnchor="middle"
            >
              N
            </text>
          </>
        ) : (
          <>
            <path
              d="M49 33q-31 91 42 103 69-16 40-103"
              fill="none"
              stroke={color}
              strokeWidth="9"
              strokeOpacity="1"
            />
            <path d="M91 121l13 18-13 13-12-13Z" strokeOpacity=".2" />
          </>
        )}
      </g>
    </svg>
  );
}
