// example declaration file - remove these and add your own custom typings

// memory extension samples
interface CreepMemory {
  role: string;
  spawnTime: number;
  room: string;
  working?: boolean;
  building?: boolean;
  upgrading?: boolean;
  reparing?: boolean;
  reparingTarget?: string;
  harvestSource?: string;
  harvesting?: boolean;
  transfering?: boolean;
  transferTarget?: string;
  preferTransferStructure?: 'tower' | 'storage';
  collectorStatus?: string;
  collectorTarget?: string;
  waitingRepair?: boolean;
  beingRepaired?: boolean;
  toRecycle?: boolean;
  harvestRoom?: string;
  transferRoom?: string;
  upgraderLinkTarget?: string;
  upgraderUseStorageMin?: number;
  claimerRoom?: string;
  claimerAction? :ClaimerAction;
  cacheTime?: number;
}

type ClaimerAction = 'attack' | 'reserve' | 'claim';

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
  count: number;
  parts: BodyPartConstant[];
  harvestRoom?: string;
  upgraderUseStorageMin?: number;
  claimerRoom?: string;
  claimerAction? :'attack' | 'reserve' | 'claim';
}

interface SpawnParam {
  spawn: StructureSpawn;
  builder: RoleParam;
  upgrader: RoleParam;
  maintainer: RoleParam;
  collector: RoleParam;
  claimer: RoleParam;
  harvester: RoleParam;
  harvesterExt: RoleParam;
}

interface LinkPair {
  sender: StructureLink;
  receiver: StructureLink;
}

interface RoomLinks {
  room: Room;
  links: LinkPair[];
}

interface RoomConfig {
  room: Room;
  spawns: StructureSpawn[];
  hasHostile: boolean;
  collectorWithdrawStorageMode: boolean;
}
