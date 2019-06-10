import { BaseCreep } from "./BaseCreep";

export class Claimer extends BaseCreep {

  public work(): void {
    this.run();
  }

  protected run() {
    if (this.memory.claimerRoom && this.memory.claimerAction) {
      if (this.room.name !== this.memory.claimerRoom) {
        this.moveTo(new RoomPosition(20, 20, this.memory.claimerRoom));
        return;
      }

      const targetController = this.room.controller;
      if (targetController) {
        let result;
        switch (this.memory.claimerAction) {
          case 'reserve':
            result = this.reserveController(targetController);
            break;
          case 'attack':
            result = this.reserveController(targetController);
            break;
          case 'claim':
            result = this.reserveController(targetController);
            break;
        }

        if (result === ERR_NOT_IN_RANGE) {
          this.moveTo(targetController);
        } else if (result !== 0) {
          console.log('claimer action = ' + this.memory.claimerAction + ' result = ' + result);
        }
      } else {
        this.say('No controller found');
      }
    } else {
      this.say('???');
    }
  }
}
