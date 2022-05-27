import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { NextPage } from "next";
import { AccountDetailDto } from "../../../lib/dtos";
import { getDb } from "../../../lib/mongodb.server";
import { AccountDetail } from "./account-detail";
import { AccountList } from "../shared/account-list";
import { getAccountCategoriesWithAccounts } from "../shared/data-loading.server";
import { AccountDetailLayout, PageLayout } from "../shared/layouts";
import { AccountCategoryWithAccountsDto } from "../shared/dtos";
import { Db } from "mongodb";
import { Account } from "../../../lib/documents.server";
import { serializeId } from "../../../lib/serialization.server";
import { toAccountDetailDto } from "../../../lib/mappings.server";

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

async function getAccountDetail(
  db: Db,
  accountId: string
): Promise<AccountDetailDto | null> {
  const account = await db
    .collection<Account>("accounts")
    .findOne({ _id: serializeId(accountId) });

  return account ? toAccountDetailDto(account) : null;
}
