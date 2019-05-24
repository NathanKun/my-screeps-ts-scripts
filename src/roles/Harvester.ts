import { FindSourceUtil } from "utils/FindSourceUtil";

export class Harvester {
  /** @param {Creep} creep */
  public static run(creep: Creep) {

    if (creep.memory.transfering && creep.carry.energy === 0) {
      creep.memory.transfering = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.transfering && creep.carry.energy === creep.carryCapacity) {
      creep.memory.transfering = true;
      FindSourceUtil.clear(creep);
      creep.say('🚧 transfer');
    }

    // transfer
    if (creep.memory.transfering) {
      // prior transfer to spawn or extensions
      let targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType === STRUCTURE_EXTENSION ||
            structure.structureType === STRUCTURE_SPAWN) &&
            structure.energy < structure.energyCapacity;
        }
      });

      // transfer to tower
      if (targets.length === 0) {
        targets = creep.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
            return structure.structureType === STRUCTURE_TOWER &&
              structure.energy < (structure.energyCapacity - creep.carry.energy);
          }
        });
      }

      if (targets.length > 0) {
        if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffaa00' } });
        }
      }
      // nothing to do, upgrade room controller
      else {
        if (creep.upgradeController(creep.room.controller!!) === ERR_NOT_IN_RANGE) {
          creep.moveTo(creep.room.controller!!, { visualizePathStyle: { stroke: '#66ccff' } });
        }
      }
    }
    // harvest
    else {
      const source = FindSourceUtil.findSource(creep);
      if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { visualizePathStyle: { stroke: '#ffffff' } });
      }
    }
  }
};
