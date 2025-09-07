import { initialsForName } from "../ProfileMenu";
import useAvatarColor from "../useAvatarColor";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React from "react";
import { renderHook } from "@testing-library/react-hooks";

describe("initialsForName", () => {
  it("returns first two letters for single name", () => {
    expect(initialsForName("Subramanya")).toBe("SU");
  });

  it("returns two initials for two-word name", () => {
    expect(initialsForName("John Doe")).toBe("JD");
  });

  it("handles empty or undefined", () => {
    expect(initialsForName("")).toBe("");
    expect(initialsForName(undefined)).toBe("");
  });
});

describe("useAvatarColor", () => {
  it("returns a deterministic color for a given name", () => {
    const theme = createTheme();
    const wrapper = ({ children }: any) => (
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    );
    const { result, rerender } = renderHook(() => useAvatarColor("Alice"), {
      wrapper,
    });
    const first = result.current;
    // rerender and ensure same value
    rerender();
    expect(result.current).toBe(first);
  });
});
