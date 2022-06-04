import { AccountUnitDto } from "../../accounts/shared/dtos";
import { AccountType } from "../../accounts/shared/enums";

export interface CreateAccountDto {
  name: string;
  type: AccountType;
  unit: AccountUnitDto;
  categoryId: string;
  groupId?: string;
  openingDate?: string;
}
