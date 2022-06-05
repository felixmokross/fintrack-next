import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export function LoadingIndicator() {
  const { events } = useRouter();
  const [loadingIndicatorVisible, setLoadingIndicatorVisible] = useState(false);
  useEffect(() => {
    let timeout: number | undefined = undefined;
    let routeLoading = false;
    events.on("routeChangeStart", handleRouteChangeStart);
    events.on("routeChangeComplete", handleRouteChangeComplete);

    return () => {
      events.off("routeChangeStart", handleRouteChangeStart);
      events.off("routeChangeComplete", handleRouteChangeComplete);

      if (timeout !== undefined) window.clearTimeout(timeout);
    };

    function handleRouteChangeStart() {
      routeLoading = true;

      timeout = window.setTimeout(() => {
        if (routeLoading) {
          setLoadingIndicatorVisible(true);
        }
      }, 300);
    }

    function handleRouteChangeComplete() {
      routeLoading = false;
      setLoadingIndicatorVisible(false);
    }
  }, [events]);
  return (
    <div className="flex animate-pulse items-center text-sm font-medium text-gray-500 dark:text-gray-400">
      {loadingIndicatorVisible && <>Loading…</>}
    </div>
  );
}
