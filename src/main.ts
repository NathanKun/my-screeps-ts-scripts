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

  // spawn creeps params
  const spawnParams: SpawnParam[] = [{
    spawns: [Game.spawns['Spawn1'], Game.spawns['Spawn1.1']],
    harvester: {
      count: 1,
      parts: [
        WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
        MOVE, MOVE
      ]
    },
    harvesterExt: {
      count: 4,
      parts: [
        WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
        MOVE, MOVE, MOVE, MOVE, MOVE
      ],
      harvestRoom: 'W9S6'
    },
    builder: {
      count: 1,
      parts: [
        WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
        MOVE, MOVE
      ]
    },
    upgrader: {
      count: 3,
      parts: [
        WORK, WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
      ],
      upgraderUseStorageMin: 100000
    },
    maintainer: {
      count: -1,
      parts: [
        WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
        MOVE
      ]
    },
    collector: {
      count: -1,
      parts: [
        WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
        MOVE
      ]
    },
    claimer: {
      count: 1,
      parts: [CLAIM, MOVE],
      claimerRoom: 'W9S6',
      claimerAction: 'reserve'
    }
  },
  {
    spawns: [Game.spawns['Spawn2']],
    harvester: {
      count: 1,
      parts: [
        WORK, WORK, WORK, WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
    },
    harvesterExt: {
      count: 4,
      parts: [
        WORK, WORK, WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
      harvestRoom: 'W8S5',
      canAttack: false
    },
    builder: {
      count: 1,
      parts: [
        WORK, WORK, WORK, WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
    },
    upgrader: {
      count: 2,
      parts: [
        WORK, WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
      upgraderUseStorageMin: 30000
    },
    maintainer: {
      count: -1,
      parts: [
        WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
        MOVE, MOVE],
    },
    collector: {
      count: -1,
      parts: [
        WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
        MOVE, MOVE],
    },
    claimer: {
      count: 1,
      parts: [CLAIM, MOVE],
      claimerRoom: 'W8S5',
      claimerAction: 'reserve'
    }
  },
  {
    spawns: [Game.spawns['Spawn3']],
    harvester: {
      count: 1,
      parts: [
        WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE],
    },
    harvesterExt: {
      count: 4,
      parts: [
        WORK, WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
        MOVE, MOVE, MOVE, MOVE, MOVE],
      harvestRoom: 'W7S6',
      canAttack: false,
      harvesterExtPrimaryTransferTargets: {
        links: ["5d1bcab6b88799384c5fc414"]
      }
    },
    builder: {
      count: 1,
      parts: [
        WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
    },
    upgrader: {
      count: 1,
      parts: [
        WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
      upgraderUseStorageMin: 30000
    },
    maintainer: {
      count: -1,
      parts: [
        WORK, WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
    },
    collector: {
      count: -1,
      parts: [
        WORK, WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
      collectorWithdrawTargets: {
        links: ["5d1bcab6b88799384c5fc414"]
      }
    },
    claimer: {
      count: 1,
      parts: [CLAIM, MOVE],
      claimerRoom: 'W7S6',
      claimerAction: 'reserve'
    }
  }];

  const rooms: RoomConfig[] = [
    {
      room: Game.rooms['W9S7'],
      spawns: [Game.spawns['Spawn1'], Game.spawns['Spawn1.1']],
      collectorWithdrawStorageMode: getCollectorWithdrawStorageMode(spawnParams[0]),
      hasHostile: Game.spawns['Spawn1'].room.find(FIND_HOSTILE_CREEPS).length > 0
    },
    {
      room: Game.rooms['W9S5'],
      spawns: [Game.spawns['Spawn2']],
      collectorWithdrawStorageMode: getCollectorWithdrawStorageMode(spawnParams[1]),
      hasHostile: Game.spawns['Spawn2'].room.find(FIND_HOSTILE_CREEPS).length > 0
    },
    {
      room: Game.rooms['W8S6'],
      spawns: [Game.spawns['Spawn3']],
      collectorWithdrawStorageMode: getCollectorWithdrawStorageMode(spawnParams[2]),
      hasHostile: Game.spawns['Spawn3'].room.find(FIND_HOSTILE_CREEPS).length > 0
    }
  ];

  Game.rooms['W9S7'].memory.spawnParam = spawnParams[0];
  Game.rooms['W9S5'].memory.spawnParam = spawnParams[1];
  Game.rooms['W8S6'].memory.spawnParam = spawnParams[2];

  // rooms[0].collectorWithdrawStorageMode = true;
  // rooms[1].collectorWithdrawStorageMode = true;

  for (const roomConfig of rooms) {
    // structure being attack
    const spawn = roomConfig.spawns[0];
    if (spawn.room.find(FIND_MY_STRUCTURES, {
      filter: s => s.structureType !== STRUCTURE_RAMPART && s.hits !== s.hitsMax
    }).length) {
      const controller = spawn.room.controller;
      if (controller && controller.safeMode === undefined && controller.safeModeAvailable > 0) {
        controller.activateSafeMode();
      }
    }

    // energy
    const energyStructures: [StructureExtension, StructureSpawn] = roomConfig.room.find(FIND_MY_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION
    }) as [StructureExtension, StructureSpawn];

    let energy = 0;
    let energyCapacity = 0;

    energyStructures.forEach(s => {
      energy += s.energy;
      energyCapacity += s.energyCapacity;
    });

    roomConfig.room.memory.energy = energy;
    roomConfig.room.memory.energyCapacity = energyCapacity;;
    roomConfig.room.memory.energyPercentage = energy / energyCapacity;
  }

  // tower defense & repair
  TowerTask.run(Game.getObjectById('5ce5ab4e9917085da40c257a') as StructureTower);
  TowerTask.run(Game.getObjectById('5ceb0ce35a7eb776ba2e79fa') as StructureTower);

  TowerTask.run(Game.getObjectById('5cf6d44f1a35fd098d7d7ad5') as StructureTower);
  TowerTask.run(Game.getObjectById('5d004c75c0d974664ad4d35e') as StructureTower);

  TowerTask.run(Game.getObjectById('5d17c3713a42dc03d2042956') as StructureTower);
  TowerTask.run(Game.getObjectById('5d1bbb0b71b41e2a5c844bcb') as StructureTower);

  // spawn creeps
  SpawnHelper.spawn(spawnParams);

  // auto spawn attack creep and defense
  for (const roomConfig of rooms) {
    // has hostile, spawn def creep and attack hostile creeps in room
    if (roomConfig.hasHostile) {
      Attack.spawn(roomConfig.spawns[0], 'def', 1);
      Attack.attackCreeps(roomConfig.room.name, 'def');
      roomConfig.collectorWithdrawStorageMode = true;
    }
    // no hostile, recycle def creep
    else {
      // def creeps
      const defCreeps = _.filter(Game.creeps,
        (creep) => creep.memory.role === 'def' && creep.room.name === roomConfig.room.name);

      // recycle
      if (defCreeps.length) {
        for (const defCreep of defCreeps) {
          if (defCreep.ticksToLive !== undefined && defCreep.ticksToLive!! < 1350) {
            if (roomConfig.spawns[0].recycleCreep(defCreep) === ERR_NOT_IN_RANGE) {
              defCreep.moveTo(roomConfig.spawns[0]);
            }
          }
        }
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
          receiver: Game.getObjectById('5cf53c6d03632c664c611dce') as StructureLink,
          senderType: "cityCenter"
        }, {
          sender: Game.getObjectById('5cf543d960fc8009c45c72d3') as StructureLink,
          receiver: Game.getObjectById('5cf53c6d03632c664c611dce') as StructureLink,
          senderType: "cityCenter"
        }, {
          sender: Game.getObjectById('5d03e47bc2ac6453595fe392') as StructureLink,
          receiver: Game.getObjectById('5cf53c6d03632c664c611dce') as StructureLink,
          senderType: "cityCenter"
        }
      ]
    },
    {
      room: Game.rooms['W9S5'],
      links: [
        {
          sender: Game.getObjectById('5d0061ba63738f09b7810b80') as StructureLink,
          receiver: Game.getObjectById('5d0090631fe8da31ef52469c') as StructureLink,
          senderType: "cityCenter"
        },
        {
          sender: Game.getObjectById('5d0a7d41308228440a39201d') as StructureLink,
          receiver: Game.getObjectById('5d0090631fe8da31ef52469c') as StructureLink,
          senderType: "cityCenter"
        }
      ]
    },
    {
      room: Game.rooms['W8S6'],
      links: [
        {
          sender: Game.getObjectById('5d1bef377df56e6464adbd1c') as StructureLink,
          receiver: Game.getObjectById('5d1bcab6b88799384c5fc414') as StructureLink,
          senderType: "nextToExit"
        }
      ]
    }
  ];

  LinkUtil.transfer(roomLinks);

  // creeps work
  const waitingRepairCreeps = new Map<string, BaseCreep[]>();
  const beingRepairedCreeps = new Map<string, BaseCreep>();

  for (const name in Game.creeps) {
    try {
      const c = Game.creeps[name];
      if (c.memory.spawnTime === Game.time) {
        continue;
      }

      const creepRoom = _.filter(rooms, roomConfig => roomConfig.room.name === c.memory.room)[0];

      const role = c.memory.role;
      let creep: BaseCreep | null = null;

      if (role === 'harvester') {
        creep = new Harvester(c, creepRoom.hasHostile, roomLinks);
      }
      else if (role === 'harvesterExt') {
        creep = new Harvester(c, creepRoom.hasHostile, roomLinks);
      }
      else if (role === 'builder') {
        creep = new Builder(c);
      }
      else if (role === 'upgrader') {
        creep = new Upgrader(c, roomLinks);
      }
      else if (role === 'maintainer') {
        creep = new Maintainer(c);
        creep.memory.withdrawStorageMode = creepRoom.collectorWithdrawStorageMode;
      }
      else if (role === 'collector') {
        creep = new Collector(c);
        creep.memory.withdrawStorageMode = creepRoom.collectorWithdrawStorageMode;
        if (creepRoom.collectorWithdrawStorageMode) {
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
          let cRooms = waitingRepairCreeps.get(creep.room.name);
          if (cRooms === undefined) {
            cRooms = [];
          }
          cRooms.push(creep);
          waitingRepairCreeps.set(creep.room.name, cRooms);
        }
      }
    } catch (e) {
      const outText = ErrorMapper.sourceMappedStackTrace(e);
      Game.notify('Game.time = ' + Game.time + '\n' +
        'Creeps for loop error' + '\n' +
        'Creep name = ' + name + '\n' +
        'Creep role = ' + Game.creeps[name].memory.role + '\n' +
        'Error: ' + '\n' + e + '\n' + outText);
    }
  }

  // renew creeps
  for (const roomConfig of rooms) {
    const roomName = roomConfig.room.name;
    let beingRepairedCreep = beingRepairedCreeps.get(roomName);

    // repair
    if (beingRepairedCreep !== undefined) {
      const spawn = beingRepairedCreep.pos.findClosestByRange(FIND_MY_SPAWNS);

      if (spawn) {
        // recycle check
        /*if (beingRepairedCreep.memory.toRecycle === undefined) {
          for (const p of spawnParams) {
            if (p.spawns.map(s => s.name).indexOf(spawn.name) > -1) {
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
                beingRepairedCreep.memory.toRecycle = false;
              }
              break;
            }
          }

          if (beingRepairedCreep.memory.toRecycle === undefined) {
            beingRepairedCreep.memory.toRecycle = true;
          }
        }*/
        beingRepairedCreep.memory.toRecycle = true;

        // recycle
        if (beingRepairedCreep.memory.toRecycle === true) {
          spawn.recycleCreep(beingRepairedCreep);
          spawn.memory.renewingCreep = false;
        }
        // renew
        else {
          const renewResult = spawn.renewCreep(beingRepairedCreep);
          if (renewResult === OK) {
            spawn.memory.renewingCreep = true;
          } else {
            spawn.memory.renewingCreep = false;
            if (renewResult === ERR_NOT_ENOUGH_ENERGY) {
              beingRepairedCreep.memory.waitingRepair = false;
              beingRepairedCreep.memory.beingRepaired = false;
              beingRepairedCreep.memory.toRecycle = undefined;
            }
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


  console.log('Tick ended');


  function getCollectorWithdrawStorageMode(spawnParam: SpawnParam): boolean {
    const spawn = spawnParam.spawns[0];
    if (!spawn) {
      return false;
    }

    try {
      const capacity = spawn.room.memory.energyCapacity;
      const energy = spawn.room.memory.energy;

      const storageNotEmpty = spawn.room.find(FIND_MY_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_STORAGE && s.store.energy > 0
      }).length > 0;

      return ((energy / capacity < 0.2) ||
        spawn.room.memory.harvester < spawnParam.harvester.count ||
        spawn.room.memory.harvesterExt < spawnParam.harvesterExt.count)
        && storageNotEmpty;
    } catch (e) {
      const outText = ErrorMapper.sourceMappedStackTrace(e);
      Game.notify('Game.time = ' + Game.time + '\n' +
        'Error in getCollectorWithdrawStorageMode ' + spawn.name + '\n' + e + '\n ' + outText);
      return false;
    }
  }

  function getRoleSpawnParamByName(role: string, param: SpawnParam): RoleParam | null {
    switch (role) {
      case 'harvester':
        return param.harvester;
      case 'harvesterExt':
        return param.harvesterExt;
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
