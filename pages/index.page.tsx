import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { withRedirect } from "./shared/redirect";

export default withRedirect("/accounts");
export const getServerSideProps = withPageAuthRequired();
