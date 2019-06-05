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
import { LinkUtil } from "utils/LinkUtil";


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

  // collector withdraw storage if low energy
  let collectorWithdrawStorageMode = getCollectorWithdrawStorageMode(Game.spawns['Spawn1']);

  // tower defense & repair
  TowerTask.run(Game.getObjectById('5ce5ab4e9917085da40c257a') as StructureTower);
  TowerTask.run(Game.getObjectById('5ceb0ce35a7eb776ba2e79fa') as StructureTower);

  // hostile creeps in room
  const hasHostile = Game.spawns['Spawn1'].room.find(FIND_HOSTILE_CREEPS).length > 0;

  // spawn creeps
  const spawnParams = [{
    spawn: Game.spawns['Spawn1'],
    harvester: {
      count: 4,
      parts: [WORK, WORK, WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
    },
    builder: {
      count: -1,
      parts: [WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
    },
    upgrader: {
      count: 1,
      parts: [WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
    },
    maintainer: {
      count: -1,
      parts: [WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
    },
    collector: {
      count: 1,
      parts: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE]
    },
    claimer: {
      count: 0,
      parts: [CLAIM, MOVE]
    }
  }, {
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
      count: 2,
      parts: [WORK, WORK, CARRY, CARRY, MOVE, MOVE]
    },
    maintainer: {
      count: -1,
      parts: [WORK, CARRY, MOVE]
    },
    collector: {
      count: 0,
      parts: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE]
    },
    claimer: {
      count: 0,
      parts: [CLAIM, MOVE]
    }
  }];

  for (const p of spawnParams) {
    SpawnHelper.spawn(p);
  }

  // auto spawn attack creep and defense
  if (hasHostile) {
    Attack.spawn('a', 1);
    Attack.attackCreeps(Game.spawns['Spawn1'].room.name);
    collectorWithdrawStorageMode = true;
  } else {
    if (Game.creeps['a1'] !== undefined &&
      Game.creeps['a1'].ticksToLive !== undefined &&
      Game.creeps['a1'].ticksToLive!! < 1350) {
      if (Game.spawns['Spawn1'].recycleCreep(Game.creeps['a1']) === ERR_NOT_IN_RANGE) {
        Game.creeps['a1'].moveTo(Game.spawns['Spawn1']);
      }
    }
  }

  const waitingRepairCreeps = new Map<string, BaseCreep[]>();
  const beingRepairedCreeps = new Map<string, BaseCreep>();

  // creeps work
  for (const name in Game.creeps) {
    try {
      const role = Game.creeps[name].memory.role;
      let creep: BaseCreep | null = null;

      if (role === 'harvester') {
        creep = new Harvester(Game.creeps[name]);
        (creep as Harvester).hasHostile = hasHostile;
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
        if (collectorWithdrawStorageMode) {
          creep.say("Withdraw")
        }
      } else if (role === 'claimer') {
        creep = new Claimer(Game.creeps[name]);
      }

      if (creep) {
        creep.work();

        if (creep.memory.beingRepaired) {
          beingRepairedCreeps.set(creep.room.name, creep);
        }
        else if (creep.memory.waitingRepair) {
          let rooms = waitingRepairCreeps.get(creep.room.name);
          if (rooms === undefined) {
            rooms = [];
          }
          rooms.push(creep);
          waitingRepairCreeps.set(creep.room.name, rooms);
        }
      }
    } catch (e) {
      Game.notify('Game.time = ' + Game.time);
      Game.notify('Creeps for loop error');
      Game.notify('Creep name = ' + name);
      Game.notify('Creep role = ' + Game.creeps[name].memory.role);
      Game.notify('Error: ');
      Game.notify(e);
    }
  }

  // renew creeps
  for (const roomName in Game.rooms) {
    let beingRepairedCreep = beingRepairedCreeps.get(roomName);
    if (beingRepairedCreep !== undefined) {
      const spawn = beingRepairedCreep.pos.findClosestByRange(FIND_MY_SPAWNS);
      if (spawn) {
        if (beingRepairedCreep.memory.toRecycle === undefined) {
          for (const p of spawnParams) {
            if (p.spawn.name === spawn.name) {
              const roleParam = getRoleSpawnParamByName(beingRepairedCreep.memory.role, p);
              if (roleParam === null) {
                continue;
              }
              const paramParts = roleParam.parts;
              const creepsParts = beingRepairedCreep.body.flatMap(def => def.type);
              if (paramParts.length !== creepsParts.length || paramParts.sort().every((value, index) => value === creepsParts.sort()[index])) {
                Game.notify("parts check test");
                Game.notify("paramParts not equals creepsParts");
                Game.notify(paramParts.sort().join(' '));
                Game.notify(creepsParts.sort().join(' '));
              } else {
                Game.notify("parts check test");
                Game.notify("paramParts equals creepsParts");
                Game.notify(paramParts.sort().join(' '));
                Game.notify(creepsParts.sort().join(' '));
              }
              break;
            }
          }
          beingRepairedCreep.memory.toRecycle = true;
        }

        if (spawn.renewCreep(beingRepairedCreep) === ERR_NOT_ENOUGH_ENERGY) {
          beingRepairedCreep.memory.waitingRepair = false;
          beingRepairedCreep.memory.beingRepaired = false;
        }
      }
    } else if (waitingRepairCreeps.has(roomName) && waitingRepairCreeps.get(roomName)!!.length) {
      beingRepairedCreep = waitingRepairCreeps.get(roomName)!![0];
      beingRepairedCreep.memory.beingRepaired = true;
      beingRepairedCreep.memory.waitingRepair = false;
    }
  }

  // links
  LinkUtil.transfer();


  function getCollectorWithdrawStorageMode(spawn: StructureSpawn): boolean {
    try {

      let capacity = spawn.energyCapacity;
      let energy = spawn.energy;

      spawn.room.find(FIND_MY_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_EXTENSION
      }).forEach(s => {
        s = s as StructureExtension;
        capacity += s.energyCapacity;
        energy += s.energy;
      });

      return energy / capacity < 0.2;
    } catch (e) {
      Game.notify("Error in getCollectorWithdrawStorageMode " + spawn.name);
      Game.notify(e);
      return false;
    }
  }

  function getRoleSpawnParamByName(role: string, param: SpawnParam): RoleParam | null {
    switch (role) {
      case 'harvester':
        return param.harvester;
      case 'builder':
        return param.builder;
      case 'upgrader':
        return param.upgrader;
      case 'maintainer':
        return param.maintainer;
      case 'collector':
        return param.collector;
      case 'claimer':
        return param.claimer;
    }

    return null;
  }
});
