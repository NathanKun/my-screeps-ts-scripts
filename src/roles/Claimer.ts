import { BaseCreep } from "./BaseCreep";

export class Claimer extends BaseCreep {

  public work(): void {
    this.run();
  }

  protected run() {
    if (this.creep.room.name !== 'W9S6') {
      this.creep.moveTo(new RoomPosition(20, 20, 'W9S6'));
      return;
    }
    
    const targetController = Game.getObjectById('5bbcac629099fc012e63560a') as StructureController
    const result = this.creep.attackController(targetController);
    if (result === ERR_NOT_IN_RANGE) {
      this.creep.moveTo(targetController);
    } else if (result !== 0) {
      console.log('attackController result = ' + result);
    }
  }
}
