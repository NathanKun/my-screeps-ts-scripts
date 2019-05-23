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
    }
    // harvest
    else {
      const sources = creep.room.find(FIND_SOURCES);
      if (creep.harvest(sources[1]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[1], { visualizePathStyle: { stroke: '#ffffff' } });
      }
      idle = false;
    }

    return idle;
  }
};
