type Props = { className?: string };

export function AfterEffectsIcon({ className = "h-16 w-16" }: Props) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Adobe After Effects"
    >
      <rect width="100" height="100" rx="22" fill="#000037" />
      <rect width="100" height="100" rx="22" fill="url(#ae-bg)" />
      <rect
        x="2"
        y="2"
        width="96"
        height="96"
        rx="20"
        stroke="#9999ff"
        strokeWidth="3.5"
        strokeOpacity="0.8"
      />
      <text
        x="23"
        y="68"
        fontFamily="system-ui, -apple-system, 'SF Pro Display', sans-serif"
        fontWeight="800"
        fontSize="46"
        fill="#9999ff"
        letterSpacing="-1.5"
      >
        Ae
      </text>
      <defs>
        <linearGradient id="ae-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#120038" />
          <stop offset="1" stopColor="#000028" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function PremiereIcon({ className = "h-16 w-16" }: Props) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Adobe Premiere Pro"
    >
      <rect width="100" height="100" rx="22" fill="#000037" />
      <rect width="100" height="100" rx="22" fill="url(#pr-bg)" />
      <rect
        x="2"
        y="2"
        width="96"
        height="96"
        rx="20"
        stroke="#9999ff"
        strokeWidth="3.5"
        strokeOpacity="0.8"
      />
      <text
        x="24"
        y="68"
        fontFamily="system-ui, -apple-system, 'SF Pro Display', sans-serif"
        fontWeight="800"
        fontSize="46"
        fill="#9999ff"
        letterSpacing="-1.5"
      >
        Pr
      </text>
      <defs>
        <linearGradient id="pr-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0a0028" />
          <stop offset="1" stopColor="#00001f" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function ResolveIcon({ className = "h-16 w-16" }: Props) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="DaVinci Resolve"
    >
      <rect width="100" height="100" rx="22" fill="#131b26" />
      <rect
        x="2"
        y="2"
        width="96"
        height="96"
        rx="20"
        stroke="url(#resolve-border)"
        strokeWidth="3"
        strokeOpacity="0.75"
      />

      {/* Top Teardrop (Cyan/Blue) */}
      <path d="M 50 18 C 64 32, 64 46, 50 52 C 36 46, 36 32, 50 18 Z" fill="url(#resolve-top)" />
      {/* Bottom-Left Teardrop (Yellow/Green) */}
      <path d="M 22 66 C 34 52, 48 56, 50 52 C 46 66, 32 78, 22 66 Z" fill="url(#resolve-left)" />
      {/* Bottom-Right Teardrop (Red/Orange) */}
      <path d="M 78 66 C 68 78, 54 66, 50 52 C 52 56, 66 52, 78 66 Z" fill="url(#resolve-right)" />

      <defs>
        <linearGradient
          id="resolve-border"
          x1="0"
          y1="0"
          x2="100"
          y2="100"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00f0ff" />
          <stop offset="0.5" stopColor="#e2f045" />
          <stop offset="1" stopColor="#ff4d6d" />
        </linearGradient>
        <linearGradient
          id="resolve-top"
          x1="50"
          y1="18"
          x2="50"
          y2="52"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00f0ff" />
          <stop offset="1" stopColor="#0077ff" />
        </linearGradient>
        <linearGradient
          id="resolve-left"
          x1="22"
          y1="66"
          x2="50"
          y2="52"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#f0ff45" />
          <stop offset="1" stopColor="#76d000" />
        </linearGradient>
        <linearGradient
          id="resolve-right"
          x1="78"
          y1="66"
          x2="50"
          y2="52"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ff4d6d" />
          <stop offset="1" stopColor="#ff8800" />
        </linearGradient>
      </defs>
    </svg>
  );
}
