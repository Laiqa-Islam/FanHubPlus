import { useEffect } from "react";
import {
  Link,
  isRouteErrorResponse,
  useNavigate,
  useLocation,
  useRouteError,
} from "react-router";

import { Button } from "@/components/ui/button";
import NotFound from "@/pages/not-found";

/**
 * Error boundary for every page. A 404 from a loader renders the Channel 404
 * page; anything else gets "Signal lost" with a retry, inside the site chrome.
 */
export default function RouteError() {
  const error = useRouteError();
  const navigate = useNavigate();
  const location = useLocation();

  const notFound = isRouteErrorResponse(error) && error.status === 404;

  useEffect(() => {
    if (!notFound) console.error("[route error]", error);
  }, [error, notFound]);

  if (notFound) return <NotFound />;

  // Re-running the current URL re-runs its loaders — the "reset" the App
  // Router's error boundary offered.
  const reset = () =>
    navigate(`${location.pathname}${location.search}`, { replace: true });

  return (
    <div className="grid min-h-[70vh] place-items-center px-5">
      <div className="max-w-md text-center">
        <p className="mark mb-4">Signal lost</p>
        <h1 className="font-display text-[clamp(1.8rem,4.5vw,2.6rem)]">
          This page didn&apos;t come through
        </h1>
        <p className="mt-4 text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
          Something broke while loading. Try again — if it keeps happening, the
          database connection is the usual culprit.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button asChild variant="outline">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
