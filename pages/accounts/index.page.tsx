import type { NextPage } from "next";
import { getDb } from "../../lib/mongodb.server";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AccountDetailLayout, PageLayout } from "./layouts";
import { AccountCategoryWithAccountsDto } from "./types";
import { AccountList } from "./account-list";
import { getAccountCategoriesWithAccounts } from "./data-loading.server";

const AccountsPage: NextPage<AccountsPageProps> = ({ accountCategories }) => {
  return (
    <PageLayout>
      <AccountList accountCategories={accountCategories} />
      <AccountDetailLayout />
    </PageLayout>
  );
};

export default AccountsPage;

export type AccountsPageProps = {
  accountCategories: AccountCategoryWithAccountsDto[];
};

export const getServerSideProps = withPageAuthRequired<AccountsPageProps>({
  getServerSideProps: async () => {
    const db = await getDb();

    return {
      props: {
        accountCategories: await getAccountCategoriesWithAccounts(db),
      },
    };
  },
});
