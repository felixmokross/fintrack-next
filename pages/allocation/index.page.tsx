import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { withRedirect } from "../shared/redirect";

export default withRedirect("/allocation/begin-of-month");
export const getServerSideProps = withPageAuthRequired();
