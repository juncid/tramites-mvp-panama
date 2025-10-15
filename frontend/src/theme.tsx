import {
  CssBaseline,
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material";
import React from "react";

const appTheme = createTheme({
  palette: {
    primary: {
      main: "#0e5fa6",
    },
    secondary: {
      main: "#788093",
    },
    background: {
      default: "#ffffff",
      paper: "#f1f3f4",
    },
    text: {
      primary: "#333333",
      secondary: "#788093",
    },
    divider: "#333333",
  },
  typography: {
    fontFamily: "'Roboto', 'Roboto Flex', Helvetica, Arial, sans-serif",
    h1: {
      fontFamily: "'Roboto Flex', Helvetica, Arial, sans-serif",
      fontSize: "64px",
      fontWeight: 700,
      lineHeight: "70.4px",
      letterSpacing: "0",
    },
    h2: {
      fontFamily: "'Roboto Flex', Helvetica, Arial, sans-serif",
      fontSize: "48px",
      fontWeight: 700,
      lineHeight: "72px",
      letterSpacing: "0",
    },
    body1: {
      fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
      fontSize: "16px",
      fontWeight: 400,
      lineHeight: "24px",
      letterSpacing: "0",
    },
    body2: {
      fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
      fontSize: "14px",
      fontWeight: 400,
      lineHeight: "24px",
      letterSpacing: "0",
    },
    subtitle1: {
      fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
      fontSize: "16px",
      fontWeight: 500,
      lineHeight: "24px",
      letterSpacing: "0",
    },
    subtitle2: {
      fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
      fontSize: "14px",
      fontWeight: 300,
      lineHeight: "21px",
      letterSpacing: "0",
    },
    button: {
      fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
      fontSize: "16px",
      fontWeight: 400,
      lineHeight: "24px",
      letterSpacing: "0",
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "4px",
          padding: "8px 16px",
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        outlined: {
          borderWidth: "1px",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
        },
      },
    },
  },
});

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <MuiThemeProvider theme={appTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider;