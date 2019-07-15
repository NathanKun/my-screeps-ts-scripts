import { Attack } from "Attack";
import { Parameters } from "Parameters";
import { PowerBankAction } from "PowerBankAction";
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
import { RoomMemoryUtil } from "utils/RoomMemoryUtil";


// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);
  let cpu = Game.cpu.getUsed();
  logCPU('start')

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
  logCPU('delete memory')

  const spawnParams = Parameters.spawnParams();
  spawnParams[0].spawns = [Game.spawns['Spawn1'], Game.spawns['Spawn1.1'], Game.spawns['Spawn1.2']];
  spawnParams[1].spawns = [Game.spawns['Spawn2'], Game.spawns['Spawn2.1']];
  spawnParams[2].spawns = [Game.spawns['Spawn3']];

  // rooms[0].collectorWithdrawStorageMode = true;
  logCPU('spawnParams')

  // init rooms
  const rooms = Parameters.rooms();
  for (const roomConfig of rooms) {

    // init room memory
    RoomMemoryUtil.initRoomMemory(roomConfig);
    Game.rooms['W9S7'].memory.spawnParam = spawnParams[0];
    Game.rooms['W9S5'].memory.spawnParam = spawnParams[1];
    Game.rooms['W8S6'].memory.spawnParam = spawnParams[2];

    roomConfig.collectorWithdrawStorageMode = Parameters.getCollectorWithdrawStorageMode(roomConfig.room.memory.spawnParam);

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

    // auto spawn attack creep and defense
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

      // recycle def creep
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

    // tower defense & repair
    TowerTask.run(roomConfig.room.memory.towers);

    // process power
    if (roomConfig.room.memory.powerSpawn && roomConfig.room.memory.powerSpawn.power) {
      roomConfig.room.memory.powerSpawn.processPower();
    }
  }
  logCPU('room init')

  // spawn creeps
  SpawnHelper.spawn(spawnParams);
  logCPU('spawn')

  // links
  const roomLinks = Parameters.roomLinks();
  LinkUtil.transfer(roomLinks);
  logCPU('link transfer')

  // creeps work
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
  logCPU('creeps work')

  // search power bank
  if (Parameters.observeRooms.length) {
    const obs = rooms[0].room.memory.observer;
    if (obs) {
      if (Memory.observeRoomsIndex === undefined) {
        Memory.observeRoomsIndex = 0;
      }

      // observed room
      const observedRoom = Game.rooms[Parameters.observeRooms[Memory.observeRoomsIndex]];
      if (observedRoom) {
        console.log("observedRoom = " + observedRoom.name);
        const bank = observedRoom.find(FIND_STRUCTURES, {
          filter: s => s.structureType === STRUCTURE_POWER_BANK
        }) as StructurePowerBank[];
        const power = observedRoom.find(FIND_DROPPED_RESOURCES, {
          filter: s => s.resourceType === RESOURCE_POWER
        }) as Resource<RESOURCE_POWER>[];

        // found, start power bank action
        if (bank.length || power.length || (Memory.powerbank && Memory.powerbank.finished === false)) {
          console.log("-----POWER BANK-----")
          //PowerBankAction.do(bank, power, rooms[0].spawns);
          console.log("-----POWER BANK END-----")
        }
        // not found, index++
        else {
          Memory.observeRoomsIndex++;
          if (Parameters.observeRooms.length === Memory.observeRoomsIndex) {
            Memory.observeRoomsIndex = 0;
          }
        }
      }

      // observe next room
      obs.observeRoom(Parameters.observeRooms[Memory.observeRoomsIndex]);
    }
  }
  logCPU('power bank action')

  Attack.attackById('5bcb6c43be9c135918381909', 'powera_1');
  Attack.attackById('5bcb6c43be9c135918381909', 'powera_2');

  console.log('Tick ended');

  function logCPU(job: string) {
    const newCpu = Game.cpu.getUsed();
    console.log('cpu use ' + (newCpu - cpu) + ' for ' + job);
    cpu = newCpu;
  }

});
