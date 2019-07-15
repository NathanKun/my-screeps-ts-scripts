import { FindSourceUtil } from "utils/FindSourceUtil";
import { BaseCreep } from "./BaseCreep";
import { Collector } from "./Collector";

export class Maintainer extends BaseCreep {
  private static REPAIR_RATIO: number = 0.9;
  public static readonly WALL_REPAIRE_MAX_HITS = 400000;
  public static readonly RAMPART_REPAIRE_MAX_HITS = 600000;

  protected run() {
    if (this.memory.fullMaintainer === false) {
      // find if there is a collector work
      Collector.findCollectable(new Collector(this));

      if (this.memory.withdrawStorageMode) {
        this.memory.role = 'collector';
      }

      // if role is become collector, skip the rest code
      if (this.memory.role !== 'maintainer') {
        return;
      }
    }

    if (this.memory.reparing && this.carry.energy === 0) {
      this.memory.reparing = false;
      this.memory.reparingTarget = undefined;
      this.say('🔄 harvest');
    } else if (!this.memory.reparing && this.carry.energy === this.carryCapacity) {
      this.memory.reparing = true;
      FindSourceUtil.clear(this);
    }

    if (this.memory.reparing === undefined) {
      this.memory.reparing = false;
      this.memory.reparingTarget = undefined;
    }

    if (this.memory.reparing) {
      this.say('🔧');

      let target: Structure;

      if (this.memory.reparingTarget !== undefined) {
        target = Game.getObjectById(this.memory.reparingTarget) as Structure;
        if (target && target.hits >= target.hitsMax * Maintainer.REPAIR_RATIO) {
          this.memory.reparingTarget = undefined;
        }
      }

      if (this.memory.reparingTarget === undefined) {
        // containers
        let targets = this.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
            return (structure.structureType === STRUCTURE_CONTAINER && structure.hits < structure.hitsMax * Maintainer.REPAIR_RATIO);
          }
        }).sort((s1, s2) => s1.hits / s1.hitsMax - s2.hits / s2.hitsMax);

        // roads
        targets = this.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
            return (structure.structureType === STRUCTURE_ROAD && structure.hits < structure.hitsMax * Maintainer.REPAIR_RATIO);
          }
        }).sort((s1, s2) => s1.hits / s1.hitsMax - s2.hits / s2.hitsMax);

        // rampart & wall
        if (targets.length === 0) {
          targets = this.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
              return ((structure.structureType === STRUCTURE_RAMPART && structure.hits < Maintainer.RAMPART_REPAIRE_MAX_HITS * Maintainer.REPAIR_RATIO) ||
                (structure.structureType === STRUCTURE_WALL && structure.hits < Maintainer.WALL_REPAIRE_MAX_HITS * Maintainer.REPAIR_RATIO));
            }
          }).sort((s1, s2) => s1.hits - s2.hits);
        }

        if (targets.length) {
          target = targets[0];
          this.memory.reparingTarget = target.id;
        }

        // nothing needs to be repaired, upgrade controller
        else {
          if (this.upgradeController(this.room.controller!!) === ERR_NOT_IN_RANGE) {
            this.moveTo(this.room.controller!!, { visualizePathStyle: { stroke: '#66ccff' } });
          }
        }
      }

      if (this.repair(target!!) === ERR_NOT_IN_RANGE) {
        this.moveTo(target!!, { visualizePathStyle: { stroke: '#88ff88' } });
      }
    }
    // harvest
    else {
      const source = FindSourceUtil.findSource(this);
      if (this.harvest(source) === ERR_NOT_IN_RANGE) {
        this.moveTo(source, { visualizePathStyle: { stroke: '#ffffff' } });
      }
    }
  }
};
