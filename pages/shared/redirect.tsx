import { useRouter } from "next/router";
import { useEffect } from "react";

export function withRedirect(url: string) {
  return function Redirect() {
    const { replace } = useRouter();
    useEffect(() => {
      replace(url);
    }, [replace]);
    return null;
  };
}
