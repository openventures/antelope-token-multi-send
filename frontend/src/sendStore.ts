import { atom, selector, useRecoilValue } from "recoil";
import { Asset, ExtendedAsset, Name, NameType } from "@greymass/eosio";
import { useCallback, useState } from "react";
import { authQueries, useEosSignPushActions } from "./auth/store";
import { tknmultisendAbi } from "./tknmultisend.abi";

const quantityRawAtom = atom<{
  amount: string;
  contract: string;
  currency: string;
  decimals: number;
}>({
  key: "sendStore/quantityRawAtom",
  default: {
    amount: "0",
    contract: "eosio.token",
    currency: "WAX",
    decimals: 8
  }
});

const sendModeAtom = atom<"adhoc" | "list">({
  key: "sendStore/sendModeAtom",
  default: "adhoc"
});

const adhocAddressAtom = atom<Array<NameType>>({
  key: "adhocAddressAtom",
  default: []
});

const numRecipientsQuery = selector<number>({
  key: "sendStore/numRecipientsQuery",
  get: ({ get }) =>
    get(sendModeAtom) === "adhoc" ? get(adhocAddressAtom).length : 0
});

const quantityQuery = selector({
  key: "sendStore/quantityQuery",
  get: ({ get }) => {
    const { amount, contract, currency, decimals } = get(quantityRawAtom);

    return ExtendedAsset.from({
      quantity: Asset.fromFloat(
        parseFloat(amount.replace(",", ".")),
        Asset.Symbol.fromParts(currency, decimals)
      ),
      contract: Name.from(contract)
    });
  }
});

const quantityPerRecipientQuery = selector({
  key: "sendStore/quantityPerRecipientQuery",
  get: ({ get }) => {
    const n = get(numRecipientsQuery) || 1;
    const q = get(quantityQuery);
    const per = q.quantity.units.dividing(n, "floor");

    return {
      per: ExtendedAsset.from({
        contract: q.contract,
        quantity: Asset.fromUnits(per, q.quantity.symbol)
      }),
      slippage: ExtendedAsset.from({
        contract: q.contract,
        quantity: Asset.fromUnits(
          q.quantity.units.subtracting(per.multiplying(n)),
          q.quantity.symbol
        )
      })
    };
  }
});

const memoQuery = selector({
  key: "sendStore/memoQuery",
  get: ({ get }) => {
    switch (get(sendModeAtom)) {
      case "adhoc":
        return get(adhocAddressAtom).map(a => a.toString()).join(",");
      case "list":
        return `send:listauthor/id/todomemo`;
      default:
        throw new Error("Unsupported send mode");
    }
  }
});

function useSendFn() {
  const [working, setWorking] = useState(false);
  const user = useRecoilValue(authQueries.activeUserName);
  const q = useRecoilValue(quantityQuery);
  const memo = useRecoilValue(memoQuery);

  const { signPushActions } = useEosSignPushActions();

  const fn = useCallback(async () => {
    try {
      setWorking(true);
      await signPushActions(pm => ({
        account: q.contract,
        name: "transfer",
        authorization: [pm],
        data: {
          from: user,
          to: tknmultisendAbi.AN,
          quantity: q.quantity,
          memo
        }
      }));
    } finally {
      setWorking(false);
    }
  }, [setWorking, signPushActions, q, user, memo]);

  return {
    working,
    send: working ? undefined : fn
  };
}

export const sendStore = {
  quantityRawAtom,
  sendModeAtom,
  adhocAddressAtom,
  numRecipientsQuery,
  quantityQuery,
  quantityPerRecipientQuery,
  useSendFn,
};
