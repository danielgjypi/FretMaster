import { Theme } from '../components/ThemeProvider';

export const THEMES: { 
  id: Theme; 
  name: string;
  isLight?: boolean;
  colors: { bg: string, fg: string, primary: string, primaryFg: string, muted: string, mutedFg: string, border: string, card: string }
}[] = [
  { id: 'zinc', name: 'Charcoal Grey', colors: { bg: '#09090b', fg: '#f4f4f5', primary: '#e4e4e7', primaryFg: '#09090b', muted: '#18181b', mutedFg: '#71717a', border: '#27272a', card: '#09090b' } },
  { id: 'slate', name: 'Nordic Slate', colors: { bg: '#020617', fg: '#f8fafc', primary: '#38bdf8', primaryFg: '#020617', muted: '#0f172a', mutedFg: '#64748b', border: '#1e293b', card: '#020617' } },
  { id: 'emerald', name: 'Emerald City', colors: { bg: '#022c22', fg: '#ecfdf5', primary: '#34d399', primaryFg: '#022c22', muted: '#064e3b', mutedFg: '#6ee7b7', border: '#065f46', card: '#022c22' } },
  { id: 'rose', name: 'Midnight Rose', colors: { bg: '#4c0519', fg: '#fff1f2', primary: '#fb7185', primaryFg: '#4c0519', muted: '#881337', mutedFg: '#fda4af', border: '#9f1239', card: '#4c0519' } },
  { id: 'amber', name: 'Vintage Amp', colors: { bg: '#451a03', fg: '#fffbeb', primary: '#fbbf24', primaryFg: '#451a03', muted: '#78350f', mutedFg: '#fcd34d', border: '#92400e', card: '#451a03' } },
  { id: 'blue', name: 'Deep Sea', colors: { bg: '#082f49', fg: '#f0f9ff', primary: '#38bdf8', primaryFg: '#082f49', muted: '#0c4a6e', mutedFg: '#7dd3fc', border: '#0ea5e9', card: '#082f49' } },
  { id: 'violet', name: 'Neon Synth', colors: { bg: '#2e1065', fg: '#f5f3ff', primary: '#a78bfa', primaryFg: '#2e1065', muted: '#4c1d95', mutedFg: '#c4b5fd', border: '#5b21b6', card: '#2e1065' } },
  { id: 'orange', name: 'Sunset Strip', colors: { bg: '#431407', fg: '#fff7ed', primary: '#fb923c', primaryFg: '#431407', muted: '#7c2d12', mutedFg: '#fdba74', border: '#9a3412', card: '#431407' } },
  { id: 'teal', name: 'Cyber Teal', colors: { bg: '#042f2e', fg: '#f0fdfa', primary: '#2dd4bf', primaryFg: '#042f2e', muted: '#134e4a', mutedFg: '#5eead4', border: '#115e59', card: '#042f2e' } },
  { id: 'fuchsia', name: 'Miami Vice', colors: { bg: '#4a044e', fg: '#fdf4ff', primary: '#e879f9', primaryFg: '#4a044e', muted: '#701a75', mutedFg: '#f0abfc', border: '#86198f', card: '#4a044e' } },
  { id: 'zinc-light', name: 'Paper White', isLight: true, colors: { bg: '#ffffff', fg: '#09090b', primary: '#18181b', primaryFg: '#fafafa', muted: '#f4f4f5', mutedFg: '#71717a', border: '#e4e4e7', card: '#ffffff' } },
  { id: 'sepia', name: 'Old Ledger', isLight: true, colors: { bg: '#fdf6e3', fg: '#657b83', primary: '#b58900', primaryFg: '#fdf6e3', muted: '#eee8d5', mutedFg: '#93a1a1', border: '#ddd6c1', card: '#fdf6e3' } },
  
  // 16 New themes:
  { id: 'dracula', name: 'Vampire Byte', colors: { bg: '#282a36', fg: '#f8f8f2', primary: '#ff79c6', primaryFg: '#282a36', muted: '#44475a', mutedFg: '#6272a4', border: '#6272a4', card: '#282a36' } },
  { id: 'nord', name: 'Arctic Frost', colors: { bg: '#2e3440', fg: '#d8dee9', primary: '#88c0d0', primaryFg: '#2e3440', muted: '#3b4252', mutedFg: '#4c566a', border: '#4c566a', card: '#2e3440' } },
  { id: 'gruvbox-dark', name: 'Dark Roast', colors: { bg: '#282828', fg: '#ebdbb2', primary: '#fabd2f', primaryFg: '#282828', muted: '#3c3836', mutedFg: '#a89984', border: '#504945', card: '#282828' } },
  { id: 'gruvbox-light', name: 'Latte Foam', isLight: true, colors: { bg: '#fbf1c7', fg: '#3c3836', primary: '#d79921', primaryFg: '#fbf1c7', muted: '#ebdbb2', mutedFg: '#7c6f64', border: '#d5c4a1', card: '#fbf1c7' } },
  { id: 'monokai', name: 'Terminal Green', colors: { bg: '#272822', fg: '#f8f8f2', primary: '#a6e22e', primaryFg: '#272822', muted: '#3e3d32', mutedFg: '#75715e', border: '#75715e', card: '#272822' } },
  { id: 'tokyo-night', name: 'Tokyo Neon', colors: { bg: '#1a1b26', fg: '#c0caf5', primary: '#7aa2f7', primaryFg: '#1a1b26', muted: '#24283b', mutedFg: '#565f89', border: '#414868', card: '#1a1b26' } },
  { id: 'solarized-dark', name: 'Deep Space', colors: { bg: '#002b36', fg: '#839496', primary: '#b58900', primaryFg: '#002b36', muted: '#073642', mutedFg: '#586e75', border: '#586e75', card: '#002b36' } },
  { id: 'oceanic', name: 'Abyss Blue', colors: { bg: '#1b2b34', fg: '#d8dee9', primary: '#5fb3b3', primaryFg: '#1b2b34', muted: '#343d46', mutedFg: '#65737e', border: '#4f5b66', card: '#1b2b34' } },
  { id: 'catppuccin', name: 'Pastel Dreams', colors: { bg: '#1e1e2e', fg: '#cdd6f4', primary: '#cba6f7', primaryFg: '#1e1e2e', muted: '#313244', mutedFg: '#7f849c', border: '#45475a', card: '#1e1e2e' } },
  { id: 'synthwave', name: 'Outrun City', colors: { bg: '#262335', fg: '#ffffff', primary: '#f92aad', primaryFg: '#ffffff', muted: '#34294f', mutedFg: '#8a7aae', border: '#4b367c', card: '#262335' } },
  { id: 'hacker', name: 'Matrix Core', colors: { bg: '#000000', fg: '#00ff00', primary: '#00ff00', primaryFg: '#000000', muted: '#111111', mutedFg: '#008800', border: '#003300', card: '#000000' } },
  { id: 'lavender', name: 'Lavender Mist', isLight: true, colors: { bg: '#f3f0ff', fg: '#4c1d95', primary: '#8b5cf6', primaryFg: '#f3f0ff', muted: '#ede9fe', mutedFg: '#7c3aed', border: '#ddd6fe', card: '#f3f0ff' } },
  { id: 'mint', name: 'Fresh Mint', isLight: true, colors: { bg: '#f0fdf4', fg: '#14532b', primary: '#22c55e', primaryFg: '#f0fdf4', muted: '#dcfce7', mutedFg: '#16a34a', border: '#bbf7d0', card: '#f0fdf4' } },
  { id: 'rosewater', name: 'Cherry Blossom', isLight: true, colors: { bg: '#fff1f2', fg: '#881337', primary: '#f43f5e', primaryFg: '#fff1f2', muted: '#ffe4e6', mutedFg: '#e11d48', border: '#fecdd3', card: '#fff1f2' } },
  { id: 'cyberpunk', name: 'Night City', colors: { bg: '#0f0f15', fg: '#fcee0a', primary: '#00ff9f', primaryFg: '#0f0f15', muted: '#1c1c24', mutedFg: '#d90b8f', border: '#d90b8f', card: '#0f0f15' } },
  { id: 'github-light', name: 'Clean Branch', isLight: true, colors: { bg: '#ffffff', fg: '#24292f', primary: '#0969da', primaryFg: '#ffffff', muted: '#f6f8fa', mutedFg: '#57606a', border: '#d0d7de', card: '#ffffff' } },
];

// Safelist for Tailwind v4 so it doesn't prune dynamically constructed classes:
// theme-zinc theme-slate theme-emerald theme-rose theme-amber theme-blue theme-violet theme-orange theme-teal theme-fuchsia theme-zinc-light theme-sepia theme-dracula theme-nord theme-gruvbox-dark theme-gruvbox-light theme-monokai theme-tokyo-night theme-solarized-dark theme-oceanic theme-catppuccin theme-synthwave theme-hacker theme-lavender theme-mint theme-rosewater theme-cyberpunk theme-github-light

