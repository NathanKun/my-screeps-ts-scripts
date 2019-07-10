export class Attack {

  public static spawn(spawn: StructureSpawn, type: string, count: number) {
    let parts;
    if (type === 't') {
      parts = [
        TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, // 100
        TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, // 100
        TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, // 100
        TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, // 100
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE // 500
      ]
    } else if (type === 'a') {
      parts = [
        TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, // 300
        MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, // 650
        MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, // 650
        MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, // 650
        MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK // 650
      ]
    } else if (type === 'h') {
      parts = [
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, // 500
        MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, // 875
        HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, // 1250
      ]
    } else if (type === 'def') {
      parts = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, // 300
        MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, // 650
        MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK // 650
      ]
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

  public static moveOne(targetRoom: string, x: number, y: number, creepname: string) {
    if (Game.creeps[creepname]) {
      Game.creeps[creepname].moveTo(new RoomPosition(x, y, targetRoom));
    } else {
      console.log("Creep " + creepname + " not found");
    }
  }


  public static attackById(targetId: string, creepName: string = 'all') {
    const target = Game.getObjectById(targetId) as (Creep | PowerCreep | Structure | null);
    if (target) {
      Attack.attack(target, creepName);
    }
  }

  public static attack(target: Creep | PowerCreep | Structure, creepName: string = 'all') {
    if (creepName === 'all') {
      const creep = Game.creeps[creepName];
      if (creep && creep.memory.role === 'a') {
        if (creep.attack(target) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
        }
      }
    } else {
      for (const name in Game.creeps) {
        const creep = Game.creeps[name];
        if (creep.memory.role === 'a') {
          if (creep.attack(target) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
          }
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
