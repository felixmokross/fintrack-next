import { useRouter } from "next/router";

export function useReload() {
  const { replace } = useRouter();
  return () => replace(`${location.pathname}${location.search}`);
}
