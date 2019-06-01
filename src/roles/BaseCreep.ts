export abstract class BaseCreep {
  public creep: Creep;
  public memory: CreepMemory;
  public roomName: string;

  constructor(c: Creep) {
    this.creep = c;
    this.memory = c.memory;
    this.roomName = c.room.name;
  }

  public work(): void {
    this.repair();
    if (!(this.creep.memory.beingRepaired || this.creep.memory.waitingRepair)) {
      this.run();
    }
  }

  protected repair(): void {
    if (this.creep.ticksToLive!! < 100) {
      const spawn = this.creep.pos.findClosestByPath(FIND_MY_SPAWNS);
      if (spawn) {
        this.creep.moveTo(spawn);
        this.creep.memory.waitingRepair = true;
      }
    } else if (this.creep.ticksToLive!! > 1450) {
      this.creep.memory.beingRepaired = false;
    }
  }

  protected abstract run(): void;
}
