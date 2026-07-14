import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { useWordMorph } from "./useWordMorph";

function HookHarness() {
  const { word, visible } = useWordMorph();
  return createElement(
    "div",
    { "data-testid": "word-morph" },
    `${word}-${visible ? "visible" : "hidden"}`,
  );
}

describe("useWordMorph", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("retourne le premier mot et l’état visible au montage", () => {
    render(createElement(HookHarness));

    expect(screen.getByTestId("word-morph")).toHaveTextContent(
      "tout-en-un-visible",
    );
  });

  it("masque puis change de mot après la séquence de timers", () => {
    render(createElement(HookHarness));

    act(() => {
      vi.advanceTimersByTime(2800);
    });
    expect(screen.getByTestId("word-morph")).toHaveTextContent(
      "tout-en-un-hidden",
    );

    act(() => {
      vi.advanceTimersByTime(350);
    });
    expect(screen.getByTestId("word-morph")).toHaveTextContent(
      "intelligente-visible",
    );
  });
});
