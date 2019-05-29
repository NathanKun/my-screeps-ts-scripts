import { BaseCreep } from "./BaseCreep";

export class Claimer extends BaseCreep {

  public work(): void {
    this.run();
  }

  protected run() {
    const targetController = Game.getObjectById('5bbcac629099fc012e63560a') as StructureController
    const result = this.creep.attackController(targetController);
    if (result === ERR_NOT_IN_RANGE) {
      this.creep.moveTo(targetController);
    } else if (result !== 0) {
      console.log('attackController result = ' + result);
    }
  }
}
