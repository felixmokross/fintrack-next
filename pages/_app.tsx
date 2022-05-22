import "../styles/globals.css";
import type { AppProps } from "next/app";
import Link from "next/link";
import { cn } from "../lib/classnames";
import "../lib/dayjs.init";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="grid h-screen grid-rows-layout">
      <nav className="border-b border-gray-300 dark:border-gray-500">
        <div className="mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex h-16 flex-1 items-center justify-center sm:items-stretch sm:justify-between">
            <div className="hidden sm:flex sm:space-x-8">
              <Link href="#">
                <a
                  className={cn(
                    "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium",
                    "border-blue-500 text-blue-500 dark:border-blue-400 dark:text-blue-400"
                  )}
                >
                  Accounts
                </a>
              </Link>
            </div>

            <div className="flex items-center sm:space-x-8">
              {/* <ThemeSettingSwitcher />
              <LogoutButton /> */}
            </div>
          </div>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
