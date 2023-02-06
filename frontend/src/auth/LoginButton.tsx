import { authQueries, useEosLoginTrigger, useEosLogoutTrigger } from "./store";
import Button from "../components/Button";
import { useRecoilValue } from "recoil";
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function LoginButton() {
  const login = useEosLoginTrigger();
  const logout = useEosLogoutTrigger();
  const name = useRecoilValue(authQueries.activeUserName);

  if (!name) {
    return (
      <Button onClick={login}>
        <span>Login</span>
        <ArrowRightOnRectangleIcon className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button onClick={logout}>
      <span>{name}</span>
      <ArrowLeftOnRectangleIcon className="h-4 w-4" />
    </Button>
  );
}
