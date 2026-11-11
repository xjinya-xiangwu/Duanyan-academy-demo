import type { CSSProperties } from "react";
const paths = {
  arrow: ["M4 12h15m-6-6 6 6-6 6"], back: ["M20 12H5m6-6-6 6 6 6"],
  chevron: ["m9 5 7 7-7 7"], down: ["m6 9 6 6 6-6"],
  check: ["m5 12 4 4L19 6"], close: ["m6 6 12 12M6 18 18 6"],
  book: ["M4 4h6a3 3 0 0 1 2 2v14a4 4 0 0 0-4-2H4V4Z", "M20 4h-6a3 3 0 0 0-2 2v14a4 4 0 0 1 4-2h4V4Z"],
  file: ["M14 3H5v18h14V8l-5-5Z", "M14 3v5h5M8 12h8M8 16h6"],
  quiz: ["M8 4H5v17h14V4h-3", "M8 2h8v5H8V2Zm0 10 1 1 2-2m2 1h3m-8 5h8"],
  figure: ["M4 4h16v16H4z", "m4 16 5-5 4 4 3-3 4 4", "M15.5 8h.01"],
  clock: ["M12 8v5l3 2", "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0"],
  lock: ["M6 10h12v11H6z", "M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"],
  spark: ["m12 3 2.7 6.3L21 12l-6.3 2.7L12 21l-2.7-6.3L3 12l6.3-2.7L12 3Z", "m20 2 .6 1.4L22 4l-1.4.6L20 6l-.6-1.4L18 4l1.4-.6L20 2Z"],
  download: ["M12 3v12m-4-4 4 4 4-4M5 16v5h14v-5"],
  users: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0", "M17 3a4 4 0 0 1 0 8m5 10v-2a4 4 0 0 0-3-3.9"],
  message: ["M21 4H3v13h5l4 4v-4h9V4Z", "M7 9h10M7 13h7"],
  link: ["m10 13 4-4M8 16l-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m4 8a4 4 0 0 0 6 0l4-4a4 4 0 0 0-6-6l-2 2"],
  globe: ["M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0", "M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18"],
  target: ["M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0", "M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0", "M12 12h.01"],
  rotate: ["M3 10a9 9 0 1 1 2 9M3 4v6h6"],
  copy: ["M8 8h13v13H8z", "M16 8V3H3v13h5"],
  info: ["M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0", "M12 11v6m0-10h.01"],
  fullscreen: ["M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"],
  branch: ["M6 3v12a4 4 0 0 0 4 4h8M6 7h8a4 4 0 0 0 4-4", "M20 19a2 2 0 1 1-4 0 2 2 0 0 1 4 0M8 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0"],
  play: ["m9 5 11 7-11 7V5Z"],
} as const;
export type IconName = keyof typeof paths;
export function Icon({ name, size = 20, className = "", style }: { name: IconName; size?: number; className?: string; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={"icon " + className} style={style}>{paths[name].map((d, index) => <path d={d} key={index} />)}</svg>;
}
export function InkLogo() {
  return <svg className="ink-logo" viewBox="0 0 36 36" fill="none" aria-hidden="true"><rect x="1" y="1" width="34" height="34" rx="8" fill="currentColor" /><path d="M10 12h16M10 18h12M10 24h16m-8-14v16m7-10v10" stroke="#f7f5ee" strokeWidth="2.1" strokeLinecap="round" /></svg>;
}
