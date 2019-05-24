export class TowerTask {
  public static run(tower: StructureTower) {

    // attack
    const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
      tower.attack(closestHostile);
      return;
    }

    // repair
    // Hits:
    // wall: 300 000k
    // rampart: 3 000k
    // others: 1k - 5k
    const structures = tower.room.find(FIND_STRUCTURES, {
      filter: structure => structure.hits < structure.hitsMax
    });

    if (structures.length) {
      const sortedStructures = _.sortBy(structures, s => {
        let res = s.hits / s.hitsMax;
        if (s.hitsMax <= 10000) {
          // not changed
        } else if (s.hitsMax > 10000 && s.hitsMax <= 1000000) {
          res *= 100;
        } else if (s.hitsMax > 1000000 && s.hitsMax <= 100000000) {
          res *= 1000;
        } else {
          res *= 100000;
        }
        // console.log(s.structureType + "  \t  " + s.hits + "  \t  " + s.hitsMax + "  \t  " + res);
        return res;
      });
      sortedStructures.forEach((s, i) => {
        console.log(s.structureType + "  \t  " + s.hits + "  \t  " + s.hitsMax + "  \t  " + i);
      });
      const target = sortedStructures[0];
      tower.repair(target);
      return;
    }

    // heal
    const creeps = tower.room.find(FIND_MY_CREEPS, {
      filter: c => c.hits < c.hitsMax
    });
    if (creeps.length) {
      const target = _.sortBy(creeps, s => s.hits / s.hitsMax)[0];
      tower.heal(target);
      return;
    }
  }
}
