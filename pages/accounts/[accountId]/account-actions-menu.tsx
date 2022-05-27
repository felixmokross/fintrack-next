import { ReactElement, useState } from "react";
import ActionsButton from "../../../components/actions-button";
import Dropdown from "../../../components/dropdown";
import { DropdownButton } from "../../../components/dropdown-button";
import { CloseIcon, ReopenIcon } from "../../../components/icons";
import api from "../../../lib/api";
import { useReload } from "../../../lib/reload";
import CloseAccountModal from "./close-account-modal";

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
