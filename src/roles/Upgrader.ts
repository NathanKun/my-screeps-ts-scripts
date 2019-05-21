export class Upgrader {

  /** @param {Creep} creep */
  public static run(creep: Creep) {
    if (creep.memory.upgrading && creep.carry.energy === 0) {
      creep.memory.upgrading = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.upgrading && creep.carry.energy === creep.carryCapacity) {
      creep.memory.upgrading = true;
      creep.say('⚡ upgrade');
    }

    // upgrade room controller
    if (creep.memory.upgrading) {
      if (creep.upgradeController(creep.room.controller!!) === ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller!!, { visualizePathStyle: { stroke: '#ffffff' } });
      }
    }
    // harvest
    else {
      const sources = creep.room.find(FIND_SOURCES);
      if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
      }
    }

    return false; // idle false, upgrader won't idle
  }
};
