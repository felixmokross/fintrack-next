import { createContext, PropsWithChildren, useContext } from "react";
import useSWR from "swr";
import api from "./shared/api";
import { RefDataDto } from "./shared/ref-data/dtos";

export function RefDataProvider({ children }: PropsWithChildren<{}>) {
  const { data } = useSWR<RefDataDto>("/api/ref-data", api);

  return (
    <RefDataContext.Provider value={data}>{children}</RefDataContext.Provider>
  );
}

const RefDataContext = createContext<RefDataDto | undefined | null>(null);

export function useRefData(): Partial<RefDataDto> {
  const refData = useContext(RefDataContext);
  if (refData === null) throw new Error("Must be used in RefDataProvider!");

  return refData || {};
}
