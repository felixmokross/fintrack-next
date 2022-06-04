import { render, screen } from "@testing-library/react";
import { PropsWithChildren } from "react";
import {
  buildAccount,
  buildAccountDetail,
  buildCurrency,
  buildCurrencyAccountUnit,
  buildDayLedgerLine,
  buildDeposit,
} from "../../../test-utils/builders";
import { RefDataContext } from "../../ref-data-context";
import { AccountCategoryType } from "../../shared/account-categories/enums";
import { DayLedgerLineDto } from "../../shared/day-ledgers/dtos";
import { RefDataDto } from "../../shared/ref-data/dtos";
import { DayLedgerLineRow } from "./day-ledger-line-row";

test("shows the ledger line value", async () => {
  const ledgerLine = buildDayLedgerLine({
    bookings: [buildDeposit({ accountId: "my-counter-account" })],
    value: "-1030.8",
  });

  renderWith(ledgerLine, {
    accounts: {
      "my-counter-account": buildAccount({
        unit: buildCurrencyAccountUnit("CHF"),
      }),
    },
    currencies: { CHF: buildCurrency() },
  });

  expect(await screen.findByText("-1’030.80")).toBeInTheDocument();
});

test("shows a positive ledger line value with sign", async () => {
  const ledgerLine = buildDayLedgerLine({
    bookings: [buildDeposit({ accountId: "my-counter-account" })],
    value: "1030.8",
  });

  renderWith(ledgerLine, {
    accounts: { "my-counter-account": buildAccount() },
    currencies: { CHF: buildCurrency() },
  });

  // opt+shift+! --> ’
  expect(await screen.findByText("+1’030.80")).toBeInTheDocument();
});

function renderWith(
  ledgerLine: DayLedgerLineDto,
  refData: Partial<RefDataDto>
): void {
  render(
    <TestRefDataProvider refData={refData}>
      <table>
        <tbody>
          <DayLedgerLineRow
            ledgerLine={ledgerLine}
            accountId={buildAccountDetail()._id}
            accountCategoryType={AccountCategoryType.ASSET}
            // accountId={accountId || buildAccountDetail()._id}
            // accountCategoryType={accountCategoryType}
            accountUnit={buildCurrencyAccountUnit("CHF")}
          />
        </tbody>
      </table>
    </TestRefDataProvider>
  );
}

function TestRefDataProvider({
  children,
  refData,
}: PropsWithChildren<TestRefDataProviderProps>) {
  return (
    <RefDataContext.Provider value={refData as RefDataDto}>
      {children}
    </RefDataContext.Provider>
  );
}

type TestRefDataProviderProps = {
  refData: Partial<RefDataDto>;
};
