import { FindSourceUtil } from "utils/FindSourceUtil";

export class Harvester {
  /** @param {Creep} creep */
  public static run(creep: Creep, hasHostile: boolean) {

    if (creep.memory.transfering && creep.carry.energy === 0) {
      creep.memory.transfering = false;
      creep.memory.transferTarget = undefined;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.transfering && creep.carry.energy === creep.carryCapacity) {
      creep.memory.transfering = true;
      FindSourceUtil.clear(creep);
      creep.say('🚧 transfer');
    }

    // transfer
    if (creep.memory.transfering) {
      // has hostile: charge towers
      if (hasHostile) {
        if (creep.memory.transferTarget === undefined) {
          const towers = Harvester.findTowers(creep).sort( (t1, t2) => t1.energy - t2.energy);
          creep.memory.transferTarget = towers[0].id;
        }
        const tower = Game.getObjectById(creep.memory.transferTarget) as StructureTower;
        if (creep.transfer(tower, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(tower, { reusePath: 2, visualizePathStyle: { stroke: '#ff0000' } });
        }
      }
      // no hostile
      else {
        let targets: AnyStructure[];

        // prior find spwans and extensions
        targets = Harvester.findSpawnsAndExtensions(creep);

        // find towers
        if (targets.length === 0) {
          targets = Harvester.findTowers(creep);
        }

        if (targets.length > 0) {
          if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], { reusePath: 2, visualizePathStyle: { stroke: '#ffaa00' } });
          }
        }
        // nothing to do, upgrade room controller
        else {
          if (creep.upgradeController(creep.room.controller!!) === ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller!!, { visualizePathStyle: { stroke: '#66ccff' } });
          }
        }
      }
    }
    // harvest
    else {
      const source = FindSourceUtil.findSource(creep);
      if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { reusePath: 2, visualizePathStyle: { stroke: '#ffffff' } });
      }
    }
  }

  private static findSpawnsAndExtensions(creep: Creep) {
    return creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType === STRUCTURE_EXTENSION ||
          structure.structureType === STRUCTURE_SPAWN) &&
          structure.energy < structure.energyCapacity;
      }
    });
  }

  private static findTowers(creep: Creep): StructureTower[] {
    return creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType === STRUCTURE_TOWER &&
          structure.energy < (structure.energyCapacity - creep.carry.energy);
      }
    }) as StructureTower[];
  }
};
