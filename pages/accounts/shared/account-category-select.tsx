import { orderBy } from "lodash";
import { useRefData } from "../../ref-data-context";
import { Select, SelectProps } from "../../shared/forms/select";
import { ButtonSkeleton } from "../../shared/skeletons";

export function AccountCategorySelect(props: AccountCategorySelectProps) {
  const { accountCategories } = useRefData();
  if (!accountCategories) return <ButtonSkeleton className="w-full" />;
  return (
    <Select {...props}>
      {orderBy(Object.values(accountCategories), (ac) => ac.order).map((ac) => (
        <option key={ac._id} value={ac._id}>
          {ac.name}
        </option>
      ))}
    </Select>
  );
}

export type AccountCategorySelectProps = SelectProps;
