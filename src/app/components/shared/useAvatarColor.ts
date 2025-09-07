import { useTheme } from "@mui/material/styles";

// Hash a string into a number
function hashString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export default function useAvatarColor(name?: string) {
  const theme = useTheme();
  const base = name ? hashString(name) : 0;
  // pick from a small palette derived from theme.palette
  const palette = [
    theme.palette.primary.main,
    theme.palette.secondary.main || theme.palette.grey[500],
    theme.palette.success.main,
    theme.palette.info.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ].filter(Boolean);
  const color = palette[base % palette.length];
  return color;
}
