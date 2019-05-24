export class TowerTask {
  public static run(tower: StructureTower) {

    // attack
    const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
      tower.attack(closestHostile);
      return;
    }

    for (let ratio = 0.01; ratio <= 1; ratio += 0.01) {
      // repair
      const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) =>
          (structure.hits < structure.hitsMax * ratio) &&
          (structure.hits >= structure.hitsMax * (ratio - 0.01))
      });
      if (closestDamagedStructure) {
        tower.repair(closestDamagedStructure);
        return;
      }

      // heal
      const closestDamagedCreep = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
        filter: (c) => (c.hits < c.hitsMax * ratio) && (c.hits >= c.hitsMax * (ratio - 0.01))
      });
      if (closestDamagedCreep) {
        tower.heal(closestDamagedCreep);
        return;
      }
    }
  }
}
