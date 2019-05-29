/*
1000 energy => 100 shoots => 15,000 hits

tCreep: 40 tough + 10 move => 5000 hits
	cost: 40 * 10 + 10 * 50 = 900 energy

aCreep: 20 tough + 10 attack + 20 move
	cost: 20 * 10 + 10 * 80 + 20 * 50 = 2000

hCreep: 15 tough + 5 heal + 10 move
	cost: 15 * 10 + 5 * 250 + 10 * 50 = 1900


4 * tCreep + 4 * aCreep + 2 * hCreep
	cost = 3200 + 8000 + 3800 = 15000
*/

export class Attack {

  public static targetSpawn = Game.getObjectById('5cd0cad609716b07dcfc9639') as StructureSpawn;
  public static targetTower = Game.getObjectById('5cd1948ab5e4b70b929915b2') as StructureTower;
  public static targetController = Game.getObjectById('5bbcac629099fc012e63560a') as StructureController;

  public static spawn(type: string, count: number) {
    let parts;
    if (type === 't') {
      parts = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
        TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
        TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
        TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
    } else if (type === 'a') {
      parts = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE,
        MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK,
        MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK]
    } else if (type === 'h') {
      parts = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
        TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
        MOVE, MOVE, MOVE, MOVE, MOVE,
        MOVE, MOVE, MOVE, MOVE, MOVE,
        HEAL, HEAL, HEAL, HEAL, HEAL]
    }

    if (parts !== undefined) {
      for (let i = 1; i <= count; i++) {
        if (!(type + i in Game.creeps)) {
          Game.spawns['Spawn1'].spawnCreep(
            parts,
            type + i,
            { memory: { role: type } } as SpawnOptions);
          return;
        }
      }
    }
  }

  public static moveRole(x: number, y: number, role: string) {
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      if (creep.memory.role === role) {
        creep.moveTo(new RoomPosition(x, y, 'W9S6'));
      }
    }
  }

  public static moveOne(x: number, y: number, name: string) {
    Game.creeps[name].moveTo(new RoomPosition(x, y, 'W9S6'));
  }

  public static attack(target: Structure) {
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      if (creep.memory.role === 'a') {
        if (creep.attack(target) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
        }
      }
    }
  }

  public static attackCreeps(): boolean {
    let hasTarget = false;
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      if (creep.memory.role === 'a') {
        if (creep.room.name !== 'W9S6') {
          creep.moveTo(new RoomPosition(14, 47, 'W9S6'));
        } else {
          const target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
          if (target) {
            if (creep.attack(target) === ERR_NOT_IN_RANGE) {
              creep.moveTo(target);
            }
            hasTarget = true;
          }
        }
      }
    }

    return hasTarget;
  }

  public static attackSpawn(): boolean {
    let hasTarget = false;
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      if (creep.memory.role === 'a') {
        if (creep.room.name !== 'W9S6') {
          creep.moveTo(new RoomPosition(14, 47, 'W9S6'));
        } else {
          const target = creep.room.find(FIND_HOSTILE_SPAWNS);
          if (target) {
            if (creep.attack(target[0]) === ERR_NOT_IN_RANGE) {
              creep.moveTo(target[0]);
            }
            hasTarget = true;
          }
        }
      }
    }

    return hasTarget;
  }

  public static heal(targetName: string) {
    const target = Game.creeps[targetName];

    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      if (creep.memory.role === 'h') {
        if (creep.heal(target) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
        }
      }
    }
  }

}
