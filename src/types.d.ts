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
