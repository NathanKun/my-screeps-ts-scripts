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

  public static spawn(spawn: StructureSpawn, type: string, count: number) {
    let parts;
    if (type === 't') {
      parts = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
        TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
        TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
        TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
    } else if (type === 'a') {
      parts = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE,
        MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
        MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
    } else if (type === 'h') {
      parts = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
        TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
        MOVE, MOVE, MOVE, MOVE, MOVE,
        MOVE, MOVE, MOVE, MOVE, MOVE,
        HEAL, HEAL, HEAL, HEAL, HEAL]
    } else if (type === 'def') {
      parts = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE,
        MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
        MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
    }

    if (parts !== undefined) {
      for (let i = 1; i <= count; i++) {
        if (!(type + i in Game.creeps)) {
          spawn.spawnCreep(
            parts,
            type + i,
            { memory: { role: type, room: spawn.room.name, spawnTime: Game.time } });
          return;
        }
      }
    }
  }

  public static moveRole(targetRoom: string, x: number, y: number, role: string) {
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      if (creep.memory.role === role) {
        creep.moveTo(new RoomPosition(x, y, targetRoom));
      }
    }
  }

  public static moveOne(targetRoom: string, x: number, y: number, name: string) {
    Game.creeps[name].moveTo(new RoomPosition(x, y, targetRoom));
  }


  public static attackById(targetId: string) {
    const target = Game.getObjectById(targetId) as Creep | PowerCreep | Structure;
    Attack.attack(target);
  }

  public static attack(target: Creep | PowerCreep | Structure) {
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      if (creep.memory.role === 'a') {
        if (creep.attack(target) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
        }
      }
    }
  }

  public static attackCreeps(targetRoom: string, role: string): boolean {
    let hasTarget = false;
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      if (creep.memory.role === role) {
        if (creep.room.name !== targetRoom ||
          (creep.room.name === targetRoom &&
            (creep.pos.x === 49 || creep.pos.y === 49 || creep.pos.x === 0 || creep.pos.y === 0))) {
          creep.moveTo(new RoomPosition(14, 47, targetRoom));
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

  public static attackSpawns(targetRoom: string): boolean {
    let hasTarget = false;
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      if (creep.memory.role === 'a') {
        if (creep.room.name !== targetRoom) {
          creep.moveTo(new RoomPosition(14, 47, targetRoom));
        } else {
          const targets = creep.room.find(FIND_HOSTILE_SPAWNS);
          if (targets.length) {
            if (creep.attack(targets[0]) === ERR_NOT_IN_RANGE) {
              creep.moveTo(targets[0]);
            }
            hasTarget = true;
          }
        }
      }
    }

    return hasTarget;
  }

  public static attackStructures(targetRoom: string): boolean {
    let hasTarget = false;
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      if (creep.memory.role === 'a') {
        if (creep.room.name !== targetRoom) {
          creep.moveTo(new RoomPosition(14, 47, targetRoom));
        } else {
          const target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
            filter: s =>
              s.structureType !== STRUCTURE_CONTROLLER &&
              s.structureType !== STRUCTURE_RAMPART
          });

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
