import { ReactElement, useState } from "react";
import ActionsButton from "../../shared/actions-button";
import { DropdownButton } from "../../shared/dropdown/dropdown-button";
import CloseAccountModal from "./close-account-modal";
import Dropdown from "../../shared/dropdown/dropdown";
import { CloseIcon, ReopenIcon } from "../../shared/icons";
import { useReload } from "../../shared/reload";
import api from "../../shared/api";

export default function AccountActionsMenu({
  account,
}: AccountActionsMenuProps): ReactElement {
  const [showCloseAccountModal, setShowCloseAccountModal] = useState(false);
  const reload = useReload();

  return (
    <>
      <Dropdown
        id="actions-menu"
        triggerButton={ActionsButton}
        menuClassName="right-0 mr-2"
      >
        {!account.closingDate && (
          <DropdownButton
            onClick={() => setShowCloseAccountModal(true)}
            icon={CloseIcon}
          >
            Close Account
          </DropdownButton>
        )}
        {account.closingDate && (
          <DropdownButton
            onClick={async () => {
              await reopenAccount(account._id);

              reload();
            }}
            icon={ReopenIcon}
          >
            Reopen Account
          </DropdownButton>
        )}
      </Dropdown>
      {showCloseAccountModal && (
        <CloseAccountModal
          accountId={account._id}
          onClose={() => setShowCloseAccountModal(false)}
        />
      )}
    </>
  );

  async function reopenAccount(accountId: string): Promise<void> {
    await api(`/api/accounts/${accountId}/closing-date`, "PUT", {});
  }
}

export interface AccountActionsMenuProps {
  account: { _id: string; closingDate: string | null };
}
