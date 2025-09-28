"use client";

import React from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";

type WaveProps = {
  color?: string; // optional fill override
  sx?: SxProps<Theme>; // optional extra styles
  preserveAspectRatio?: string;
};

const useLightPink = (fallback = "#fdeffd") => {
  const theme = useTheme();
  return theme.palette?.custom?.lightPink ?? fallback;
};

// Wave 2
export const Wave2: React.FC<WaveProps> = ({ color, sx }) => {
  const themeLightPink = useLightPink();
  const fill = color ?? themeLightPink;
  return (
    <Box
      component="svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 170"
      sx={{ display: "block", width: "100%", ...sx }}
    >
      <path
        fill={fill}
        fillOpacity="1"
        d="M0,96L48,85.3C96,75,192,53,288,53.3C384,53,480,75,576,90.7C672,107,768,117,864,117.3C960,117,1056,107,1152,101.3C1248,96,1344,96,1392,96L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
      />
    </Box>
  );
};

// Wave 1
const Wave1: React.FC<WaveProps> = ({ color, sx }) => {
  const themeLightPink = useLightPink();
  const fill = color ?? themeLightPink;
  return (
    <Box
      component="svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 120 1440 200"
      sx={{ display: "block", width: "100%", ...sx }}
    >
      <path
        fill={fill}
        fillOpacity="1"
        d="M0,320L80,320C160,320,320,320,480,304C640,288,800,256,960,245.3C1120,235,1280,245,1360,250.7L1440,256L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
      />
    </Box>
  );
};

// Wave 4
export const Wave4: React.FC<WaveProps> = ({ color = "#fff", sx }) => (
  <Box
    component="svg"
    viewBox="0 0 1200 81.7"
    sx={{ display: "block", width: "100%", ...sx }}
  >
    <path
      d="M447.27,69.5C528,56.21,606.14,32.4,686.63,18,801.29-2.64,920.7-3.88,1035.18,17.47,1146.43,38.17,1200,52.92,1200,52.92V0H0V33.68C142.6,81.52,297.28,93.91,447.27,69.5Z"
      fill={color}
    />
  </Box>
);

// Wave 5
export const Wave5: React.FC<WaveProps> = ({
  color = "#FFB6C1",
  sx,
  preserveAspectRatio = "xMidYMid meet",
}) => (
  <Box
    component="svg"
    viewBox="0 0 500 150"
    preserveAspectRatio={preserveAspectRatio}
    sx={{ display: "block", width: "100%", ...sx }}
  >
    <path
      d="M-0.84,108.05 C136.29,234.38 301.63,-67.59 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"
      fill={color}
    />
  </Box>
);

// Wave 6
export const Wave6: React.FC<WaveProps> = ({
  color = "#fff",
  sx,
  preserveAspectRatio = "xMidYMid meet",
}) => (
  <Box
    component="svg"
    viewBox="0 0 1440 202.7"
    preserveAspectRatio={preserveAspectRatio}
    sx={{ display: "block", width: "100%", ...sx }}
  >
    <path
      d="M0,32,48,74.7C96,117,192,203,288,202.7c96,.3,192-85.7,288-101.4C672,85,768,139,864,138.7c96,.3,192-53.7,288-64C1248,64,1344,96,1392,112l48,16V0H0Z"
      fill={color}
    />
  </Box>
);

// Wave 7
export const Wave7: React.FC<WaveProps> = ({
  color,
  sx,
  preserveAspectRatio = "xMidYMid meet",
}) => {
  const themeLightPink = useLightPink();
  const fill = color ?? themeLightPink;
  return (
    <Box
      component="svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 55 1440 160"
      preserveAspectRatio={preserveAspectRatio}
      sx={{ display: "block", width: "100%", ...sx }}
    >
      <path
        fill={fill}
        fillOpacity="1"
        d="M0,192L120,165.3C240,139,480,85,720,69.3C960,53,1200,75,1320,85.3L1440,96L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"
      />
    </Box>
  );
};

// Wave 8
export const Wave8: React.FC<WaveProps> = ({
  color = "#fff",
  sx,
  preserveAspectRatio = "xMidYMid meet",
}) => (
  <Box
    component="svg"
    viewBox="0 0 1440 202.7"
    preserveAspectRatio={preserveAspectRatio}
    sx={{ display: "block", width: "100%", ...sx }}
  >
    <path
      d="M0,32,48,74.7C96,117,192,203,288,202.7c96,.3,192-85.7,288-101.4C672,85,768,139,864,138.7c96,.3,192-53.7,288-64C1248,64,1344,96,1392,112l48,16V0H0Z"
      fill={color}
    />
  </Box>
);

// Wave 9
export const Wave9: React.FC<WaveProps> = ({ color, sx }) => {
  const themeLightPink = useLightPink();
  const fill = color ?? themeLightPink;
  return (
    <Box
      component="svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 250"
      sx={{ display: "block", width: "100%", ...sx }}
    >
      <path
        fill={fill}
        fillOpacity="1"
        d="M0,64L48,69.3C96,75,192,85,288,112C384,139,480,181,576,192C672,203,768,181,864,176C960,171,1056,181,1152,181.3C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
      />
    </Box>
  );
};

// Wave 10
export const Wave10: React.FC<WaveProps> = ({ color = "#fff", sx }) => (
  <Box
    component="svg"
    viewBox="0 0 1440 103.91"
    sx={{ display: "block", width: "100%", ...sx }}
  >
    <path
      d="M0,96l80-5.3C160,85,320,75,480,58.7,640,43,800,21,960,10.7,1120,0,1280,0,1360,0h80V103.91L0,103.16Z"
      fill={color}
    />
  </Box>
);

// Wave 11
export const Wave11: React.FC<WaveProps> = ({ color, sx }) => {
  const themeLightPink = useLightPink();
  const fill = color ?? themeLightPink;
  return (
    <Box
      component="svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 320"
      sx={{ display: "block", width: "100%", ...sx }}
    >
      <path
        fill={fill}
        fillOpacity="1"
        d="M0,160L80,138.7C160,117,320,75,480,69.3C640,64,800,96,960,96C1120,96,1280,64,1360,48L1440,32L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
      />
    </Box>
  );
};

export default Wave1;
