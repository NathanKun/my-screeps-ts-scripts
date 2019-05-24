import { FindSourceUtil } from "utils/FindSourceUtil";

export class Builder {

  /** @param {Creep} creep */
  public static run(creep: Creep) {
    let idle = true;

    if (creep.memory.building && creep.carry.energy === 0) {
      creep.memory.building = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.building && creep.carry.energy === creep.carryCapacity) {
      creep.memory.building = true;
      FindSourceUtil.clear(creep);
      creep.say('🚧 build');
    }

    // build construction site
    if (creep.memory.building) {

      // build extension and spawn first
      let targets = creep.room.find(FIND_CONSTRUCTION_SITES, {
        filter: (structure) => {
          return (structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN);
        }
      });

      // then build others
      if (targets.length === 0) {
        targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      }

      if (targets.length) {
        if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffff66' } });
        }
        idle = false;
      }
      // nothing to build, upgrade room controller
      else {
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
