interface Memory {
  uuid: number;
  log: any;
  observeRoomsIndex: number;
  powerbank: PowerBankActionMemory;
  lastPurgeMemory: number;
  lastDoMarket: number;
}

// `global` extension samples
declare namespace NodeJS {
  interface Global {
    log: any;
  }
}

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
  collectorStatus?: string;
  collectorTarget?: string;
  toRecycle?: boolean;
  transferRoom?: string;
  upgraderLinkTarget?: string;
  cacheTime?: number;
  withdrawStorageMode?: boolean;
  powerbankPath?: RoomPosition[];
}

/*interface SpawnMemory {
  renewingCreep: boolean;
}*/

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

  notFullExtensions: StructureExtension[];
  notFullSpawns: StructureSpawn[];
  storage: StructureStorage | null;
  towers: StructureTower[];
  terminal: StructureTerminal | null;
  powerSpawn: StructurePowerSpawn | null;
  nuker: StructureNuker | null;
  observer: StructureObserver | null;
  containers: StructureContainer[] | null;
}

interface RoomConfig {
  room: Room;
  spawns: StructureSpawn[];
  hasHostile: boolean;
  collectorWithdrawStorageMode: boolean;
  storage: string;
  terminal: string;
  towers: string[];
  powerSpawn: string;
  nuker: string;
  observer: string;
  containers: string[];
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
  fullMaintainer?: boolean;
  powerbankHealerTarget?: string; // power bank attacker's name
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
  senderType: "nextToExit" | "cityCenter";
}

interface RoomLinks {
  room: Room;
  links: LinkPair[];
}

interface CollectorWithdrawTargets {
  links?: string[],
  containers?: string[],
  terminal?: string;
}

interface PowerBankActionMemory {
  bankId: string;

  path: RoomPosition[];
  findingPath: boolean;
  roomStructures?: PowerBankActionRoomStructures;
  pathRooms: string[]; // room names which path pass through

  start: RoomPosition;
  end: RoomPosition;
  carrierNeed: number;
  finished: boolean;
  poweraSpawnedIndex: number;
  powerhSpawnedIndex: number;
  powercSpawnedIndex: number;
}

interface PowerBankActionRoomStructures {
  [room: string]: AnyStructure[];
}

interface PowerCreepMemory {
  powerLastUsed: PowerLastUsed;
  lastRegenSource: LastRegenSource;
}

interface PowerLastUsed {
  [power: number]: number;
}

interface LastRegenSource {
  [sourceId: string]: number;
}
