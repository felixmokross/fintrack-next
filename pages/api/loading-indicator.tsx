import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export function LoadingIndicator() {
  const { events } = useRouter();
  const [loading, setIsLoading] = useState(false);
  useEffect(() => {
    events.on("routeChangeStart", handleRouteChangeStart);
    events.on("routeChangeComplete", handleRouteChangeComplete);

    return () => {
      events.off("routeChangeStart", handleRouteChangeStart);
      events.off("routeChangeComplete", handleRouteChangeComplete);
    };

    function handleRouteChangeStart() {
      setIsLoading(true);
    }

    function handleRouteChangeComplete() {
      setIsLoading(false);
    }
  }, [events]);
  return (
    <div className="flex animate-pulse items-center text-sm font-medium text-gray-500 dark:text-gray-400">
      {loading && <>Loading…</>}
    </div>
  );
}
