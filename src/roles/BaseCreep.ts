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
        this.memory.waitingRepair = true;
      }
    }
  }

  protected abstract run(): void;

  protected findExtensions(): StructureExtension[] {
    return this.room.memory.notFullExtensions.sort((s1, s2) =>
      this.pos.getRangeTo(s1.pos.x, s1.pos.y) - this.pos.getRangeTo(s2.pos.x, s2.pos.y));
  }

  protected findSpawns(): StructureSpawn[] {
    return this.room.memory.notFullSpawns.sort((s1, s2) =>
      this.pos.getRangeTo(s1.pos.x, s1.pos.y) - this.pos.getRangeTo(s2.pos.x, s2.pos.y));
  }

  protected findStorage(): StructureStorage[] {
    const storage = this.room.memory.storage;
    if (storage) {
      return [storage];
    }
    return [];
  }

  protected findTerminal(): StructureTerminal[] {
    const terminal = this.room.memory.terminal;
    if (terminal) {
      return [terminal];
    }
    return [];
  }

  protected findPowerSpawn(): StructurePowerSpawn[] {
    const powerSpawn = this.room.memory.powerSpawn;
    if (powerSpawn) {
      return [powerSpawn];
    }
    return [];
  }

  protected findNuker(): StructureNuker[] {
    const nuker = this.room.memory.nuker;
    if (nuker) {
      return [nuker];
    }
    return [];
  }

  protected findTowers(maxEnergy: number): StructureTower[] {
    return this.room.memory.towers.filter(
      structure => structure.structureType === STRUCTURE_TOWER && structure.energy <= maxEnergy
    ).sort((s1, s2) => s1.energy - s2.energy);
  }
}
