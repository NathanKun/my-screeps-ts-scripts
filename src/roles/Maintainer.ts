import { FindSourceUtil } from "utils/FindSourceUtil";
import { BaseCreep } from "./BaseCreep";

export class Maintainer extends BaseCreep {
  private static REPAIR_RATIO: number = 0.7;

  protected run() {
    let idle = true;

    if (this.creep.memory.reparing && this.creep.carry.energy === 0) {
      this.creep.memory.reparing = false;
      this.creep.memory.reparingTarget = undefined;
      this.creep.say('🔄 harvest');
    }
    if (!this.creep.memory.reparing && this.creep.carry.energy === this.creep.carryCapacity) {
      this.creep.memory.reparing = true;
      FindSourceUtil.clear(this.creep);
      this.creep.say('🚧 repair');
    }

    // repair roads
    if (this.creep.memory.reparing) {
      let target: Structure;

      if (this.creep.memory.reparingTarget !== undefined) {
        target = Game.getObjectById(this.creep.memory.reparingTarget) as Structure;

        if (target.hits >= target.hitsMax * Maintainer.REPAIR_RATIO) {
          this.creep.memory.reparingTarget = undefined;
        }
      }

      if (this.creep.memory.reparingTarget === undefined) {
        // rampart
        let targets = this.creep.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
            return (structure.structureType === STRUCTURE_RAMPART && structure.hits < structure.hitsMax * Maintainer.REPAIR_RATIO);
          }
        }).sort((s1, s2) => s1.hits - s2.hits);

        // wall
        if (targets.length === 0) {
          targets = this.creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
              return (structure.structureType === STRUCTURE_WALL && structure.hits < structure.hitsMax * Maintainer.REPAIR_RATIO);
            }
          }).sort((s1, s2) => s1.hits - s2.hits);
        }
        // roads
        if (targets.length === 0) {
          targets = this.creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
              return (structure.structureType === STRUCTURE_ROAD && structure.hits < structure.hitsMax * Maintainer.REPAIR_RATIO);
            }
          });
        }

        if (targets.length) {
          target = targets[0];
          this.creep.memory.reparingTarget = target.id;
        }
        // nothing needs to be repaired, upgrade controller
        else {
          if (this.creep.upgradeController(this.creep.room.controller!!) === ERR_NOT_IN_RANGE) {
            this.creep.moveTo(this.creep.room.controller!!, { visualizePathStyle: { stroke: '#66ccff' } });
          }
        }
      }

      if (this.creep.repair(target!!) === ERR_NOT_IN_RANGE) {
        this.creep.moveTo(target!!, { visualizePathStyle: { stroke: '#88ff88' } });
      }
      idle = false;
    }
    // harvest
    else {
      const source = FindSourceUtil.findSource(this.creep);
      if (this.creep.harvest(source) === ERR_NOT_IN_RANGE) {
        this.creep.moveTo(source, { visualizePathStyle: { stroke: '#ffffff' } });
      }
      idle = false;
    }

    return idle;
  }
};
