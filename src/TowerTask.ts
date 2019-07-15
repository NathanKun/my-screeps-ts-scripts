import { ErrorMapper } from "utils/ErrorMapper";
import { Maintainer } from "roles/Maintainer";

export class TowerTask {
  private static runInternal(towers: StructureTower[]) {
    // attack
    const closestHostile = towers[0].pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
      towers.forEach(t => t.attack(closestHostile));
      return;
    }

    // heal
    // stop healing if energy < 350
    towers = towers.filter(t => t.energy >= 350);
    if (towers.length === 0) {
      return;
    }

    const creeps = towers[0].room.find(FIND_MY_CREEPS, {
      filter: c => c.hits < c.hitsMax
    });
    if (creeps.length) {
      const target = _.sortBy(creeps, s => s.hits / s.hitsMax)[0];
      towers.forEach(t => t.heal(target));
      return;
    }

    // repair
    // stop repairing if energy < 500
    towers = towers.filter(t => t.energy >= 500);
    if (towers.length === 0) {
      return;
    }

    // Hits:
    // wall: 300 000 000
    // rampart: 10 000 000
    // others: 1 000 - 5 000
    const structures = towers[0].room.find(FIND_STRUCTURES, {
      filter: structure => {
        // do not repair roads with hits > maxHits / 2
        if (structure.structureType === STRUCTURE_ROAD &&
          (structure.hits / structure.hitsMax) > 0.5) {
          return false;
        }
        // do not repair walls >= 300 000 and ramparts with hits >= 500 000
        else if (
          ((structure.structureType === STRUCTURE_WALL && structure.hits >= Maintainer.WALL_REPAIRE_MAX_HITS * 0.8) ||
            (structure.structureType === STRUCTURE_RAMPART && structure.hits >= Maintainer.RAMPART_REPAIRE_MAX_HITS * 0.8))
        ) {
          return false;
        } else {
          return structure.hits < structure.hitsMax;
        }
      }
    });

    if (structures.length) {
      const sortedStructures = _.sortBy(structures, s => {
        let hitsMax;

        switch (s.structureType) {
          case STRUCTURE_WALL:
            hitsMax = Maintainer.WALL_REPAIRE_MAX_HITS;
            break;
          case STRUCTURE_RAMPART:
            hitsMax = Maintainer.RAMPART_REPAIRE_MAX_HITS;
            break;
          default:
            hitsMax = s.hitsMax;
            break;
        }

        return s.hits / hitsMax;
      });

      towers.forEach(t => t.repair(sortedStructures[0]));
    }
  }

  public static run(towers: StructureTower[]) {
    if (towers.length === 0) {
      return;
    }

    try {
      TowerTask.runInternal(towers);
    } catch (e) {
      const outText = ErrorMapper.sourceMappedStackTrace(e);
      Game.notify('Game.time = ' + Game.time + '\n' + 'Error in TowerTask ' + towers.map(t => t.id).join(" ") +
        '\n' + e + '\n' + outText);
    }
  }
}
