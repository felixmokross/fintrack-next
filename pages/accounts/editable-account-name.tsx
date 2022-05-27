import { ReactElement, useEffect, useState } from "react";
import { RenameIcon } from "../../components/icons";
import api from "../../lib/api";
import { useReload } from "../../lib/reload";

export default function EditableAccountName({
  account,
}: EditableAccountNameProps): ReactElement {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState<string>("");

  // reset when account changes
  useEffect(() => {
    setValue(account.name);
    setIsEditing(false);
  }, [account._id, account.name]);

  if (isEditing) {
    return (
      <AccountNameEditor
        account={account}
        value={value}
        onChange={(v) => setValue(v)}
        onDismiss={() => {
          setIsEditing(false);
          setValue(account.name);
        }}
        onSave={() => setIsEditing(false)}
      />
    );
  }

  return (
    <AccountNameDisplay
      accountName={value}
      onStartEditing={() => setIsEditing(true)}
    />
  );
}

export interface EditableAccountNameProps {
  account: { _id: string; name: string };
}

function AccountNameDisplay({
  accountName,
  onStartEditing: onRenameClick,
}: AccountNameDisplayProps): ReactElement {
  return (
    <h1 className="group text-3xl font-light">
      {accountName}{" "}
      <button
        onClick={onRenameClick}
        className="invisible text-gray-400 hover:text-gray-600 group-hover:visible dark:text-gray-300 dark:hover:text-white"
      >
        <RenameIcon className="h-5 w-5" />
        <span className="sr-only">Rename</span>
      </button>
    </h1>
  );
}

interface AccountNameDisplayProps {
  accountName: string;
  onStartEditing: () => void;
}

function AccountNameEditor({
  account,
  value,
  onChange,
  onSave,
  onDismiss,
}: AccountNameEditorProps): ReactElement {
  const reload = useReload();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <input
        className="block w-full border-0 bg-white p-0 text-3xl font-light focus:outline-none focus:ring-0 dark:bg-gray-900"
        type="text"
        autoFocus={true}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => e.target.select()}
        onBlur={onDismiss}
        onKeyDown={(e) => {
          switch (e.key) {
            case "Escape":
              onDismiss();
              return;
          }
        }}
      />
    </form>
  );

  async function onSubmit(): Promise<void> {
    if (!value || value === account.name) {
      onDismiss();
      return;
    }

    await renameAccount(account._id, value);

    onSave();

    reload();
  }

  async function renameAccount(accountId: string, name: string): Promise<void> {
    await api(`/api/accounts/${accountId}/name`, "PUT", { name });
  }
}

interface AccountNameEditorProps {
  account: { _id: string; name: string };
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onDismiss: () => void;
}
