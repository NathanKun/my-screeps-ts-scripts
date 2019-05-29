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
  builder: number;
  upgrader: number;
  maintainer: number;
  collector: number;
  claimer: number;
  harvesterConfig: {
    base: number;
    W9S6: number;
  }
}
