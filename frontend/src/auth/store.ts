import { toast } from "react-toastify";
import { atom, CallbackInterface, selector, useRecoilCallback } from "recoil";
import { AnyAction, NameType } from "@greymass/eosio";
import { Authenticator, UALError, User } from "universal-authenticator-library";
import { useUAL } from "./index";
import { useCallback } from "react";

export type ActionMaker =
  | ((auth: {
      actor: NameType;
      permission: NameType;
    }) => AnyAction | Array<AnyAction>)
  | Array<ActionMaker>;

export class SignTransactionError extends Error {}

export type UALCtx = {
  chains: Array<unknown>;
  authenticators: Array<Authenticator>;
  availableAuthenticators: Array<Authenticator>;
  appName: string;
  model: unknown;
  loading: boolean;
  users: Array<unknown>;
  activeAuthenticator: Authenticator | null;
  activeUser: User | null;
  isAutoLogin: boolean;
  error: UALError | null;
  message: string;
  hideModal: () => void;
  showModal: () => void;
  logout: () => void;
  restart: () => void;
  broadcastStatus: () => void;
  authenticateWithoutAccountInput: (
    authenticator: Authenticator,
    isAutoLogin?: boolean
  ) => Promise<void>;
  submitAccountForLogin: (
    accountInput: string,
    authenticator: Authenticator
  ) => Promise<void>;
};

export const internal = {
  activeUser: atom<User | null>({
    key: "auth/internal/activeUser",
    default: null,
    dangerouslyAllowMutability: true,
  }),
};

export function useEosLoginTrigger() {
  const ual = useUAL();
  return useCallback(() => {
    ual.showModal();
  }, [ual]);
}

export function useEosLogoutTrigger() {
  const ual = useUAL();
  return useCallback(() => {
    ual.logout();
  }, [ual]);
}

const nonce = atom({
  key: "_internal/auth/nonce",
  default: 1,
});

export const refreshOnTransaction = selector<unknown>({
  key: "auth/refreshOnTransaction",
  get: ({ get }) => get(nonce),
});

export function useEosRefresh() {
  return useRecoilCallback(({ set }) => () => {
    set(nonce, Date.now());
  });
}

export function useEosSignPushActions() {
  const ual: any = useUAL();
  const signPushActions = useRecoilCallback(
    (ci) => async (actions: ActionMaker) => {
      if (!ual?.activeUser) {
        await ual.showModal();
        return;
      }
      await signPush(ual, ci, [actions]);
    },
    [ual]
  );
  return {
    signPushActions,
  } as const;
}

export const authQueries = {
  activeUserName: selector({
    key: "auth/authQueries/activeUserName",
    get: async ({ get }) => {
      const user = get(internal.activeUser);
      return user?.getAccountName();
    },
  }),
};

async function signPush(
  ual: any,
  { snapshot, set }: CallbackInterface,
  ams: Array<ActionMaker>,
  opts?: { withFuel: boolean }
) {
  const actor: string = await ual.activeUser.getAccountName();
  const accounts = ual.activeUser.scatter?.accounts;
  const permission =
    ual.activeUser.requestPermission ||
    (accounts?.length > 0 ? accounts[0].authority : "active");
  const pl = { actor, permission };

  try {
    const realActions = serializeData(resolveActions(pl, ams));
    const tx = { actions: realActions };
    const txHeader = { blocksBehind: 6, expireSeconds: 120 };
    await ual.activeUser.signTransaction(tx, txHeader);

    const id = new Date().toISOString();

    toast.info("Broadcasting transaction...", { toastId: id });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    set(nonce, Date.now());
    toast.dismiss(id);
    requestAnimationFrame(() => {
      toast.success("Transaction executed locally");
    });
  } catch (e: any) {
    console.error(e);
    toast.error(e.toString());
    throw new SignTransactionError(e);
  }
}

function serializeData(arg: unknown): any {
  if (typeof arg === "string" || typeof arg === "number") {
    return arg;
  }
  if (Array.isArray(arg)) {
    return arg.map(serializeData);
  }
  if (typeof arg === "object" && arg !== null && "toABI" in arg) {
    return arg.toString();
  }
  if (typeof arg === "object" && arg !== null) {
    return Object.fromEntries(
      Object.entries(arg).map(([k, v]) => [k, serializeData(v)])
    );
  }
  return arg;
}

function resolveActions(
  pm: { actor: NameType; permission: NameType },
  am: ActionMaker
): Array<AnyAction> {
  if (Array.isArray(am)) {
    return am.flatMap((a) => resolveActions(pm, a));
  }
  const res = am(pm);
  if (Array.isArray(res)) {
    return res;
  }
  return [res];
}
