import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { NextPage } from "next";
import { AccountDetailDto } from "../../lib/dtos";
import { getDb } from "../../lib/mongodb.server";
import { AccountDetail } from "./account-detail";
import { AccountList } from "./account-list";
import {
  getAccountCategoriesWithAccounts,
  getAccountDetail,
} from "./data-loading.server";
import { AccountDetailLayout, PageLayout } from "./layouts";
import { AccountCategoryWithAccountsDto } from "./types";

const AccountsDetailPage: NextPage<
  AccountsDetailPageProps,
  AccountsDetailPageParams
> = ({ accountCategories, account }) => {
  return (
    <PageLayout>
      <AccountList accountCategories={accountCategories} />
      <AccountDetailLayout>
        <AccountDetail account={account} />
      </AccountDetailLayout>
    </PageLayout>
  );
};

export default AccountsDetailPage;

export type AccountsDetailPageProps = {
  accountCategories: AccountCategoryWithAccountsDto[];
  account: AccountDetailDto;
};

export type AccountsDetailPageParams = {
  accountId: string;
};

export const getServerSideProps = withPageAuthRequired<
  AccountsDetailPageProps,
  AccountsDetailPageParams
>({
  getServerSideProps: async ({ params }) => {
    if (!params) throw new Error("No params");

    const db = await getDb();

    const [account, accountCategories] = await Promise.all([
      getAccountDetail(db, params.accountId),
      getAccountCategoriesWithAccounts(db),
    ]);

    if (!account) return { notFound: true };

    return {
      props: {
        accountCategories,
        account,
      },
    };
  },
});
