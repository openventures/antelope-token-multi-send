import { PropsWithChildren, SyntheticEvent } from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";

type Props = {
  onClick?: (() => void) | ((e: SyntheticEvent) => void);
  to?: string;
  accent?: boolean;
  className?: string;
};

export default function Button(props: PropsWithChildren<Props>) {
  const cn = classNames(
    "inline-flex items-center space-x-2 rounded px-4 py-2 transition duration-150",
    props.className,
    {
      "bg-stone-800 hover:bg-stone-700 active:bg-stone-600": !props.accent,
      "bg-amber-600 hover:bg-amber-500 active:bg-amber-500": !!props.accent,
    }
  );

  if (props.to !== undefined) {
    return (
      <Link to={props.to} className={cn}>
        {props.children}
      </Link>
    );
  }

  return (
    <button onClick={props.onClick} className={cn}>
      {props.children}
    </button>
  );
}
