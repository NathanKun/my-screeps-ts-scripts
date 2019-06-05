export abstract class BaseCreep extends Creep {
  constructor(creep: Creep) {
    super(creep.id);
  }

  public work(): void {
    this.repairCheck();
    if (!(this.memory.beingRepaired || this.memory.waitingRepair)) {
      this.run();
    }
  }

  protected repairCheck(): void {
    if (this.ticksToLive && this.ticksToLive < 100) {
      const spawn = this.pos.findClosestByPath(FIND_MY_SPAWNS);
      if (spawn) {
        this.moveTo(spawn);
        this.memory.waitingRepair = true;
      }
    } else if (this.ticksToLive && this.ticksToLive > 1400) {
      this.memory.beingRepaired = false;
      this.memory.waitingRepair = false;
      this.memory.toRecycle = undefined;
    }
  }

  protected abstract run(): void;
}
