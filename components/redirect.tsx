import { useRouter } from "next/router";
import { useLayoutEffect } from "react";

export function withRedirect(url: string) {
  return function Redirect() {
    const { replace } = useRouter();
    useLayoutEffect(() => {
      replace(url);
    }, [replace]);
    return null;
  };
}
