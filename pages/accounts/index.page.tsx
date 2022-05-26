import type { NextPage } from "next";
import { Account, AccountCategory } from "../../lib/documents.server";
import { getDb } from "../../lib/mongodb.server";
import { groupBy } from "lodash";
import { toAccountCategoryDto, toAccountDto } from "../../lib/mappings.server";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AccountDetailLayout, PageLayout } from "./layouts";
import { AccountCategoryWithAccountsDto } from "./types";
import { AccountList } from "./account-list";

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
    const accountsByCategoryId = groupBy(
      (
        await db
          .collection<Account>("accounts")
          .find()
          .sort({ name: 1, unit: 1, "unit.currency": 1 })
          .toArray()
      ).map(toAccountDto),
      (ac) => ac.categoryId
    );

    return {
      props: {
        accountCategories: (
          await db
            .collection<AccountCategory>("accountCategories")
            .find()
            .sort({ order: 1 })
            .toArray()
        )
          .map(toAccountCategoryDto)
          .map((ac) => ({
            ...ac,
          }))
          .map((ac) => ({
            ...ac,
            accounts: accountsByCategoryId[ac._id],
          })),
      },
    };
  },
});
