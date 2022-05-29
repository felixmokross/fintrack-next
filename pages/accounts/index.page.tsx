import type { NextPage } from "next";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AccountDetailLayout, PageLayout } from "./shared/layouts";
import { AccountList } from "./shared/account-list";
import { getAccountCategoriesWithAccounts } from "./shared/data-loading.server";
import { AccountCategoryWithAccountsDto } from "./shared/dtos";
import { getTenantDb } from "../shared/util.server";

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
  getServerSideProps: async ({ req, res }) => {
    const db = await getTenantDb(req, res);

    return {
      props: { accountCategories: await getAccountCategoriesWithAccounts(db) },
    };
  },
});
