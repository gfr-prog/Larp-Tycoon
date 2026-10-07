import { items } from "@/lib/catalog";
import type { Player } from "@/lib/types";
export default function Avatar({
  fit = {},
  small = false,
}: {
  fit?: Player["fit"];
  small?: boolean;
}) {
  const color = (slot: string, fallback: string) =>
    items.find((x) => x.id === fit[slot as keyof typeof fit])?.color ||
    fallback;
  return (
    <svg
      viewBox="0 0 220 280"
      className={small ? "avatar small" : "avatar"}
      role="img"
      aria-label="Dein aktueller Fit"
    >
      <defs>
        <linearGradient id="skin" x2="1" y2="1">
          <stop stopColor="#edc6a3" />
          <stop offset="1" stopColor="#c99572" />
        </linearGradient>
      </defs>
      <ellipse cx="110" cy="264" rx="63" ry="10" fill="#1c2824" opacity=".14" />
      <path
        d="M76 171L70 250H100L110 187L121 250H152L144 171Z"
        fill={color("pants", "#6b7368")}
      />
      <path
        d="M70 244h31l1 15H61q-2-9 9-15M121 244h30l11 12q1 4-6 4h-37Z"
        fill={color("shoes", "#e9e9dc")}
      />
      <path
        d="M78 86L49 104L34 160l19 9 26-48v60q30 9 65 0v-62l23 49 20-10-18-56-29-16Z"
        fill={color("top", "#e9e5d7")}
      />
      <path
        d="M37 160l16 7-6 21q-6 12-15 2l-2-8ZM169 160l16-5 9 24q4 13-8 16l-9-9Z"
        fill="url(#skin)"
      />
      <path d="M97 66h26v29q-12 14-26 0Z" fill="url(#skin)" />
      <ellipse cx="110" cy="49" rx="30" ry="36" fill="url(#skin)" />
      <path
        d="M80 49Q69 2 111 4q39 0 29 43l-8-20q-25 12-43 0Z"
        fill="#33352c"
      />
      <path
        d="M92 48h7m22 0h7"
        stroke="#413c33"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M106 63q7 5 14-1"
        fill="none"
        stroke="#805b46"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M81 100v69m59-69v69"
        stroke="#000"
        opacity=".07"
        strokeWidth="2"
      />
      {fit.hat && (
        <path
          d="M78 26q1-31 34-29 28 1 33 26l-35 5-35 1q-9 0-10-4Z"
          fill={color("hat", "#5e7254")}
        />
      )}
      <path
        d="M95 89q14 12 29 0"
        fill="none"
        stroke="#aaa999"
        strokeWidth="3"
      />
      {fit.accessory && (
        <>
          <path
            d="M91 92q20 45 39 0"
            fill="none"
            stroke={color("accessory", "#d5b868")}
            strokeWidth="4"
          />
          <circle
            cx="111"
            cy="121"
            r="5"
            fill={color("accessory", "#d5b868")}
          />
        </>
      )}
      {fit.top && (
        <text
          x="111"
          y="136"
          textAnchor="middle"
          fill="#fff"
          opacity=".6"
          fontSize="9"
          fontWeight="700"
        >
          {items.find((x) => x.id === fit.top)?.brand}
        </text>
      )}
    </svg>
  );
}
