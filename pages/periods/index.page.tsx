import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { withRedirect } from "../shared/redirect";

export default withRedirect("/periods/months/3m/total-pl");
export const getServerSideProps = withPageAuthRequired();
