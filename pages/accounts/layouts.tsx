import { PropsWithChildren } from "react";

export function PageLayout({ children }: PropsWithChildren<{}>) {
  return (
    <div className="md:grid-cols-accounts-md lg:grid-cols-accounts-lg xl:grid-cols-accounts-xl 2xl:grid-cols-accounts-2xl grid grid-rows-accounts md:grid-rows-none">
      {children}
    </div>
  );
}

export function AccountDetailLayout({ children }: PropsWithChildren<{}>) {
  return (
    <section
      aria-label="Account Detail"
      className="flex flex-col overflow-hidden"
    >
      {children}
    </section>
  );
}
