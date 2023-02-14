import { Suspense } from "react";
import ErrorBoundary from "./ErrorBoundary";
import LoginButton from "./auth/LoginButton";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SendUI from "./SendUI";
import { Link, Route, Routes } from "react-router-dom";
import ListManager from "./ListManager";
import { USE_TEST_NET } from "./testnet";
import {
  CodeBracketSquareIcon,
  CubeTransparentIcon,
} from "@heroicons/react/24/outline";

export default function App() {
  return (
    <Suspense fallback={<></>}>
      <div className="container mx-auto flex min-h-screen max-w-7xl flex-col space-y-4">
        <nav className="flex flex-row items-center px-2 py-1 md:p-4">
          <div className="hidden flex-1 md:block" />
          <div className="flex-1">
            <Link to="/">
              <h1 className="font-bold md:text-center md:text-3xl">
                Token Multisend
                {USE_TEST_NET && (
                  <span className="mx-2 text-xs font-bold uppercase text-amber-500">
                    TESTNET
                  </span>
                )}
              </h1>
            </Link>
          </div>
          <div className="md:flex md:flex-1 md:flex-row md:justify-end">
            <LoginButton />
          </div>
        </nav>
        <ErrorBoundary>
          <main className="mx-auto">
            <Routes>
              <Route index element={<SendUI />} />
              <Route path="/lists/*" element={<ListManager />} />
              <Route path="*" element={<span>Not found</span>} />
            </Routes>
          </main>
        </ErrorBoundary>
        <ToastContainer />
      </div>
      <footer className="mx-auto flex max-w-7xl flex-col space-y-1 px-4 py-12 text-sm text-stone-200">
        <a
          href="https://github.com/openventures/antelope-token-multi-send/"
          target="_blank"
          rel="noopener"
          className="inline-flex flex-row items-center space-x-1 underline"
        >
          <CodeBracketSquareIcon className="h-4 w-4" />
          <span>Source Code</span>
        </a>
        <a
          href="https://waxblock.io/account/tknmultisend"
          target="_blank"
          rel="noopener"
          className="inline-flex flex-row items-center space-x-1 underline"
        >
          <CubeTransparentIcon className="h-4 w-4" />
          <span>Contract</span>
        </a>
        <p className="text-xs text-stone-400">
          This project was requested and funded by the{" "}
          <a
            href="https://alienw.com/syndicate/neri"
            target="_blank"
            rel="noopener"
            className="underline"
          >
            AlienWorlds NERI syndicate
          </a>
        </p>
        <span>&copy; 2023 DaGardner#5862</span>
      </footer>
    </Suspense>
  );
}
