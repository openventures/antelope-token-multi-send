import { atom, selector } from "recoil";
import { localStorageEffect } from "./common/store-effects";
import { APIClient, FetchProvider } from "@greymass/eosio";
import { JsonRpc } from "@eoscafe/light-api";
import { USE_TEST_NET } from "./testnet";

export const eosRPCEndpoint = atom({
  key: "eosRPCEndpoint",
  default: "https://wax.greymass.com",
  effects: [localStorageEffect("r/eosRPCEndpoint")]
});

export const eosRPC = selector({
  key: "eosRPC",
  get: ({ get }) => {
    return new APIClient({
      provider: new FetchProvider(USE_TEST_NET ? "https://waxtest.eu.eosamsterdam.net" : get(eosRPCEndpoint))
    });
  }
});

export const eosLightApiEndpoint = atom({
  key: "eosLightApiEndpoint",
  default: "https://wax.light-api.net",
  effects: [localStorageEffect("r/eosLightApiEndpoint")]
});

export const eosLightApi = selector({
  key: "eosLightApi",
  get: ({ get }) => {
    return new JsonRpc("wax", {
      endpoint: get(eosLightApiEndpoint)
    });
  }
});
