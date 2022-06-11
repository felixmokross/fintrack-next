import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { withRedirect } from "../shared/redirect";

export default withRedirect("/balances/months/3m/net-worth");
export const getServerSideProps = withPageAuthRequired();
