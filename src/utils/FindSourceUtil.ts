export class FindSourceUtil {
  private static harvesterLimiteMap: any = { '5bbcac809099fc012e635913': 1 };

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

    // already harvesting
    if (creep.memory.harvesting) {
      const source = Game.getObjectById(creep.memory.harvestSource) as (Source | null);

      // if current source no more energy, find another one
      // creep is still far from source and source is cached > 35 ticks ago, revalidate source
      if (source === null || source.energy === 0 || (creep.memory.cacheTime && Game.time - creep.memory.cacheTime > 5 && creep.pos.getRangeTo(source) > 3 && !FindSourceUtil.validateSource(source))) {
        FindSourceUtil.clear(creep);
        return FindSourceUtil.findSource(creep);
      }
      // else return current source
      return source;
    }
    // not harvesting
    else {
      // find sources which have energy
      const sources = creep.room.find(FIND_SOURCES, {
        filter: s => FindSourceUtil.validateSource(s)
      });

      // if found, return a random one
      if (sources.length) {
        const source = sources[Game.time % sources.length];
        creep.memory.harvesting = true;
        creep.memory.harvestSource = source.id;
        creep.memory.cacheTime = Game.time;
        return source;
      }
      // if no source has energy, return the first source of the room
      else {
        return creep.room.find(FIND_SOURCES)[0];
      }
    }
  }

  private static validateSource(s: Source) {
    if (s === undefined || s === null || s.energy === 0) {
      return false;
    }

    const x = s.pos.x;
    const y = s.pos.y;

    const left = x === 0 ? 0 : x - 1;
    const right = x === 49 ? 49 : x + 1;
    const top = y === 0 ? 0 : y - 1;
    const bottom = y === 49 ? 49 : y + 1;

    const harvesterLimite = FindSourceUtil.harvesterLimiteMap.hasOwnProperty(s.id) ? FindSourceUtil.harvesterLimiteMap[s.id] : 4;

    return s.room.lookForAtArea(LOOK_CREEPS, top, left, bottom, right, true).length < harvesterLimite;
  }

  public static clear(creep: Creep) {
    creep.memory.harvesting = false;
    delete creep.memory.harvestSource;
    delete creep.memory.cacheTime
  }
}
