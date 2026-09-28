import { useMemo } from "react";
import {
  useLocation,
  useNavigate,
  useRevalidator,
  useSearchParams as useRouterSearchParams,
} from "react-router";

/**
 * Small navigation surface over React Router, in the shape the components
 * were written against: `router.push/replace/back/refresh`, the current
 * pathname, and a read-only view of the query string.
 */
export function useRouter() {
  const navigate = useNavigate();
  const revalidator = useRevalidator();

  return useMemo(
    () => ({
      push: (to, options = {}) =>
        navigate(to, { preventScrollReset: options.scroll === false }),
      replace: (to, options = {}) =>
        navigate(to, { replace: true, preventScrollReset: options.scroll === false }),
      back: () => navigate(-1),
      forward: () => navigate(1),
      // Re-runs the route loaders, which is what refreshing server data means
      // in a client-rendered app.
      refresh: () => revalidator.revalidate(),
    }),
    [navigate, revalidator],
  );
}

export function usePathname() {
  return useLocation().pathname;
}

export function useSearchParams() {
  return useRouterSearchParams()[0];
}
