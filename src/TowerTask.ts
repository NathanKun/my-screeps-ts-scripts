export class TowerTask {
  public static run(tower: StructureTower) {

    // attack
    const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
      tower.attack(closestHostile);
      return;
    }

    // heal
    // stop healing if energy < 100
    if (tower.energy < 350) {
      return;
    }
    const creeps = tower.room.find(FIND_MY_CREEPS, {
      filter: c => c.hits < c.hitsMax
    });
    if (creeps.length) {
      const target = _.sortBy(creeps, s => s.hits / s.hitsMax)[0];
      tower.heal(target);
      return;
    }

    // repair
    // stop repairing if energy < 200
    if (tower.energy < 500) {
      return;
    }
    // Hits:
    // wall: 300 000k
    // rampart: 3 000k
    // others: 1k - 5k
    const structures = tower.room.find(FIND_STRUCTURES, {
      filter: structure => {
        // do not repair normal roads with hits > 2500
        if (structure.structureType === STRUCTURE_ROAD && structure.hitsMax === 5000 && structure.hits > 2500) {
          return false;
        }
        // do not repair walls with hits >= 1M
        else if (structure.structureType === STRUCTURE_WALL && structure.hits >= 1000000) {
          return false;
        } else {
          return structure.hits < structure.hitsMax;
        }
      }
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
      /*sortedStructures.forEach((s, i) => {
        console.log(s.structureType + "  \t  " + s.hits + "  \t  " + s.hitsMax + "  \t  " + i);
      });*/
      const target = sortedStructures[0];
      tower.repair(target);
      return;
    }
  }
}
