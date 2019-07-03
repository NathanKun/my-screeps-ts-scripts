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

// memory extension samples
interface CreepMemory extends CreepBrithMemory {
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
  transferRoom?: string;
  upgraderLinkTarget?: string;
  cacheTime?: number;
  withdrawStorageMode?: boolean;
}

interface SpawnMemory {
  renewingCreep: boolean;
}

interface RoomMemory {
  energy: number;
  energyCapacity: number;
  energyPercentage: number;

  spawnParam: SpawnParam;
  toSpawn?: string;
  // roomConfig: RoomConfig;

  harvester: number;
  harvesterExt: number;
  builder: number;
  upgrader: number;
  collector: number;
  maintainer: number;
  claimer: number;
}

type ClaimerAction = 'attack' | 'reserve' | 'claim';

interface RoleParam extends CreepBrithMemory {
  count: number;
  parts: BodyPartConstant[];
}

interface CreepBrithMemory {
  harvestRoom?: string;
  upgraderUseStorageMin?: number;
  claimerRoom?: string;
  claimerAction?: ClaimerAction;
  canAttack?: boolean;
  collectorWithdrawTargets?: CollectorWithdrawTargets;
  harvesterExtPrimaryTransferTargets?: CollectorWithdrawTargets;
}

interface SpawnParam {
  spawns: StructureSpawn[];
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

interface CollectorWithdrawTargets {
  links?: string[],
  containers?: string[]
}
