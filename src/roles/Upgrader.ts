import { FindSourceUtil } from "utils/FindSourceUtil";
import { BaseCreep } from "./BaseCreep";

export class Upgrader extends BaseCreep{

  protected run() {
    if (this.creep.memory.upgrading && this.creep.carry.energy === 0) {
      this.creep.memory.upgrading = false;
      this.creep.say('🔄 harvest');
    }
    if (!this.creep.memory.upgrading && this.creep.carry.energy === this.creep.carryCapacity) {
      this.creep.memory.upgrading = true;
      FindSourceUtil.clear(this.creep);
      this.creep.say('⚡ upgrade');
    }

    // upgrade room controller
    if (this.creep.memory.upgrading) {
      if (this.creep.upgradeController(this.creep.room.controller!!) === ERR_NOT_IN_RANGE) {
        this.creep.moveTo(this.creep.room.controller!!, { visualizePathStyle: { stroke: '#66ccff' } });
      }
    }
    // harvest
    else {
      const source = FindSourceUtil.findSource(this.creep);
      if (this.creep.harvest(source) === ERR_NOT_IN_RANGE) {
        this.creep.moveTo(source, { visualizePathStyle: { stroke: '#ffffff' } });
      }
    }
  }
};
