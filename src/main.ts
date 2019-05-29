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

  // spawn creeps
  SpawnHelper.spawn({
    spawn: Game.spawns['Spawn1'],
    harvesterConfig: {
      base: 3,
      W9S6: 0
    },
    builder: -1,
    upgrader: 2,
    maintainer: 0,
    collector: 0,
    claimer: 1
  });

  const collectorWithdrawStorageMode = false;

  // Attack.spawn('t', 3);
  // Attack.spawn('h', 1);
  // Attack.moveRole(23, 17, 't');
  // Attack.moveRole(23, 17, 'h');
  // Attack.moveRole(14, 47, 'a');

  Attack.spawn('a', 1);
  if (!Attack.attackCreeps()) {
    if (!Attack.attackSpawn()) {
      Attack.attackStructures();
    }
  }

  // hostile creeps in room
  const hasHostile = Game.spawns['Spawn1'].room.find(FIND_HOSTILE_CREEPS).length > 0;

  const waitingRepairCreeps: BaseCreep[] = [];
  let beingRepairedCreep: BaseCreep | undefined;

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
        waitingRepairCreeps.push(creep)
      } else if (creep.memory.beingRepaired) {
        beingRepairedCreep = creep;
      }
    }
  }

  // renew creeps
  if (!Game.spawns['Spawn1'].spawning) {
    if (beingRepairedCreep !== undefined) {
      Game.spawns['Spawn1'].renewCreep(beingRepairedCreep.creep);
    } else if (waitingRepairCreeps.length) {
      beingRepairedCreep = waitingRepairCreeps[0];
      beingRepairedCreep.memory.beingRepaired = true;
      beingRepairedCreep.memory.waitingRepair = false;
      Game.spawns['Spawn1'].renewCreep(beingRepairedCreep.creep);
    }
  }

  // tower defense & repair
  TowerTask.run(Game.getObjectById('5ce5ab4e9917085da40c257a') as StructureTower);
  TowerTask.run(Game.getObjectById('5ceb0ce35a7eb776ba2e79fa') as StructureTower);

});
