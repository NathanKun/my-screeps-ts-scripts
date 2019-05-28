import { FindSourceUtil } from "utils/FindSourceUtil";
import { BaseCreep } from "./BaseCreep";

export class Builder extends BaseCreep {

  protected run() {
    let idle = true;

    if (this.creep.memory.building && this.creep.carry.energy === 0) {
      this.creep.memory.building = false;
      this.creep.say('🔄 harvest');
    }
    if (!this.creep.memory.building && this.creep.carry.energy === this.creep.carryCapacity) {
      this.creep.memory.building = true;
      FindSourceUtil.clear(this.creep);
      this.creep.say('🚧 build');
    }

    // build construction site
    if (this.creep.memory.building) {

      // build extension and spawn first
      let targets = this.creep.room.find(FIND_CONSTRUCTION_SITES, {
        filter: (structure) => {
          return (structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN);
        }
      });

      // then build others
      if (targets.length === 0) {
        targets = this.creep.room.find(FIND_CONSTRUCTION_SITES);
      }

      if (targets.length) {
        if (this.creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
          this.creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffff66' } });
        }
        idle = false;
      }
      // nothing to build, upgrade room controller
      else {
        if (this.creep.upgradeController(this.creep.room.controller!!) === ERR_NOT_IN_RANGE) {
          this.creep.moveTo(this.creep.room.controller!!, { visualizePathStyle: { stroke: '#66ccff' } });
          idle = false;
        }
      }
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
