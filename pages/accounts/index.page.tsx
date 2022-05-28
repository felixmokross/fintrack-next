import type { NextPage } from "next";
import { getDb } from "../shared/mongodb.server";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AccountDetailLayout, PageLayout } from "./shared/layouts";
import { AccountList } from "./shared/account-list";
import { getAccountCategoriesWithAccounts } from "./shared/data-loading.server";
import { AccountCategoryWithAccountsDto } from "./shared/dtos";

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
      props: { accountCategories: await getAccountCategoriesWithAccounts(db) },
    };
  },
});
