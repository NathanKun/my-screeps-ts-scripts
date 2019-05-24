export class FindSourceUtil {
  public static findSource(creep: Creep): Source {
    /*const creeps = Game.creeps;

    const sourceToCountMap = new Map<string, number>();
    for (const name in creeps) {
      const c = Memory.creeps[name];
      if (c.harvesting) {
        if (!sourceToCountMap.has(c.harvestSource!!)) {
          sourceToCountMap.set(c.harvestSource!!, 1);
        } else {
          sourceToCountMap.set(c.harvestSource!!, sourceToCountMap.get(c.harvestSource!!)!! + 1);
        }
      }
    }*/

    if (creep.memory.harvesting) {
      return Game.getObjectById(creep.memory.harvestSource) as Source;
    } else {
      const sources = creep.room.find(FIND_SOURCES, {
        filter: s => s.energy > 0
      });
      const source = sources[Game.time % sources.length];
      creep.memory.harvesting = true;
      creep.memory.harvestSource = source.id;
      return source;
    }
  }

  public static clear(creep: Creep) {
    creep.memory.harvesting = false;
    creep.memory.harvestSource = undefined;
  }
}
