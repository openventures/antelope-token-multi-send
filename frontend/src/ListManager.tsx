import {
  ArrowLeftIcon,
  CloudArrowUpIcon,
  PencilIcon,
  PlusCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Button from "./components/Button";
import { useRecoilCallback, useRecoilValue } from "recoil";
import { myListQuery, myListsQuery } from "./store";
import { Link, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { useCallback, useMemo, useState } from "react";
import BulkAddressInput from "./BulkAddressInput";
import { Name, NameType, UInt64 } from "@greymass/eosio";
import LoadingSpinner from "./components/LoadingSpinner";
import { ActionMaker, authQueries, useEosSignPushActions } from "./auth/store";
import { tknmultisendAbi } from "./tknmultisend.abi";
import LoginButton from "./auth/LoginButton";

export default function ListManager() {
  const user = useRecoilValue(authQueries.activeUserName);
  if (!user) {
    return (
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <LoginButton />
            </div>
          }
        />
      </Routes>
    );
  }
  return (
    <Routes>
      <Route index element={<Overview />} />
      <Route path="/create" element={<ListCreator />} />
      <Route path="/:author/:id" element={<ListEditor />} />
    </Routes>
  );
}

function Overview() {
  const lists = useRecoilValue(myListsQuery);
  return (
    <div className="flex flex-col space-y-12">
      <div className="flex flex-row">
        <Button to="create">
          <PlusCircleIcon className="h-4 w-4" />
          <span>Create</span>
        </Button>
      </div>
      <ul className="flex flex-col space-y-1">
        {lists.length === 0 && <li>You haven't created any lists yet.</li>}
        {lists.map((l) => (
          <OverviewRow key={l.list_id.toString()} list={l} />
        ))}
      </ul>
    </div>
  );
}

function OverviewRow({ list }: { list: tknmultisendAbi.ListEntity }) {
  const author = useRecoilValue(authQueries.activeUserName);
  const { signPushActions } = useEosSignPushActions();
  const [working, setWorking] = useState(false);
  const onDelete = useCallback(async () => {
    try {
      setWorking(true);
      if (!window.confirm("Delete permanently?")) {
        return;
      }
      await signPushActions(tknmultisendAbi.RmList({ list_id: list.list_id }));
    } finally {
      setWorking(false);
    }
  }, [list.list_id, signPushActions, setWorking]);
  return (
    <li className="flex flex-row items-center space-x-1">
      <span className="w-full flex-1">
        {list.label} ({list.recipients.length} recipients)
      </span>
      <div className="flex flex-row space-x-1">
        <Button to={`${author}/${list.list_id.toString()}`}>
          <PencilIcon className="h-4 w-4" />
        </Button>
        <Button onClick={working ? undefined : onDelete}>
          {working ? <LoadingSpinner /> : <TrashIcon className="h-4 w-4" />}
        </Button>
      </div>
    </li>
  );
}

function ListCreator() {
  const username = useRecoilValue(authQueries.activeUserName);
  const navigate = useNavigate();
  const [label, setLabel] = useState("");
  const [recipients, setRecipients] = useState<Array<NameType>>([]);

  const { signPushActions } = useEosSignPushActions();
  const [working, setWorking] = useState(false);
  const onCreate = useCallback(async () => {
    try {
      setWorking(true);
      if (recipients.length === 0) {
        alert("Please add at least one recipient.");
        return;
      }
      await signPushActions(
        tknmultisendAbi.CreateList({
          label,
          recipients,
        })
      );
      navigate("..");
    } finally {
      setWorking(false);
    }
  }, [label, recipients, setWorking, navigate, signPushActions]);

  return (
    <div className="flex max-w-xl flex-col items-start space-y-12">
      <div className="w-screen" />
      <div className="flex flex-row items-center space-x-2">
        <Link to="..">
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
        <h2 className="w-full text-xl">New List</h2>
      </div>
      <label className="inline-flex flex-col">
        <span className="text-xs uppercase text-stone-100">Label</span>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="rounded px-1 text-stone-900"
        />
      </label>
      <div className="w-full">
        <BulkAddressInput
          addresses={recipients}
          editMode={recipients.length === 0}
          onComplete={setRecipients}
          onRequestEdit={() => setRecipients([])}
        />
      </div>
      <div className="flex flex-row">
        {username ? (
          <Button onClick={working ? undefined : onCreate}>
            <CloudArrowUpIcon className="h-4 w-4" />
            {working ? <LoadingSpinner /> : <span>Create</span>}
          </Button>
        ) : (
          <LoginButton />
        )}
      </div>
    </div>
  );
}

function ListEditor() {
  const params = useParams();
  const author = Name.from(params.author!);
  const id = UInt64.from(params.id);
  const navigate = useNavigate();

  const list = useRecoilValue(myListQuery(id.toString()));

  if (!list) {
    throw new Error("List not found");
  }

  const [label, setLabel] = useState(list.label ?? "");
  const [recipients, setRecipients] = useState(list.recipients);

  const recipientsDiff = useMemo(
    () =>
      listDiff(
        list.recipients.map((v) => v.toString()),
        recipients.map((v) => v.toString())
      ),
    [list, recipients]
  );
  const isDirty = label !== list.label || recipientsDiff.added.length > 0;

  const { signPushActions } = useEosSignPushActions();
  const [working, setWorking] = useState(false);
  const onSave = useRecoilCallback(
    () => async () => {
      setWorking(true);
      try {
        const ams: Array<ActionMaker> = [];

        if (label !== list?.label) {
          ams.push(
            tknmultisendAbi.SetListLabel({
              list_id: list!.list_id,
              label,
            })
          );
        }
        if (recipients.length === 0) {
          ams.push(
            tknmultisendAbi.ClearList({
              list_id: list!.list_id,
            })
          );
        } else {
          if (recipientsDiff.added.length > 0) {
            ams.push(
              tknmultisendAbi.AddToList({
                list_id: list!.list_id,
                recipients: recipientsDiff.added,
              })
            );
          }
          if (recipientsDiff.removed.length > 0) {
            ams.push(
              tknmultisendAbi.RmFromList({
                list_id: list!.list_id,
                recipients: recipientsDiff.removed,
              })
            );
          }
        }
        if (ams.length === 0) {
          return;
        }
        await signPushActions(ams);
        navigate("..");
      } finally {
        setWorking(false);
      }
    },
    [setWorking, label, recipients, recipientsDiff, list]
  );

  const canSave = isDirty && !working;

  return (
    <div className="flex max-w-xl flex-col items-start space-y-12">
      <div className="w-screen" />
      <div className="flex flex-row items-center space-x-2">
        <Link to="..">
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
        <h2 className="font-mono">
          {author.toString()}/{id.toString()}
        </h2>
      </div>
      <label className="inline-flex flex-col">
        <span className="text-xs uppercase text-stone-100">Label</span>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="rounded px-1 text-stone-900"
        />
      </label>
      <div className="w-full">
        <BulkAddressInput
          addresses={recipients}
          onComplete={(vs) => setRecipients(vs.map((v) => Name.from(v)))}
          onRequestEdit={() => setRecipients([])}
          editMode={recipients.length === 0}
        />
      </div>

      <div className="flex flex-row">
        <Button onClick={canSave ? onSave : undefined}>
          {canSave ? "Save" : "No changes"}
        </Button>
      </div>
    </div>
  );
}

type ListDiff<T> = {
  removed: Array<T>;
  added: Array<T>;
};

function listDiff(a: Array<string>, b: Array<string>): ListDiff<string> {
  const aa = new Set(a);
  const bb = new Set(b);
  return {
    removed: a.filter((v) => !bb.has(v)),
    added: b.filter((v) => !aa.has(v)),
  };
}
