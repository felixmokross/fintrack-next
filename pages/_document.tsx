import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-200">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
