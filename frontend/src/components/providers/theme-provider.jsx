import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

/**
 * Display and accessibility preferences.
 *
 * Neon Oni was built as a single dark theme and the light/dark control was
 * removed with it, which dropped SRS FR-12's colour-scheme clause. The
 * control is back, on request, so that clause holds again.
 *
 * Three choices rather than two. A bare on/off switch cannot express "follow
 * my machine", which is the setting most people actually want and the only
 * one that reacts when their machine changes at sunset. `theme` is what the
 * member picked; `resolvedTheme` is what is on screen after "system" has
 * been worked out.
 *
 * The default is dark. The site's identity is a lit sign on a night ground,
 * so a visitor who has expressed no preference gets that, and light is an
 * opt-in rather than something a laptop's daytime setting imposes.
 *
 * All three preferences are held in localStorage so a visitor's choice
 * survives reloads; signed-in users also have them persisted to their
 * profile.
 */

const ThemeContext = createContext(null);

export const FONT_KEY = "fanhub:font-scale";
export const MOTION_KEY = "fanhub:reduced-motion";
export const THEME_KEY = "fanhub:theme";

export function ThemeProvider({
  children,
  initialFontScale = 100,
  initialReducedMotion = false,
}) {
  const [theme, setThemeState] = useState("dark");
  const [resolvedTheme, setResolvedTheme] = useState("dark");
  const [fontScale, setFontScaleState] = useState(initialFontScale);
  const [reducedMotion, setReducedMotionState] = useState(initialReducedMotion);

  // Hydrate from localStorage, which the blocking script already read.
  useEffect(() => {
    const storedScale =
      Number(localStorage.getItem(FONT_KEY)) || initialFontScale;
    const storedMotion =
      localStorage.getItem(MOTION_KEY) === "true" || initialReducedMotion;
    const storedTheme = localStorage.getItem(THEME_KEY);

    setFontScaleState(storedScale);
    setReducedMotionState(storedMotion);
    if (
      storedTheme === "light" ||
      storedTheme === "dark" ||
      storedTheme === "system"
    ) {
      setThemeState(storedTheme);
    }
  }, [initialFontScale, initialReducedMotion]);

  // Apply the choice, and keep following the machine while "system" is set.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: light)");

    const apply = () => {
      const next =
        theme === "system" ? (media.matches ? "light" : "dark") : theme;
      document.documentElement.dataset.theme = next;
      setResolvedTheme(next);
    };

    apply();
    if (theme !== "system") return;

    // Only listen while following the machine, so a member who has chosen a
    // side does not get flipped out from under them at sunset.
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty("--font-scale", `${fontScale}%`);
  }, [fontScale]);

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(reducedMotion);
  }, [reducedMotion]);

  const setTheme = useCallback((value) => {
    setThemeState(value);
    localStorage.setItem(THEME_KEY, value);
  }, []);

  const setFontScale = useCallback((scale) => {
    const clamped = Math.min(130, Math.max(90, scale));
    setFontScaleState(clamped);
    localStorage.setItem(FONT_KEY, String(clamped));
  }, []);

  const setReducedMotion = useCallback((value) => {
    setReducedMotionState(value);
    localStorage.setItem(MOTION_KEY, String(value));
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        resolvedTheme,
        fontScale,
        setFontScale,
        reducedMotion,
        setReducedMotion,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context)
    throw new Error("useTheme must be used inside <ThemeProvider>.");
  return context;
}

/**
 * Runs before first paint to stamp the colour scheme, font scale and motion
 * preference onto <html>.
 *
 * The colour scheme has to be resolved here rather than in React: the
 * stylesheet's default ground is dark, so a member who chose light would
 * otherwise get a dark flash on every navigation before hydration lands.
 */
export const themeScript = `
(function(){
  try {
    var d = document.documentElement;
    d.classList.remove('no-js');
    var t = localStorage.getItem('${THEME_KEY}') || 'dark';
    if (t === 'system') {
      t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    d.dataset.theme = t === 'light' ? 'light' : 'dark';
    var f = localStorage.getItem('${FONT_KEY}');
    if (f) d.style.setProperty('--font-scale', f + '%');
    d.dataset.reducedMotion = localStorage.getItem('${MOTION_KEY}') === 'true';
  } catch (e) {}
})();
`;
