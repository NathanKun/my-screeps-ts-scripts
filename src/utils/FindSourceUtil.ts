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

    // already harvesting
    if (creep.memory.harvesting) {
      const source = Game.getObjectById(creep.memory.harvestSource) as Source;
      // if current source no more energy, find another one
      if (source.energy === 0) {
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
        filter: s => {
          if (s.energy === 0) {
            return false;
          }

          const x = s.pos.x;
          const y = s.pos.y;

          const left = x === 0 ? 0 : x - 1;
          const right = x === 49 ? 49 : x + 1;
          const top = y === 0 ? 0 : y - 1;
          const bottom = y === 49 ? 49 : y + 1;

          return creep.room.lookForAtArea(LOOK_CREEPS, top, left, bottom, right, true).length < 4;
        }
      });

      // if found, return a ramdom one
      if (sources.length) {
        const source = sources[Game.time % sources.length];
        creep.memory.harvesting = true;
        creep.memory.harvestSource = source.id;
        return source;
      }
      // if no source has energy, return the first source of the room
      else {
        return creep.room.find(FIND_SOURCES)[0];
      }
    }
  }

  public static clear(creep: Creep) {
    creep.memory.harvesting = false;
    creep.memory.harvestSource = undefined;
  }
}
