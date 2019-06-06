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

  // structure being attack
  if (Game.spawns['Spawn1'].room.find(FIND_MY_STRUCTURES, {
    filter: s => s.structureType !== STRUCTURE_RAMPART && s.hits !== s.hitsMax
  }).length) {
    const controller = Game.spawns['Spawn1'].room.controller!!;
    if (controller.safeMode === undefined && controller.safeModeAvailable > 0) {
      controller.activateSafeMode();
    }
  }

  // tower defense & repair
  TowerTask.run(Game.getObjectById('5ce5ab4e9917085da40c257a') as StructureTower);
  TowerTask.run(Game.getObjectById('5ceb0ce35a7eb776ba2e79fa') as StructureTower);

  TowerTask.run(Game.getObjectById('5cf6d44f1a35fd098d7d7ad5') as StructureTower);

  // hostile creeps in room
  const hasHostile = Game.spawns['Spawn1'].room.find(FIND_HOSTILE_CREEPS).length > 0;

  // spawn creeps
  const spawnParams = [{
    spawn: Game.spawns['Spawn1'],
    harvester: {
      count: 4,
      parts: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
    },
    builder: {
      count: -1,
      parts: [WORK, WORK, WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
    },
    upgrader: {
      count: 1,
      parts: [WORK, WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
    },
    maintainer: {
      count: -1,
      parts: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
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
      count: 2,
      parts: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]
    },
    builder: {
      count: 1,
      parts: [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]
    },
    upgrader: {
      count: 2,
      parts: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]
    },
    maintainer: {
      count: -1,
      parts: [WORK, CARRY, CARRY, CARRY, MOVE, MOVE]
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

  // links
  const roomLinks: RoomLinks[] = [
    {
      room: Game.rooms['W9S7'],
      links: [
        {
          sender: Game.getObjectById('5cf53529ac644b09c5efd05c') as StructureLink,
          receiver: Game.getObjectById('5cf53c6d03632c664c611dce') as StructureLink
        }, {
          sender: Game.getObjectById('5cf543d960fc8009c45c72d3') as StructureLink,
          receiver: Game.getObjectById('5cf53c6d03632c664c611dce') as StructureLink
        }
      ]
    }
  ];
  LinkUtil.transfer(roomLinks);

  // creeps
  const waitingRepairCreeps = new Map<string, BaseCreep[]>();
  const beingRepairedCreeps = new Map<string, BaseCreep>();

  for (const name in Game.creeps) {
    try {
      const c = Game.creeps[name];
      if (c.memory.spawnTime === Game.time) {
        continue;
      }

      const role = c.memory.role;
      let creep: BaseCreep | null = null;

      if (role === 'harvester') {
        creep = new Harvester(c, hasHostile, roomLinks);
      }
      else if (role === 'builder') {
        creep = new Builder(c);
      }
      else if (role === 'upgrader') {
        creep = new Upgrader(c, roomLinks);
      }
      else if (role === 'maintainer') {
        creep = new Maintainer(c);
      }
      else if (role === 'collector') {
        creep = new Collector(c);
        (creep as Collector).withdrawStorageMode = collectorWithdrawStorageMode;
        if (collectorWithdrawStorageMode) {
          creep.say("Withdraw")
        }
      } else if (role === 'claimer') {
        creep = new Claimer(c);
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
      Game.notify('Game.time = ' + Game.time + '\n' +
        'Creeps for loop error' + '\n' +
        'Creep name = ' + name + '\n' +
        'Creep role = ' + Game.creeps[name].memory.role + '\n' +
        'Error: ' + '\n' + e);
    }
  }

  // renew creeps
  for (const roomName in Game.rooms) {
    let beingRepairedCreep = beingRepairedCreeps.get(roomName);

    // repair
    if (beingRepairedCreep !== undefined) {
      const spawn = beingRepairedCreep.pos.findClosestByRange(FIND_MY_SPAWNS);

      if (spawn) {
        // recycle check
        if (beingRepairedCreep.memory.toRecycle === undefined) {
          for (const p of spawnParams) {
            if (p.spawn.name === spawn.name) {
              const roleParam = getRoleSpawnParamByName(beingRepairedCreep.memory.role, p);
              if (roleParam === null) {
                continue;
              }

              const paramParts = roleParam.parts.sort();
              const creepsParts = beingRepairedCreep.body.map(def => def.type).sort();

              if (paramParts.length !== creepsParts.length || paramParts.every((value, index) => value !== creepsParts[index])) {
                Game.notify("Recycle Creep Notification" + '\n' +
                  'Creep name = ' + beingRepairedCreep.name + '\n' +
                  "paramParts not equals creepsParts" + '\n' +
                  paramParts.sort().join(' ') + '\n' +
                  creepsParts.sort().join(' '));
                beingRepairedCreep.memory.toRecycle = true;
              } else {
                /*Game.notify("parts check test" + '\n' +
                  'Creep name = ' + beingRepairedCreep.name + '\n' +
                  "paramParts equals creepsParts" + '\n' +
                  paramParts.sort().join(' ') + '\n' +
                  creepsParts.sort().join(' '));*/
                beingRepairedCreep.memory.toRecycle = false;
              }
              break;
            }
          }

          if (beingRepairedCreep.memory.toRecycle === undefined) {
            beingRepairedCreep.memory.toRecycle = true;
          }
        }

        // recycle
        if (beingRepairedCreep.memory.toRecycle === true) {
          spawn.recycleCreep(beingRepairedCreep);
        }
        // renew
        else {
          if (spawn.renewCreep(beingRepairedCreep) === ERR_NOT_ENOUGH_ENERGY) {
            beingRepairedCreep.memory.waitingRepair = false;
            beingRepairedCreep.memory.beingRepaired = false;
            beingRepairedCreep.memory.toRecycle = undefined
          }
        }
      }
    }
    // set beingRepairedCreep
    else if (waitingRepairCreeps.has(roomName) && waitingRepairCreeps.get(roomName)!!.length) {
      beingRepairedCreep = waitingRepairCreeps.get(roomName)!![0];
      beingRepairedCreep.memory.beingRepaired = true;
      beingRepairedCreep.memory.waitingRepair = false;
    }
  }

  console.log('Tick ended')


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
      Game.notify('Game.time = ' + Game.time + '\n' + 'Error in getCollectorWithdrawStorageMode ' + spawn.name + '\n' + e);
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
