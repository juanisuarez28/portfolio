import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>
const base = (props: P) => ({ width: 18, height: 18, viewBox: '0 0 24 24', 'aria-hidden': true, ...props })
const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

export const GithubIcon = (p: P) => (
  <svg {...base(p)} fill="currentColor">
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
)
export const LinkedinIcon = (p: P) => (
  <svg {...base(p)} fill="currentColor">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
  </svg>
)
export const InstagramIcon = (p: P) => (
  <svg {...base(p)} {...stroke}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
)
export const FigmaIcon = (p: P) => (
  <svg {...base(p)} {...stroke}>
    <path d="M12 2H8.5a3.5 3.5 0 0 0 0 7H12V2Zm0 7H8.5a3.5 3.5 0 0 0 0 7H12V9Zm0 7H8.5A3.5 3.5 0 1 0 12 19.5V16Zm0-14h3.5a3.5 3.5 0 0 1 0 7H12V2Zm3.5 7a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z" />
  </svg>
)
export const MailIcon = (p: P) => (
  <svg {...base(p)} {...stroke}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
)
export const DownloadIcon = (p: P) => (
  <svg {...base(p)} {...stroke}>
    <path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </svg>
)
export const ExternalIcon = (p: P) => (
  <svg {...base(p)} {...stroke}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </svg>
)
export const FileIcon = (p: P) => (
  <svg {...base(p)} {...stroke}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </svg>
)
export const CopyIcon = (p: P) => (
  <svg {...base(p)} {...stroke}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </svg>
)
export const SunIcon = (p: P) => (
  <svg {...base(p)} {...stroke}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)
export const MoonIcon = (p: P) => (
  <svg {...base(p)} {...stroke}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </svg>
)
export const CloseIcon = (p: P) => (
  <svg {...base(p)} {...stroke}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)
export const BackIcon = (p: P) => (
  <svg {...base(p)} {...stroke}>
    <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
  </svg>
)
export const PinIcon = (p: P) => (
  <svg {...base(p)} {...stroke}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
)
export const CodeIcon = (p: P) => (
  <svg {...base(p)} {...stroke}>
    <path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />
  </svg>
)
export const BallIcon = (p: P) => (
  <svg {...base(p)} {...stroke}>
    <circle cx="12" cy="12" r="9" />
    <path d="m12 7 4 3-1.5 4.5h-5L8 10l4-3ZM12 3v4M21 10.5l-5-.5M18 19l-3.5-4.5M6 19l3.5-4.5M3 10.5l5-.5" />
  </svg>
)

export const linkIcon = {
  site: ExternalIcon,
  repo: GithubIcon,
  instagram: InstagramIcon,
  figma: FigmaIcon,
  doc: FileIcon,
}

export const SoundOnIcon = (p: P) => (
  <svg {...base(p)} {...stroke}>
    <path d="M11 5 6 9H3v6h3l5 4V5Z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
  </svg>
)
export const SoundOffIcon = (p: P) => (
  <svg {...base(p)} {...stroke}>
    <path d="M11 5 6 9H3v6h3l5 4V5Z" />
    <path d="m16 9 5 6M21 9l-5 6" />
  </svg>
)
export const TrophyIcon = (p: P) => (
  <svg {...base(p)} {...stroke}>
    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
    <path d="M17 6h3v2a3 3 0 0 1-3 3M7 6H4v2a3 3 0 0 0 3 3" />
  </svg>
)
export const ResetIcon = (p: P) => (
  <svg {...base(p)} {...stroke}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </svg>
)
export const GaugeIcon = (p: P) => (
  <svg {...base(p)} {...stroke}>
    <path d="M4.5 18a9 9 0 1 1 15 0" />
    <path d="m12 14 4-5" />
    <circle cx="12" cy="14" r="1.2" fill="currentColor" />
  </svg>
)
