import { createContext, PropsWithChildren, useContext } from "react";
import useSWR, { useSWRConfig } from "swr";
import api from "./shared/api";
import { RefDataDto } from "./shared/ref-data/dtos";

export function RefDataProvider({ children }: PropsWithChildren<{}>) {
  const { data } = useSWR<RefDataDto>("/api/ref-data", api);
  const { mutate } = useSWRConfig();

  return (
    <RefDataContext.Provider value={{ ...data, invalidateRefData }}>
      {children}
    </RefDataContext.Provider>
  );

  async function invalidateRefData() {
    await mutate("/api/ref-data");
  }
}

export const RefDataContext = createContext<RefDataContextValue | undefined>(
  undefined
);

export function useRefData(): RefDataContextValue {
  const refData = useContext(RefDataContext);
  if (!refData) throw new Error("Must be used in RefDataProvider!");

  return refData;
}

export type RefDataContextValue = Partial<RefDataDto> & {
  invalidateRefData: () => Promise<void>;
};
