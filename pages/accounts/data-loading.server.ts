import { groupBy } from "lodash";
import { Db, ObjectId } from "mongodb";
import { Account, AccountCategory } from "../../lib/documents.server";
import { AccountDetailDto } from "../../lib/dtos";
import {
  toAccountCategoryDto,
  toAccountDetailDto,
  toAccountDto,
} from "../../lib/mappings.server";
import { serializeId } from "../../lib/serialization.server";
import { AccountCategoryWithAccountsDto } from "./types";

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

export async function getAccountDetail(
  db: Db,
  accountId: string
): Promise<AccountDetailDto | null> {
  const account = await db
    .collection<Account>("accounts")
    .findOne({ _id: serializeId(accountId) });

  return account ? toAccountDetailDto(account) : null;
}
