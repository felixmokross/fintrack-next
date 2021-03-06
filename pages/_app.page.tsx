import "../styles/globals.css";
import type { AppProps } from "next/app";
import Link, { LinkProps } from "next/link";
import { cn } from "./shared/classnames";
import "./dayjs.init";
import { UserProvider } from "@auth0/nextjs-auth0";
import { useRouter } from "next/router";
import { PropsWithChildren } from "react";
import { LoadingIndicator } from "./loading-indicator";
import { RefDataProvider } from "./ref-data-context";
import { Button, ButtonVariant } from "./shared/button";
import Head from "next/head";
import { getTitle } from "./shared/util";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <RefDataProvider>
        <Head>
          <title>{getTitle()}</title>
        </Head>
        <div className="grid h-screen grid-rows-layout">
          <nav className="border-b border-gray-300 dark:border-gray-500">
            <div className="mx-auto px-2 sm:px-6 lg:px-8">
              <div className="flex h-16 flex-1 items-center justify-center sm:items-stretch sm:justify-between">
                <div className="hidden sm:flex sm:space-x-8">
                  <NavLink href="/balances">Balances</NavLink>
                  <NavLink href="/periods">Periods</NavLink>
                  <NavLink href="/allocation">Allocation</NavLink>
                  <NavLink href="/accounts">Accounts</NavLink>
                  <LoadingIndicator />
                </div>

                <div className="flex items-center sm:space-x-8">
                  <LogoutButton />
                </div>
              </div>
            </div>
          </nav>
          <Component {...pageProps} />
        </div>
      </RefDataProvider>
    </UserProvider>
  );
}

export default MyApp;

function NavLink({ children, href, ...props }: PropsWithChildren<LinkProps>) {
  const { pathname } = useRouter();
  return (
    <Link {...props} href={href}>
      <a
        className={cn(
          "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium",
          pathname.startsWith(href.toString())
            ? "border-blue-500 text-blue-500 dark:border-blue-400 dark:text-blue-400"
            : "border-transparent text-gray-700 hover:border-gray-400 dark:text-gray-200 dark:hover:border-gray-200"
        )}
      >
        {children}
      </a>
    </Link>
  );
}

function LogoutButton() {
  return (
    <Button
      variant={ButtonVariant.SECONDARY}
      onClick={() => (location.href = "/api/auth/logout")}
    >
      Logout
    </Button>
  );
}
