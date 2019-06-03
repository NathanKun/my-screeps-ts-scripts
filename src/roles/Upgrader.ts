import { FindSourceUtil } from "utils/FindSourceUtil";
import { BaseCreep } from "./BaseCreep";

export class Upgrader extends BaseCreep{

  protected run() {
    if (this.memory.upgrading && this.carry.energy === 0) {
      this.memory.upgrading = false;
      this.say('🔄 harvest');
    }
    if (!this.memory.upgrading && this.carry.energy === this.carryCapacity) {
      this.memory.upgrading = true;
      FindSourceUtil.clear(this);
      this.say('⚡ upgrade');
    }

    // upgrade room controller
    if (this.memory.upgrading) {
      if (this.upgradeController(this.room.controller!!) === ERR_NOT_IN_RANGE) {
        this.moveTo(this.room.controller!!, { visualizePathStyle: { stroke: '#66ccff' } });
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
