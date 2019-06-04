// example declaration file - remove these and add your own custom typings

// memory extension samples
interface CreepMemory {
  role: string;
  spawnTime: number;
  room?: string;
  working?: boolean;
  building?: boolean;
  upgrading?: boolean;
  reparing?: boolean;
  reparingTarget?: string;
  harvestSource?: string;
  harvesting?: boolean;
  transfering?: boolean;
  transferTarget?: string;
  preferTransferStructure?: string;
  collectorStatus?: string;
  collectorTarget?: string;
  waitingRepair?: boolean;
  beingRepaired?: boolean;
  harvesterRoom?: string;
  upgraderLinkTarget?: string;
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

interface SpawnParam {
  spawn: StructureSpawn;
  builder: {
    count: number,
    parts: BodyPartConstant[]
  };
  upgrader: {
    count: number,
    parts: BodyPartConstant[]
  };
  maintainer: {
    count: number,
    parts: BodyPartConstant[]
  };
  collector: {
    count: number,
    parts: BodyPartConstant[]
  };
  claimer: {
    count: number,
    parts: BodyPartConstant[]
  };
  harvester: {
    count: number,
    parts: BodyPartConstant[]
  }
}

interface LinkPair {
  sender: StructureLink;
  receiver: StructureLink
}

interface RoomLinks {
  room: Room;
  links: LinkPair[]
}
