export abstract class BaseCreep {
  public creep: Creep;
  public memory: CreepMemory;

  constructor(c: Creep) {
    this.creep = c;
    this.memory = c.memory;
  }

  public work(): void {
    this.repair();
    if (!(this.creep.memory.beingRepaired || this.creep.memory.waitingRepair)) {
      this.run();
    }
  }

  protected repair(): void {
    if (this.creep.ticksToLive!! < 100) {
      this.creep.moveTo(Game.spawns['Spawn1']);
      this.creep.memory.waitingRepair = true;
    } else if (this.creep.ticksToLive!! > 1400) {
      this.creep.memory.beingRepaired = false;
    }
  }

  protected abstract run(): void;
}
