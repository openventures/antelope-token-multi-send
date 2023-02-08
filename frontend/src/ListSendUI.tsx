import { useRecoilState, useRecoilValue } from "recoil";
import { myListsQuery } from "./store";
import Button from "./components/Button";
import { sendStore } from "./sendStore";

export default function ListSendUI() {
  const lists = useRecoilValue(myListsQuery);

  const [selectedList, setSelectedList] = useRecoilState(
    sendStore.selectedListAtom
  );

  return (
    <div className="flex flex-col space-y-2">
      <ul>
        {lists.length === 0 && <li>You haven't created any lists yet.</li>}
        {lists.map((l) => (
          <li key={l.list_id.toString()}>
            <label className="inline-flex flex-row space-x-2 items-center">
              <input
                type="radio"
                checked={selectedList?.equals(l.list_id)}
                onChange={(e) =>
                  setSelectedList(e.target.checked ? l.list_id : undefined)
                }
              />
              <span>
                {l.label} ({l.recipients.length} recipients)
              </span>
            </label>
          </li>
        ))}
      </ul>
      <div className="flex flex-row justify-end">
        <Button to="/lists">Manage Lists</Button>
      </div>
    </div>
  );
}
