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
    if (this.ticksToLive && this.ticksToLive > 1400) {
      this.memory.beingRepaired = false;
      this.memory.waitingRepair = false;
      this.memory.toRecycle = undefined;
    } else if (this.memory.waitingRepair || (this.ticksToLive && this.ticksToLive < 75)) {
      if (this.room.name === this.memory.room) {
        const spawn = this.pos.findClosestByPath(FIND_MY_SPAWNS);
        if (spawn && !spawn.spawning) {
          this.moveTo(spawn);
          this.memory.waitingRepair = true;
        } else {
          this.memory.waitingRepair = false;
        }
      } else {
        const exitDir = this.room.findExitTo(this.memory.room) as (FIND_EXIT_TOP | FIND_EXIT_RIGHT | FIND_EXIT_BOTTOM | FIND_EXIT_LEFT);
        const exit = this.pos.findClosestByRange(exitDir);
        this.moveTo(exit!!, { reusePath: 15, visualizePathStyle: { stroke: '#ffaa00' } });
      }
    }
  }

  protected abstract run(): void;
}
