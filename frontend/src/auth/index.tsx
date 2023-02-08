// @ts-ignore
import { UALProvider, UALContext } from "ual-reactjs-renderer";
import { PropsWithChildren, useContext, useEffect, useMemo } from "react";
import { Anchor } from "ual-anchor";
import { Wax } from "@eosdacio/ual-wax";
import { useRecoilState, useRecoilValue } from "recoil";
import { internal, UALCtx } from "./store";
import { eosRPCEndpoint } from "../eos-store";
import { USE_TEST_NET } from "../testnet";

function UALConsumer(props: PropsWithChildren<{}>) {
  const ual = useUAL();
  const user = ual.activeUser;
  const [, setUser] = useRecoilState(internal.activeUser);

  useEffect(() => {
    setUser(user);
  }, [setUser, user]);

  return <>{props.children}</>;
}

export function useUAL(): UALCtx {
  return useContext(UALContext);
}

export function UALAuthProvider(props: PropsWithChildren<{}>) {
  let nodeUrl = useRecoilValue(eosRPCEndpoint);
  if (USE_TEST_NET) {
    nodeUrl = "https://waxtest.eu.eosamsterdam.net";
  }
  const config = useMemo(
    () =>
      ({
        chainId:
          !USE_TEST_NET ? "1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4" : "f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12",
        nodeUrl,
        appName: "tknmultisend"
      } as const),
    [nodeUrl]
  );

  const chains = useMemo(
    () => [{ chainId: config.chainId, nodeUrl: config.nodeUrl }],
    [config]
  );
  const waxChain = useMemo(
    () => ({
      chainId: config.chainId,
      rpcEndpoints: [
        {
          protocol: "https",
          host: config.nodeUrl.substring("https://".length),
          port: 443
        }
      ]
    }),
    [config]
  );

  const authenticators = useMemo(
    () => [
      new Anchor([waxChain], {
        appName: config.appName
      }),
      new Wax([waxChain])
    ],
    [waxChain, config]
  );

  return (
    <UALProvider
      chains={chains}
      authenticators={authenticators}
      appName={config.appName}
    >
      <UALConsumer>{props.children}</UALConsumer>
    </UALProvider>
  );
}
