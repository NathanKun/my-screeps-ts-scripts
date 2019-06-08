import { FindSourceUtil } from "utils/FindSourceUtil";
import { BaseCreep } from "./BaseCreep";

export class Builder extends BaseCreep {

  protected run() {
    if (this.memory.harvestRoom === 'W9S5' && this.room.name !== 'W9S5') {
      this.moveTo(new RoomPosition(20, 20, 'W9S5'));
      return;
    }

    let idle = true;

    if (this.memory.building && this.carry.energy === 0) {
      this.memory.building = false;
      this.say('🔄 harvest');
    }
    if (!this.memory.building && this.carry.energy === this.carryCapacity) {
      this.memory.building = true;
      FindSourceUtil.clear(this);
      this.say('🚧 build');
    }

    // build construction site
    if (this.memory.building) {

      // build extension and spawn first
      let targets = this.room.find(FIND_CONSTRUCTION_SITES, {
        filter: (structure) => {
          return (structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN);
        }
      });

      // then build others
      if (targets.length === 0) {
        targets = this.room.find(FIND_CONSTRUCTION_SITES);
      }

      if (targets.length) {
        if (this.build(targets[0]) === ERR_NOT_IN_RANGE) {
          this.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffff66' } });
        }
        idle = false;
      }
      // nothing to build, upgrade room controller
      else {
        if (this.upgradeController(this.room.controller!!) === ERR_NOT_IN_RANGE) {
          this.moveTo(this.room.controller!!, { maxRooms: 0, visualizePathStyle: { stroke: '#66ccff' } });
          idle = false;
        }
      }
    }
    // harvest
    else {
      const source = FindSourceUtil.findSource(this);
      if (this.harvest(source) === ERR_NOT_IN_RANGE) {
        this.moveTo(source, { visualizePathStyle: { stroke: '#ffffff' } });
      }
      idle = false;
    }

    return idle;
  }
};
