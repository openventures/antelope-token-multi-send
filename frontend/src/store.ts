import { selector } from "recoil";
import { authQueries, refreshOnTransaction } from "./auth/store";
import { eosLightApi, eosRPC } from "./eos-store";
import { tknmultisendAbi } from "./tknmultisend.abi";
import { Asset, ExtendedAsset, Name } from "@greymass/eosio";

export const myListsQuery = selector({
  key: "store/myListsQuery",
  get: async ({ get }) => {
    const author = get(authQueries.activeUserName);
    if (!author) {
      return [];
    }
    const rpc = get(eosRPC);
    get(refreshOnTransaction);
    const res = await rpc.v1.chain.get_table_rows({
      code: tknmultisendAbi.AN,
      scope: Name.from(author),
      table: "lists",
      limit: 1000,
      type: tknmultisendAbi.ListEntity,
    });
    return res.rows;
  },
});

export const myTokenBalances = selector<Array<ExtendedAsset>>({
  key: "store/myTokenBalances",
  get: async ({ get }) => {
    const author = get(authQueries.activeUserName);
    if (!author) {
      return [];
    }

    const lapi = get(eosLightApi);
    get(refreshOnTransaction);

    const { balances } = await lapi.get_balances(author);
    return balances.map((b) =>
      ExtendedAsset.from({
        quantity: Asset.fromFloat(
          parseFloat(b.amount),
          Asset.Symbol.fromParts(b.currency, parseInt(b.decimals, 10))
        ),
        contract: Name.from(b.contract),
      })
    );
  },
});
