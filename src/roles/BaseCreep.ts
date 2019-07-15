export abstract class BaseCreep extends Creep {
  constructor(creep: Creep) {
    super(creep.id);
  }

  public work(): void {
    if (this.dyingCheck()) {
      this.run();
    }
  }

  private dyingCheck() {
    if ((this.ticksToLive && this.ticksToLive < 75) || this.memory.toRecycle) {
      if (this.room.name === this.memory.room) {
        const spawn = Game.spawns[this.room.memory.spawnParam.spawns[0].name];
        if (this.pos.getRangeTo(spawn) > 1) {
          this.moveTo(spawn);
        } else {
          spawn.recycleCreep(this);
        }
      } else {
        const exitDir = this.room.findExitTo(this.memory.room) as (FIND_EXIT_TOP | FIND_EXIT_RIGHT | FIND_EXIT_BOTTOM | FIND_EXIT_LEFT);
        const exit = this.pos.findClosestByRange(exitDir);
        this.moveTo(exit!!, { reusePath: 15, visualizePathStyle: { stroke: '#ffaa00' } });
      }
      this.memory.toRecycle = true;
      return false;
    }
    return true;
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
    const storage = this.room.storage;
    if (storage && storage.store.energy < storage.storeCapacity) {
      return [storage];
    }
    return [];
  }

  protected findNotFullTerminal(): StructureTerminal[] {
    const terminal = this.room.terminal;
    if (terminal && terminal.store.energy < terminal.storeCapacity) {
      return [terminal];
    }
    return [];
  }

  protected findNotFullPowerSpawn(): StructurePowerSpawn[] {
    const powerSpawn = this.room.memory.powerSpawn;
    if (powerSpawn && powerSpawn.energy < powerSpawn.energyCapacity) {
      return [powerSpawn];
    }
    return [];
  }

  protected findNotFullNuker(): StructureNuker[] {
    const nuker = this.room.memory.nuker;
    if (nuker && nuker.energy < nuker.energyCapacity) {
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
