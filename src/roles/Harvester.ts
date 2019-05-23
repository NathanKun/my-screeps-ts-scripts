export class Harvester {

  /** @param {Creep} creep */
  public static run(creep: Creep) {
    let idle = true;

    // transfer
    if (creep.carry.energy === creep.carryCapacity) {
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
        // stay next to the spwan, do not block the way
        creep.moveTo(Game.spawns["Spawn1"].pos, { visualizePathStyle: { stroke: '#ff0000' } });
      }
    }
    // harvest
    else {
      const sources = creep.room.find(FIND_SOURCES);
      if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffffff' } });
      }
      idle = false;
    }

    return idle;
  }
};
