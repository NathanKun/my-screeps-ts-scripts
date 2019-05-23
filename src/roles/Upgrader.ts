import { FindSourceUtil } from "utils/FindSourceUtil";

export class Upgrader {

  /** @param {Creep} creep */
  public static run(creep: Creep) {
    if (creep.memory.upgrading && creep.carry.energy === 0) {
      creep.memory.upgrading = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.upgrading && creep.carry.energy === creep.carryCapacity) {
      creep.memory.upgrading = true;
      FindSourceUtil.clear(creep);
      creep.say('⚡ upgrade');
    }

    // upgrade room controller
    if (creep.memory.upgrading) {
      if (creep.upgradeController(creep.room.controller!!) === ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller!!, { visualizePathStyle: { stroke: '#66ccff' } });
      }
    }
    // harvest
    else {
      const source = FindSourceUtil.findSource(creep);
      if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { visualizePathStyle: { stroke: '#ffffff' } });
      }
    }

    return false; // idle false, upgrader won't idle
  }
};
