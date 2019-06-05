// example declaration file - remove these and add your own custom typings

// memory extension samples
interface CreepMemory {
  role: string;
  room: string;
  working: boolean;
  building: boolean;
  upgrading: boolean;
  reparing: boolean;
  reparingTarget: string | undefined;
  harvestSource: string | undefined;
  harvesting: boolean;
  transfering: boolean;
  transferTarget: string | undefined;
  preferTransferStructure: string;
  collectorStatus: string;
  collectorTarget: string | undefined;
  waitingRepair: boolean;
  beingRepaired: boolean;
  toRecycle: boolean | undefined;
  harvesterRoom: string;
  upgraderLinkTarget: string | undefined;
}

interface Memory {
  uuid: number;
  log: any;
}

// `global` extension samples
declare namespace NodeJS {
  interface Global {
    log: any;
  }
}

interface RoleParam {
  count: number,
  parts: BodyPartConstant[]
}

type Role = "builder" | "upgrader" | "maintainer" | "collector" | "claimer" | "harvester";

interface SpawnParam {
  spawn: StructureSpawn;
  builder: RoleParam;
  upgrader: RoleParam;
  maintainer: RoleParam;
  collector: RoleParam;
  claimer: RoleParam;
  harvester: RoleParam;
}
