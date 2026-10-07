export default function CityArt() {
  return (
    <svg viewBox="0 0 520 340" className="city-art" aria-hidden="true">
      <defs>
        <linearGradient id="tower" x2="1" y2="1">
          <stop stopColor="#c6d0ba" />
          <stop offset="1" stopColor="#5e7968" />
        </linearGradient>
        <linearGradient id="road" x2="1" y2="1">
          <stop stopColor="#80937a" />
          <stop offset="1" stopColor="#3e5d4d" />
        </linearGradient>
      </defs>
      <path d="M40 245L260 120l220 125-220 121Z" fill="url(#road)" />
      <path
        d="M120 245L330 126M180 299L391 181"
        stroke="#d6ddc8"
        opacity=".3"
        strokeWidth="16"
      />
      <path d="M228 91l68-39 59 33v152l-68 41-59-34Z" fill="url(#tower)" />
      <path d="M296 52v185l-68-39V91Z" fill="#a7baa1" />
      <path d="M296 52l59 33-68 40-59-34Z" fill="#dae0cd" />
      <path d="M296 86v151l-9 41V125Z" fill="#344f40" />
      {Array.from({ length: 7 }, (_, i) => (
        <g key={i}>
          <path
            d={`M238 ${111 + i * 17}l46 26M307 ${118 + i * 17}l35-20`}
            stroke="#486451"
            strokeWidth="6"
          />
          <path
            d={`M243 ${109 + i * 17}v11M264 ${121 + i * 17}v12M317 ${106 + i * 17}v11M335 ${96 + i * 17}v12`}
            stroke="#dce2cc"
            strokeWidth="3"
          />
        </g>
      ))}
      <path d="M123 172l51-29 40 23v84l-51 29-40-23Z" fill="#b5c4a5" />
      <path d="M174 143v107l40-23v-61Z" fill="#60795e" />
      <path d="M123 172l51-29 40 23-51 30Z" fill="#e4e6cf" />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M135 ${193 + i * 20}l26 15m22 ${-18}l18-10`}
          stroke="#55754f"
          strokeWidth="8"
        />
      ))}
      <path d="M325 235l44-26 51 29v52l-44 25-51-29Z" fill="#d3cfad" />
      <path d="M369 209v52l51 29v-52Z" fill="#8c9771" />
      <path d="M321 229l45-26 59 33-45 26Z" fill="#d9dfc3" />
      <path d="M349 254l22 13v25l-22-12Z" fill="#54735c" />
      <path d="M70 253l22-13 31 18-22 13Z" fill="#e8dfb3" />
      <path d="M70 253v13l31 18v-13l22-13v-10" fill="#adb292" />
      <circle cx="82" cy="270" r="5" fill="#273e32" />
      <circle cx="111" cy="275" r="5" fill="#273e32" />
      {[
        [105, 211],
        [410, 197],
        [242, 293],
        [438, 267],
      ].map(([x, y], i) => (
        <g key={i}>
          <path d={`M${x} ${y}v25`} stroke="#647052" strokeWidth="5" />
          <ellipse cx={x} cy={y - 6} rx="15" ry="23" fill="#64805b" />
          <ellipse cx={x - 5} cy={y - 11} rx="9" ry="15" fill="#829871" />
        </g>
      ))}
      <path d="M274 38v-24m-12 12h24" stroke="#c1cfaa" strokeWidth="2" />
      <circle cx="400" cy="83" r="3" fill="#c1cfaa" />
    </svg>
  );
}
