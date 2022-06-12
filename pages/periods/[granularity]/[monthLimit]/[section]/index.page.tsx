import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import Head from "next/head";
import { getTitle } from "../../../../shared/util";

export default function PeriodsPage() {
  return (
    <>
      <Head>
        <title>{getTitle("Periods")}</title>
        <p>hello world</p>
      </Head>
    </>
  );
}
export const getServerSideProps = withPageAuthRequired<{}, {}>();
