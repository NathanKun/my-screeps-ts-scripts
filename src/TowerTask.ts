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
      return;
    }

    // heal
    const closestDamagedCreep = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
      filter: (c) => c.hits < c.hitsMax * 0.8
    });
    if (closestDamagedCreep) {
      tower.heal(closestDamagedCreep);
      return;
    }

  }
}
