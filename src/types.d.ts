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
  collectorStatus: string;
  collectorTarget: string | undefined;
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
  harvester: number;
  builder: number;
  upgrader: number;
  maintainer: number;
  collector: number;
}
