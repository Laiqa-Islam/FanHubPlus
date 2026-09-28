import {
  Outlet,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useNavigation,
  useRouteLoaderData,
} from "react-router";
import { ToastContainer } from "react-toastify";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AssistantWidget } from "@/components/chat/assistant-widget";
import { Loading } from "@/pages/loading";

/** Session data every page can read: `const { user } = useRootData()`. */
export function useRootData() {
  return useRouteLoaderData("root") ?? { user: null, assistantEnabled: false };
}

/**
 * The document shell: preferences, cart, header/footer, assistant, toasts.
 * While a navigation to a different page is loading, the page area shows the
 * channel-rail loading state (what `loading.tsx` did in the App Router).
 */
export function RootLayout() {
  const { user, assistantEnabled } = useLoaderData();
  const navigation = useNavigation();
  const location = useLocation();
  const switchingPage =
    navigation.state === "loading" &&
    navigation.location?.pathname !== location.pathname;

  return (
    <ThemeProvider
      initialFontScale={user?.preferences.fontScale ?? 100}
      initialReducedMotion={user?.preferences.reducedMotion ?? false}
    >
      <CartProvider>
        <div className="scan" aria-hidden />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-[var(--n1)] focus:px-5 focus:py-2.5 focus:font-mono focus:text-sm focus:font-semibold focus:uppercase focus:tracking-[0.12em] focus:text-[var(--void)]"
        >
          Skip to content
        </a>

        <SiteHeader user={user} />

        <main id="main" className="flex-1">
          {switchingPage ? <Loading /> : <Outlet />}
        </main>

        <SiteFooter />

        {/* The assistant is optional (SRS FR-4): with no API key configured
            the widget simply isn't rendered, rather than offering a control
            that cannot work. */}
        {assistantEnabled && <AssistantWidget />}

        <ToastContainer
          position="bottom-right"
          autoClose={4000}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="dark"
          toastClassName="!bg-[var(--paper-3)] !text-[var(--ink)]"
        />
        <ScrollRestoration />
      </CartProvider>
    </ThemeProvider>
  );
}
