import { useFormikContext } from "formik";
import { useEffect, useMemo } from "react";
import { AccountDto } from "../../accounts/shared/dtos";
import { useRefData } from "../../ref-data-context";
import { Select } from "../forms/select";
import { ButtonSkeleton } from "../skeletons";
import { getCurrencies } from "./functions";
import { TransactionFormValues } from "./types";

export function CurrencySelect({ name }: CurrencySelectProps) {
  const { accounts } = useRefData();
  if (!accounts) return <ButtonSkeleton className="w-full" />;
  return <InnerCurrencySelect name={name} accounts={accounts} />;
}

export interface CurrencySelectProps {
  name: string;
}

function InnerCurrencySelect({ name, accounts }: InnerCurrencySelectProps) {
  const { values, setFieldValue } = useFormikContext<TransactionFormValues>();

  const currencies = useMemo(
    () => getCurrencies(values, accounts),
    [values, accounts]
  );
  useEffect(() => {
    if (currencies.length === 1) setFieldValue(name, currencies[0]);
  }, [name, currencies, setFieldValue]);

  return (
    <Select
      showEmptyOption={true}
      name={name}
      title="Currency"
      disabled={currencies.length <= 1}
    >
      {currencies.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </Select>
  );
}

interface InnerCurrencySelectProps {
  name: string;
  accounts: Record<string, AccountDto>;
}
