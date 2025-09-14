import { createTheme } from "@mui/material/styles";

// Module augmentation: add custom Neram palette keys to MUI typings
declare module "@mui/material/styles" {
  interface Palette {
    neramPurple: Palette["primary"];
    highlight: Palette["primary"];
    white: Palette["primary"];
    // Newly added grouped custom colors
    custom: {
      black900: string;
      pink: string;
      yellow: string;
      violet: string;
      violetOpacity: string;
      lightViolet: string;
      lightPink: string;
      lightGreyOpacity: string;
      green: string;
      chatGreen: string;
    };
    // Gradient tokens exposed under palette.gradients
    gradients: {
      neram: string;
      yellowGreen: string;
      blueViolet: string;
      pinkRed: string;
      yellowOrange: string;
      redOrange: string;
    };
  }
  interface PaletteOptions {
    neramPurple?: PaletteOptions["primary"];
    highlight?: PaletteOptions["primary"];
    white?: PaletteOptions["primary"];
    custom?: Partial<Palette["custom"]>;
    gradients?: Partial<Palette["gradients"]>;
  }
  // Existing custom gradient helpers at the root theme
  interface Theme {
    gradients: {
      // Brand gradient; pass an angle (deg). Defaults to 45.
      brand: (angle?: number) => string;
    };
  }
  interface ThemeOptions {
    gradients?: {
      brand?: (angle?: number) => string;
    };
  }
}

// Optional: allow using color="neramPurple" on Button and Chip, etc.
declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    neramPurple: true;
    highlight: true;
    white: true;
  }
}
declare module "@mui/material/Chip" {
  interface ChipPropsColorOverrides {
    neramPurple: true;
    highlight: true;
    white: true;
  }
}

const theme = createTheme({
  palette: {
    // Brand primary remains existing Neram pink
    primary: { main: "#FF105E" },
    neramPurple: { main: "#88206D", light: "#C18DB3" },
    highlight: { main: "#FFFB01" },
    white: { main: "#FFFFFF" },
    // Updated greys
    grey: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#eee",
      300: "#e0e0e0",
      400: "#bdbdbd",
      500: "#9e9e9e",
      600: "#757575",
      700: "#616161",
      800: "#424242",
      900: "#212121",
    },
    // Custom color tokens
    custom: {
      black900: "#454545",
      pink: "#ff105e",
      yellow: "#fffb01",
      violet: "#88206d",
      violetOpacity: "#88206d80",
      lightViolet: "#cb5dae",
      lightPink: "#fdeffd",
      lightGreyOpacity: "#a9a9a920",
      green: "#0dfd14",
      chatGreen: "#e9ffc5",
    },
    // Gradient tokens (string values)
    gradients: {
      neram: "linear-gradient(111.38deg, #2b2d4e 1.56%, #e1148b 101.35%)",
      yellowGreen: "linear-gradient(45deg, #f4d03f, #16a085)",
      blueViolet: "linear-gradient(45deg, #21d4fd, #b721ff)",
      pinkRed: "linear-gradient(45deg, #f0f, #e90600)",
      yellowOrange: "linear-gradient(90deg, #ffce31, #ff3d00)",
      redOrange: "linear-gradient(87.75deg, #ff1414 -56.47%, #ff9314 92.94%)",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          // Use Title Case by default (first letter of each word uppercase)
          textTransform: "capitalize",
        },
      },
    },
  },
  // Brand gradients
  gradients: {
    // Return the neram palette gradient (angle param kept for backwards compatibility but ignored)
    brand: () => "linear-gradient(111.38deg, #2b2d4e 1.56%, #e1148b 101.35%)",
  },
});

export default theme;
