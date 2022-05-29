import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { NextPage } from "next";
import { AccountDetail } from "./account-detail";
import { AccountList } from "../shared/account-list";
import { getAccountCategoriesWithAccounts } from "../shared/data-loading.server";
import { AccountDetailLayout, PageLayout } from "../shared/layouts";
import { AccountCategoryWithAccountsDto } from "../shared/dtos";
import { Db } from "mongodb";
import { Account, toAccountUnitDto } from "../shared/documents.server";
import { serializeId } from "../../shared/serialization.server";
import { ensure } from "../../shared/util";
import { AccountDetailDto } from "./dtos";
import { DayLedgerDto, DayLedgerLineDto } from "../../shared/day-ledgers/dtos";
import {
  DayLedger,
  DayLedgerLine,
} from "../../shared/day-ledgers/documents.server";
import { BookingType } from "../../shared/transactions/enums";
import { Booking } from "../../shared/transactions/documents.server";
import {
  AppreciationDto,
  BookingDto,
  DepreciationDto,
} from "../../shared/transactions/dtos";
import { getTenantDb } from "../../shared/util.server";

const AccountsDetailPage: NextPage<
  AccountsDetailPageProps,
  AccountsDetailPageParams
> = ({ accountCategories, account, dayLedgers }) => {
  return (
    <PageLayout>
      <AccountList accountCategories={accountCategories} />
      <AccountDetailLayout>
        <AccountDetail account={account} dayLedgers={dayLedgers} />
      </AccountDetailLayout>
    </PageLayout>
  );
};

export default AccountsDetailPage;

export type AccountsDetailPageProps = {
  accountCategories: AccountCategoryWithAccountsDto[];
  account: AccountDetailDto;
  dayLedgers: DayLedgerDto[];
};

export type AccountsDetailPageParams = {
  accountId: string;
};

export const getServerSideProps = withPageAuthRequired<
  AccountsDetailPageProps,
  AccountsDetailPageParams
>({
  getServerSideProps: async ({ req, res, params }) => {
    if (!params) throw new Error("No params");

    const db = await getTenantDb(req, res);

    const [account, accountCategories, dayLedgers] = await Promise.all([
      getAccountDetail(db, params.accountId),
      getAccountCategoriesWithAccounts(db),
      getDayLedgers(db, params.accountId),
    ]);

    if (!account) return { notFound: true };

    return {
      props: {
        accountCategories,
        account,
        dayLedgers,
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

async function getDayLedgers(
  db: Db,
  accountId: string
): Promise<DayLedgerDto[]> {
  return (
    await db
      .collection<DayLedger>("dayLedgers")
      .find({
        "_id.accountId": serializeId(accountId),
        lines: { $ne: [] },
      })
      .sort({ "_id.date": -1 })
      .toArray()
  ).map(toDayLedgerDto);
}

function toAccountDetailDto(account: Account): AccountDetailDto {
  return {
    _id: ensure(account._id).toHexString(),
    name: account.name,
    type: account.type,
    unit: toAccountUnitDto(account.unit),
    categoryId: account.categoryId.toHexString(),
    categoryType: account.categoryType,
    groupId: account.groupId?.toHexString() || null,
    isActive: account.isActive,
    openingBalance: account.openingBalance?.toString() || null,
    openingDate: account.openingDate?.toUTCString() || null,
    closingDate: account.closingDate?.toUTCString() || null,
  };
}

function toDayLedgerDto(dayLedger: DayLedger): DayLedgerDto {
  return {
    _id: {
      accountId: dayLedger._id.accountId.toHexString(),
      date: dayLedger._id.date.toUTCString(),
    },
    balance: dayLedger.balance.toString(),
    lines: dayLedger.lines.map(toDayLedgerLineDto),
  };
}

function toDayLedgerLineDto(dayLedgerLine: DayLedgerLine): DayLedgerLineDto {
  return {
    transactionId: dayLedgerLine.transactionId.toHexString(),
    note: dayLedgerLine.note,
    bookings: dayLedgerLine.bookings.map(toBookingDto),
    value: dayLedgerLine.value.toString(),
  };
}

function toBookingDto(booking: Booking): BookingDto {
  switch (booking.type) {
    case BookingType.CHARGE:
      return {
        accountId: booking.accountId.toHexString(),
        unit: toAccountUnitDto(booking.unit),
        amount: booking.amount.toString(),
        type: booking.type,
        note: booking.note || null,
      };
    case BookingType.DEPOSIT:
      return {
        accountId: booking.accountId.toHexString(),
        unit: toAccountUnitDto(booking.unit),
        amount: booking.amount.toString(),
        type: booking.type,
        note: booking.note || null,
      };
    case BookingType.INCOME:
      return {
        incomeCategoryId: booking.incomeCategoryId.toHexString(),
        currency: booking.currency,
        amount: booking.amount.toString(),
        type: booking.type,
        note: booking.note || null,
      };
    case BookingType.EXPENSE:
      return {
        expenseCategoryId: booking.expenseCategoryId.toHexString(),
        currency: booking.currency,
        amount: booking.amount.toString(),
        type: booking.type,
        note: booking.note || null,
      };
    case BookingType.APPRECIATION:
      return {
        amount: booking.amount.toString(),
        type: booking.type,
      } as AppreciationDto;
    case BookingType.DEPRECIATION:
      return {
        amount: booking.amount.toString(),
        type: booking.type,
      } as DepreciationDto;
  }
}
