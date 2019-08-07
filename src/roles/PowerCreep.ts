export class MyPowerCreep extends PowerCreep {

  constructor(name: string) {
    super(Game.powerCreeps[name].id);
  }

  public myMoveTo(x: number, y: number): void {
    this.moveTo(x, y);
  }

  public usePower(power: PowerConstant, target?: RoomObject): ScreepsReturnCode {
    if (this.canUsePower(power)) {
      const res = super.usePower(power, target);
      if (res === OK) {
        this.memory.powerLastUsed[power] = Game.time;
      }
      return res;
    }

    return ERR_TIRED;
  }

  public canUsePower(power: PowerConstant) {
    if (!this.memory.powerLastUsed) {
      this.memory.powerLastUsed = {};
    }
    const powerLastUsed = this.memory.powerLastUsed[power] ? this.memory.powerLastUsed[power] : 0;
    return Game.time > powerLastUsed + POWER_INFO[power].cooldown;
  }

  // Regenerate energy units in a source every 15 ticks
  // Effect duration 300 ticks. Cooldown 100 ticks. Range 3 squares.
  public canRegenSource(sourceId: string) {
    if (!this.memory.lastRegenSource) {
      this.memory.lastRegenSource = {};
    }
    const lastGenSourceTime = this.memory.lastRegenSource[sourceId] ? this.memory.lastRegenSource[sourceId] : 0;
    return Game.time > lastGenSourceTime + 275;
  }

  public regenSources(sourceId: string) {
    const source = Game.getObjectById(sourceId) as (Source | null);
    if (source) {
      const res = this.usePower(PWR_REGEN_SOURCE, source);
      if (res === ERR_NOT_IN_RANGE) {
        this.moveTo(source);
      } else if (res === OK) {
        this.memory.lastRegenSource[sourceId] = Game.time;
      } else {
        console.log("Regen Source Not OK: " + res);
      }
    } else {
      console.log("Regen Source Error: source " + sourceId + " not found");
    }
  }
}
