export class TowerTask {
  private static runInternal(tower: StructureTower) {
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
    // wall: 300 000 000
    // rampart: 10 000 000
    // others: 1 000 - 5 000
    const structures = tower.room.find(FIND_STRUCTURES, {
      filter: structure => {
        // do not repair roads with hits > maxHits / 2
        if (structure.structureType === STRUCTURE_ROAD &&
          (structure.hits / structure.hitsMax) > 0.5) {
          return false;
        }
        // do not repair walls >= 300 000 and ramparts with hits >= 500 000
        else if (
          ((structure.structureType === STRUCTURE_WALL && structure.hits >= 300000) ||
            (structure.structureType === STRUCTURE_RAMPART && structure.hits >= 500000))
        ) {
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

  public static run(tower: StructureTower) {
    try {
      TowerTask.runInternal(tower);
    } catch (e) {
      Game.notify('Game.time = ' + Game.time + '\n' + 'Error in TowerTask ' + tower.id + '\n' + e);
    }
  }
}
