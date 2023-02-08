import { useRecoilState } from "recoil";
import { sendStore } from "./sendStore";
import BulkAddressInput from "./BulkAddressInput";

export default function AdHocSendUI() {
  const [addrs, setAddrs] = useRecoilState(sendStore.adhocAddressAtom);

  return (
    <>
      <BulkAddressInput
        addresses={addrs}
        max={19}
        editMode={addrs.length === 0}
        onComplete={setAddrs}
        onRequestEdit={() => setAddrs([])}
      />
    </>
  );
}
