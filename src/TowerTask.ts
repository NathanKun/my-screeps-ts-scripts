export class TowerTask {
  public static run(tower: StructureTower) {

    // attack
    const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
      tower.attack(closestHostile);
      return;
    }

    // repair
    const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (structure) => structure.hits < structure.hitsMax * 0.6
    });
    if (closestDamagedStructure) {
      tower.repair(closestDamagedStructure);
    }

  }
}
