import { Attack } from "Attack";
import { BaseCreep } from "roles/BaseCreep";
import { Builder } from "roles/Builder";
import { Claimer } from "roles/Claimer";
import { Collector } from "roles/Collector";
import { Harvester } from "roles/Harvester";
import { Maintainer } from "roles/Maintainer";
import { Upgrader } from "roles/Upgrader";
import { SpawnHelper } from "SpawnHelper";
import { TowerTask } from "TowerTask";
import { ErrorMapper } from "utils/ErrorMapper";

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  let collectorWithdrawStorageMode = true;

  // hostile creeps in room
  const hasHostile = Game.spawns['Spawn1'].room.find(FIND_HOSTILE_CREEPS).length > 0;

  // spawn creeps
  SpawnHelper.spawn({
    spawn: Game.spawns['Spawn1'],
    harvester: {
      count: 3,
      parts: [WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
    },
    builder: {
      count: -1,
      parts: [WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
    },
    upgrader: {
      count: 2,
      parts: [WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
    },
    maintainer: {
      count: 0,
      parts: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]
    },
    collector: {
      count: 0,
      parts: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE]
    },
    claimer: {
      count: 0,
      parts: [CLAIM, MOVE]
    }
  });

  // spawn creeps
  SpawnHelper.spawn({
    spawn: Game.spawns['Spawn2'],
    harvester: {
      count: 1,
      parts: [WORK, WORK, CARRY, CARRY, MOVE, MOVE]
    },
    builder: {
      count: 1,
      parts: [WORK, WORK, CARRY, CARRY, MOVE, MOVE]
    },
    upgrader: {
      count: 1,
      parts: [WORK, WORK, CARRY, CARRY, MOVE, MOVE]
    },
    maintainer: {
      count: 0,
      parts: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]
    },
    collector: {
      count: 0,
      parts: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE]
    },
    claimer: {
      count: 0,
      parts: [CLAIM, MOVE]
    }
  });

  // auto spawn attack creep and defense
  if (hasHostile) {
    Attack.spawn('a', 1);
    Attack.attackCreeps(Game.spawns['Spawn1'].room.name);
    collectorWithdrawStorageMode = true;
  }

  const waitingRepairCreeps = new Map<string, BaseCreep[]>();
  const beingRepairedCreeps = new Map<string, BaseCreep>();

  // creeps work
  for (const name in Game.creeps) {
    const role = Game.creeps[name].memory.role;
    let creep: BaseCreep | null = null;

    if (role === 'harvester') {
      creep = new Harvester(Game.creeps[name], hasHostile);
    }
    else if (role === 'builder') {
      creep = new Builder(Game.creeps[name]);
    }
    else if (role === 'upgrader') {
      creep = new Upgrader(Game.creeps[name]);
    }
    else if (role === 'maintainer') {
      creep = new Maintainer(Game.creeps[name]);
    }
    else if (role === 'collector') {
      creep = new Collector(Game.creeps[name]);
      (creep as Collector).withdrawStorageMode = collectorWithdrawStorageMode;
    } else if (role === 'claimer') {
      creep = new Claimer(Game.creeps[name]);
    }

    if (creep !== null) {
      creep.work();

      if (creep.memory.waitingRepair) {
        if (!waitingRepairCreeps.has(creep.roomName)) {
          waitingRepairCreeps.set(creep.roomName, []);
        }
        waitingRepairCreeps.get(creep.roomName)!!.push(creep);
      } else if (creep.memory.beingRepaired) {
        beingRepairedCreeps.set(creep.roomName, creep);
      }
    }
  }

  // renew creeps
  for (const roomName in beingRepairedCreeps) {
    let beingRepairedCreep = beingRepairedCreeps.get(roomName);
    if (beingRepairedCreep !== undefined) {
      const spawn = beingRepairedCreep.creep.pos.findClosestByRange(FIND_MY_SPAWNS);
      if (spawn) {
        if (spawn.renewCreep(beingRepairedCreep.creep) === ERR_NOT_ENOUGH_ENERGY) {
          beingRepairedCreep.memory.waitingRepair = false;
        }
      }
    } else if (waitingRepairCreeps.has(roomName) && waitingRepairCreeps.get(roomName)!!.length) {
      beingRepairedCreep = waitingRepairCreeps.get(roomName)!![0];
      beingRepairedCreep.memory.beingRepaired = true;
      beingRepairedCreep.memory.waitingRepair = false;
    }
  }

  // tower defense & repair
  TowerTask.run(Game.getObjectById('5ce5ab4e9917085da40c257a') as StructureTower);
  TowerTask.run(Game.getObjectById('5ceb0ce35a7eb776ba2e79fa') as StructureTower);

});
