import { useRouter } from "next/router";
import { ReactElement, useState } from "react";
import { RenameIcon } from "../../components/icons";
import api from "../../lib/api";

export default function EditableAccountName({
  account,
}: EditableAccountNameProps): ReactElement {
  const [value, setValue] = useState<string | null>(null);

  if (value !== null) {
    return (
      <AccountNameEditor
        account={account}
        value={value}
        onChange={(v) => setValue(v)}
        onStopEditing={() => setValue(null)}
      />
    );
  }

  return (
    <AccountNameDisplay
      accountName={account.name}
      onStartEditing={() => setValue(account.name)}
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
  onStopEditing,
}: AccountNameEditorProps): ReactElement {
  const { replace, pathname } = useRouter();
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
        onBlur={onStopEditing}
        onKeyDown={(e) => {
          switch (e.key) {
            case "Escape":
              onStopEditing();
              return;
          }
        }}
      />
    </form>
  );

  async function onSubmit(): Promise<void> {
    if (!value || value === account.name) {
      onStopEditing();
      return;
    }

    await renameAccount(account._id, value);

    onStopEditing();

    replace(`${location.pathname}${location.search}`);
  }

  async function renameAccount(accountId: string, name: string): Promise<void> {
    await api(`/api/accounts/${accountId}/name`, "PUT", { name });
  }
}

interface AccountNameEditorProps {
  account: { _id: string; name: string };
  value: string;
  onChange: (value: string) => void;
  onStopEditing: () => void;
}
