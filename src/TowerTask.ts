export class TowerTask {
  public static run(tower: StructureTower) {

    // attack
    const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
      tower.attack(closestHostile);
      return;
    }

    // repair
    const structures = tower.room.find(FIND_STRUCTURES, {
      filter: structure => structure.hits < structure.hitsMax
    });

    if (structures.length) {
      const target = _.sortBy(structures, s => s.hits / s.hitsMax)[0];
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
