import { groupBy } from "lodash";
import { Db } from "mongodb";
import { Account, AccountCategory } from "../../../lib/documents.server";
import {
  toAccountCategoryDto,
  toAccountDto,
} from "../../../lib/mappings.server";
import { AccountCategoryWithAccountsDto } from "./dtos";

export async function getAccountCategoriesWithAccounts(
  db: Db
): Promise<AccountCategoryWithAccountsDto[]> {
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

  return (
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
    }));
}
