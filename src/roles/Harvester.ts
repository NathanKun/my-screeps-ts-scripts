import { FindSourceUtil } from "utils/FindSourceUtil";

export class Harvester {

  /** @param {Creep} creep */
  public static run(creep: Creep) {
    let idle = true;

    // transfer
    if (creep.carry.energy === creep.carryCapacity) {
      FindSourceUtil.clear(creep);

      const targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType === STRUCTURE_EXTENSION ||
            structure.structureType === STRUCTURE_SPAWN ||
            structure.structureType === STRUCTURE_TOWER) &&
            structure.energy < structure.energyCapacity;
        }
      });

      if (targets.length > 0) {
        if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffaa00' } });
        }
        idle = false;
      }
      else {
        // nothing to do, upgrade room controller
        if (creep.upgradeController(creep.room.controller!!) === ERR_NOT_IN_RANGE) {
          creep.moveTo(creep.room.controller!!, { visualizePathStyle: { stroke: '#66ccff' } });
          idle = false;
        }
      }
    }
    // harvest
    else {
      const source = FindSourceUtil.findSource(creep);
      if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { visualizePathStyle: { stroke: '#ffffff' } });
      }
      idle = false;
    }

    return idle;
  }
};
