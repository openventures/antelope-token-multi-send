import { Name, NameType, Struct, UInt64, UInt64Type } from "@greymass/eosio";
import { ActionMaker } from "./auth/store";

export namespace tknmultisendAbi {
  export const AN = Name.from("tknmultisend");

  @Struct.type("_list_entity")
  export class ListEntity extends Struct {
    @Struct.field("uint64") list_id: UInt64;
    @Struct.field("string") label: string;
    @Struct.field("name") recipients: Array<Name>;

    constructor(args: any) {
      super(args);
      this.list_id = args.list_id;
      this.label = args.label;
      this.recipients = args.recipients;
    }
  }

  export function CreateList(data: {
    author?: NameType;
    label: string;
    recipients: Array<NameType>;
  }): ActionMaker {
    return (pm) => ({
      account: AN,
      name: "createlist",
      authorization: [pm],
      data: {
        author: data.author ?? pm.actor,
        label: data.label,
        recipients: data.recipients,
      },
    });
  }

  export function AddToList(data: {
    author?: NameType;
    list_id: UInt64Type;
    recipients: Array<NameType>;
  }): ActionMaker {
    return (pm) => ({
      account: AN,
      name: "addtolist",
      authorization: [pm],
      data: {
        author: data.author ?? pm.actor,
        list_id: data.list_id,
        recipients: data.recipients,
      },
    });
  }

  export function RmFromList(data: {
    author?: NameType;
    list_id: UInt64Type;
    recipients: Array<NameType>;
  }): ActionMaker {
    return (pm) => ({
      account: AN,
      name: "rmfromlist",
      authorization: [pm],
      data: {
        author: data.author ?? pm.actor,
        list_id: data.list_id,
        recipients: data.recipients,
      },
    });
  }

  export function ClearList(data: {
    author?: NameType;
    list_id: UInt64Type;
  }): ActionMaker {
    return (pm) => ({
      account: AN,
      name: "clearlist",
      authorization: [pm],
      data: {
        author: data.author ?? pm.actor,
        list_id: data.list_id,
      },
    });
  }

  export function RmList(data: {
    author?: NameType;
    list_id: UInt64Type;
  }): ActionMaker {
    return (pm) => ({
      account: AN,
      name: "rmlist",
      authorization: [pm],
      data: {
        author: data.author ?? pm.actor,
        list_id: data.list_id,
      },
    });
  }

  export function SetListLabel(data: {
    author?: NameType;
    list_id: UInt64Type;
    label: string;
  }): ActionMaker {
    return (pm) => ({
      account: AN,
      name: "setlistlabel",
      authorization: [pm],
      data: {
        author: data.author ?? pm.actor,
        list_id: data.list_id,
        label: data.label,
      },
    });
  }
}
