import { Fragment, Suspense, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { myTokenBalances } from "./store";
import { Combobox, Tab, Transition } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import Button from "./components/Button";
import { sendStore } from "./sendStore";
import "react-toastify/dist/ReactToastify.css";
import AdHocSendUI from "./AdHocSendUI";
import ListSendUI from "./ListSendUI";

export default function SendUI() {
  return (
    <div className="flex flex-col space-y-12">
      <AssetSelector />
      <SendModeSelector />
      <SendButton />
    </div>
  );
}

function AssetSelector() {
  const [q, setQ] = useRecoilState(sendStore.quantityRawAtom);
  const [query, setQuery] = useState("");

  const balances = useRecoilValue(myTokenBalances);

  const filteredBalances =
    query === ""
      ? balances
      : balances.filter((bal) => {
          return (bal.contract.toString() + bal.quantity.toString())
            .toLowerCase()
            .includes(query.toLowerCase());
        });

  return (
    <div className="flex flex-row items-stretch">
      <input
        type="text"
        className="rounded-l-lg bg-yellow-900 py-1 px-2 sm:text-sm"
        value={q.amount}
        onChange={(e) => setQ((qq) => ({ ...q, amount: e.target.value }))}
      />
      <Combobox
        value={q.currency}
        onChange={(v) => {
          const [symbol, contract] = v.split("@");
          const [decimalsR, currency] = symbol.split(",");
          setQ((qq) => ({
            ...qq,
            currency,
            decimals: parseInt(decimalsR, 10),
            contract,
          }));
        }}
      >
        <div className="relative h-4">
          <div className="relative w-full cursor-default overflow-hidden rounded-r-lg bg-yellow-900 px-4 py-1 text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            <Combobox.Input
              onChange={(event) => setQuery(event.target.value)}
              className="bg-yellow-900"
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-stone-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery("")}
          >
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-stone-800 py-1 px-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredBalances.map((bal) => {
                const key =
                  bal.quantity.symbol.toString() +
                  "@" +
                  bal.contract.toString();
                return (
                  <Combobox.Option key={key} value={key}>
                    <span>{bal.quantity.symbol.name}&nbsp;</span>
                    <span className="text-stone-500">
                      {bal.contract.toString()}
                    </span>
                  </Combobox.Option>
                );
              })}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
}

function SendModeSelector() {
  const options = ["adhoc", "list"] as const;
  const [mode, setMode] = useRecoilState(sendStore.sendModeAtom);

  return (
    <>
      <div className="w-full max-w-md">
        <Tab.Group
          selectedIndex={options.indexOf(mode)}
          onChange={(idx) => setMode(options[idx])}
        >
          <Tab.List className="flex space-x-1 rounded-xl bg-stone-800 p-1">
            {options.map((m) => (
              <Tab
                key={m}
                className={({ selected }) =>
                  classNames(
                    "w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-stone-700",
                    "ring-black ring-opacity-60 ring-offset-2 ring-offset-stone-400 focus:outline-none focus:ring-2",
                    selected
                      ? "bg-stone-100 shadow"
                      : "hover:bg-stone/[0.12] text-stone-100 hover:text-white"
                  )
                }
              >
                {m === "adhoc" ? "Ad-Hoc" : "Persistent List"}
              </Tab>
            ))}
          </Tab.List>
        </Tab.Group>
      </div>
      <Suspense fallback={<span>Loading...</span>}>
        {mode === "adhoc" && <AdHocSendUI />}
        {mode === "list" && <ListSendUI />}
      </Suspense>
    </>
  );
}

function SendButton() {
  const numRecipients = useRecoilValue(sendStore.numRecipientsQuery);
  const quantity = useRecoilValue(sendStore.quantityQuery);
  const { per, slippage } = useRecoilValue(sendStore.quantityPerRecipientQuery);

  const { working, send } = sendStore.useSendFn();

  return (
    <div className="flex max-w-md flex-col space-y-1">
      {numRecipients > 0 && (
        <div className="flex flex-col text-sm">
          <span>
            Sending {quantity.quantity.toString()} @{" "}
            {quantity.contract.toString()}.
          </span>
          <span>Resulting in {per.quantity.toString()} per recipient.</span>
          {slippage.quantity.value > 0 && (
            <span>
              {slippage.quantity.toString()} will be refunded, as it cannot be
              evenly divided.
            </span>
          )}
          <div className="w-screen" />
        </div>
      )}
      {numRecipients === 0 && (
        <div className="flex flex-col text-sm">
          <span>No recipients (did you confirm your address input?)</span>
        </div>
      )}
      <Button className="font-bold" onClick={send}>
        <span className="flex-1 text-center">{working ? "..." : "Send"}</span>
      </Button>
    </div>
  );
}
