import { useEffect, useMemo, useState } from "react";
import { NameType } from "@greymass/eosio";
import Button from "./components/Button";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";

type Props = {
  addresses: Array<NameType>;
  editMode: boolean;
  onComplete: (items: Array<NameType>) => void;
  onRequestEdit?: () => void;
  max?: number;
};

export default function BulkAddressInput(props: Props) {
  const [state, setState] = useState("");

  useEffect(() => {
    if (props.addresses.length > 0 && state.length === 0) {
      setState(props.addresses.join("\n"));
    }
  }, [props.addresses, setState, state]);

  const parsed = useMemo(():
    | { success: true; names: Array<NameType> }
    | { success: false; error: any } => {
    try {
      return {
        success: true,
        names: state
          .split(/[\s,]+/)
          .map((v) => v.trim())
          .filter((v) => !!v)
          .map((v) => {
            if (v.length > 12) {
              throw new Error(`'${v}' is too long`);
            }
            if (!/^[a-z1-4.]+$/.test(v)) {
              throw new Error(`'${v}' contains invalid characters`);
            }
            return v;
          }),
      };
    } catch (e) {
      return {
        success: false,
        error: e,
      };
    }
  }, [state]);

  if (!props.editMode) {
    return (
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center space-x-1">
          <CheckBadgeIcon className="h-4 w-4" />
          <span>{props.addresses.length} Addresses added</span>
        </div>
        {props.onRequestEdit && (
          <Button onClick={props.onRequestEdit}>Edit</Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end space-y-2">
      <textarea
        className="w-full rounded px-2 py-1 text-slate-900"
        placeholder="Comma seperated or new line seperated list"
        onChange={(e) => setState(e.target.value)}
        rows={props.max ?? 10}
        value={state}
      />
      {!parsed.success && <span>{parsed.error.toString()}</span>}
      {parsed.success && <span>{parsed.names.length} valid addresses</span>}
      <div className="flex flex-row justify-end space-x-1">
        {parsed.success && (
          <Button onClick={() => props.onComplete(parsed.names)}>
            Confirm
          </Button>
        )}
      </div>
    </div>
  );
}
