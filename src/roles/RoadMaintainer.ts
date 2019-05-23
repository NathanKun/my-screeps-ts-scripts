export class RoadMaintainer {
  private static REPAIR_RATIO: number = 0.7;

  /** @param {Creep} creep */
  public static run(creep: Creep) {
    let idle = true;

    if (creep.memory.reparing && creep.carry.energy === 0) {
      creep.memory.reparing = false;
      creep.memory.reparingTarget = undefined;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.reparing && creep.carry.energy === creep.carryCapacity) {
      creep.memory.reparing = true;
      creep.say('🚧 repair');
    }

    // build construction site
    if (creep.memory.reparing) {
      let target: Structure;

      if (creep.memory.reparingTarget !== undefined) {
        target = Game.getObjectById(creep.memory.reparingTarget) as Structure;

        if (target.hits >= target.hitsMax * RoadMaintainer.REPAIR_RATIO) {
          creep.memory.reparingTarget = undefined;
        }
      }

      if (creep.memory.reparingTarget === undefined) {
        const targets = creep.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
            return (structure.structureType === STRUCTURE_ROAD && structure.hits < structure.hitsMax * RoadMaintainer.REPAIR_RATIO);
          }
        });

        if (targets.length) {
          target = targets[0];
          creep.memory.reparingTarget = target.id;
        } else {
          return; // idle
        }
      }

      if (creep.repair(target!!) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target!!, { visualizePathStyle: { stroke: '#88ff88' } });
      }
      idle = false;
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
