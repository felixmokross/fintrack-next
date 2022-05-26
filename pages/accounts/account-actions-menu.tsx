import { ReactElement, useEffect, useState } from "react";
import ActionsButton from "../../components/actions-button";
import Dropdown from "../../components/dropdown";
import { DropdownButton } from "../../components/dropdown-button";
import { CloseIcon, ReopenIcon } from "../../components/icons";
import CloseAccountModal from "./close-account-modal";

export default function AccountActionsMenu({
  account,
}: AccountActionsMenuProps): ReactElement {
  const [showCloseAccountModal, setShowCloseAccountModal] = useState(false);
  //   const queryClient = useQueryClient();
  //   const { mutateAsync } = useMutation(reopenAccountAsync);
  //   const api = useApi<void, AccountClosingDateDto>();

  const [reopenAccount, setReopenAccount] = useState(false);

  useEffect(() => {
    if (!reopenAccount) return;

    (async function () {
      //   await mutateAsync(account._id);
      //   await queryClient.invalidateQueries(["accounts"]);
    })();
  }, [
    reopenAccount,
    // mutateAsync, queryClient,
    account._id,
  ]);

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
            onClick={() => setReopenAccount(true)}
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

  async function reopenAccountAsync(accountId: string): Promise<void> {
    // await api(`/api/accounts/${accountId}/closingdate`, "PUT", {});
  }
}

export interface AccountActionsMenuProps {
  account: { _id: string; closingDate: string | null };
}
