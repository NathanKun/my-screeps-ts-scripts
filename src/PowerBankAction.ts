import { ErrorMapper } from "utils/ErrorMapper";

export class PowerBankAction {

  private static readonly poweraBody = [
    MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, // 650
    MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, // 650
    MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, // 650
    MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, // 650
    MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK // 650
  ]

  private static readonly powerhBody = [
    MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, // 500
    MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, // 500
    MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, // 875
    HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, // 1250
    HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL // 250 * 5 = 1250
  ]

  private static readonly powercBody = [
    MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, // 500
    MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, // 500
    MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, // 500
    CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, // 500
    CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY // 500
  ]

  private static internalDo(spawns: StructureSpawn[]) {
    // finished, clean up
    if (Memory.powerbank.finished) {
      delete Memory['powerbank'];
      Game.notify('Power bank action finished');
      return;
    }

    const observer = spawns[0].room.memory.observer!!;

    // find path
    if (Memory.powerbank.findingPath) {
      PowerBankAction.findPath(observer);
      return;
    }

    // path found, start observation of the bank room
    observer.observeRoom(Memory.powerbank.end.roomName);
    const room = Game.rooms[Memory.powerbank.end.roomName];

    if (room === undefined) {
      return;
    }

    // find bank / power
    const bank = Game.getObjectById(Memory.powerbank.bankId) as (StructurePowerBank | null);
    const powers = room.find(FIND_DROPPED_RESOURCES, {
      filter: s => s.resourceType === RESOURCE_POWER
    }) as Array<Resource<RESOURCE_POWER>>;

    const power = powers.length ? powers[0] : null;

    if (!bank && !power) {
      let cFound = false;
      for (let i = 1; i <= Memory.powerbank.carrierNeed; i++) {
        const c = Game.creeps['powerc_' + i];
        if (c) {
          cFound = true;
          break;
        }
      }
      if (!cFound) {
        Memory.powerbank.finished = true;
      }
    }


    // spawn 4 attacker-healer pairs, and carriers
    PowerBankAction.spawn(spawns, bank, power);

    // move to power bank / pick up power
    PowerBankAction.move(bank, power);

    // attack
    PowerBankAction.attack(bank);

    // carriers go back
    PowerBankAction.back(bank, power);
  }

  private static findPath(observer: StructureObserver) {
    // simple find pat without visibility
    if (Memory.powerbank.roomStructures === undefined) {
      PathFinder.search(new RoomPosition(Memory.powerbank.start.x, Memory.powerbank.start.y, Memory.powerbank.start.roomName),
        { pos: Memory.powerbank.end, range: 1 },
        {
          maxOps: 50000,
          maxRooms: 64,
          plainCost: 2,
          swampCost: 10,
          roomCallback: (roomName) => {
            const room = Game.rooms[roomName];
            if (!room) {
              Memory.powerbank.pathRooms.push(roomName);
            }
            return new PathFinder.CostMatrix;
          }
        }
      );

      Memory.powerbank.roomStructures = {};
      observer.observeRoom(Memory.powerbank.pathRooms[0]);
      console.log('Find Path start');
    } else {
      let count = 0;
      // observe rooms in path, cache structures of rooms
      for (let index = 0; index < Memory.powerbank.pathRooms.length; index++) {
        const roomName = Memory.powerbank.pathRooms[index];
        if (Memory.powerbank.roomStructures!!.hasOwnProperty(roomName)) {
          count++;
          continue;
        }
        const room = Game.rooms[roomName];
        if (room) {
          Memory.powerbank.roomStructures!![roomName] = room.find(FIND_STRUCTURES);
          if (index + 1 < Memory.powerbank.pathRooms.length) {
            observer.observeRoom(Memory.powerbank.pathRooms[index + 1]);
          }
          console.log('Finding Path: room = ' + roomName + " index = " + index);
          break;
        }
      }

      if (count < Memory.powerbank.pathRooms.length) {
        return;
      }

      // cache completed, re-search path with rooms visibility
      const path = PathFinder.search(new RoomPosition(Memory.powerbank.start.x, Memory.powerbank.start.y, Memory.powerbank.start.roomName),
        { pos: Memory.powerbank.end, range: 1 },
        {
          maxOps: 50000,
          maxRooms: 64,
          plainCost: 2,
          swampCost: 10,
          roomCallback: (roomName) => {
            const costs = new PathFinder.CostMatrix;

            let roomStructures = Memory.powerbank.roomStructures!![roomName];
            if (!roomStructures) {
              const room = Game.rooms[roomName];
              if (!room) {
                Game.notify('Error while find path to power bank. RoomStructure of room ' + roomName + ' not found, and the room is not visible');
                return costs;
              }
              roomStructures = room.find(FIND_STRUCTURES);
            }

            roomStructures.forEach((struct) => {
              if (struct.structureType === STRUCTURE_ROAD) {
                // Favor roads over plain tiles
                costs.set(struct.pos.x, struct.pos.y, 1);
              } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                (struct.structureType !== STRUCTURE_RAMPART || !struct.my)) {
                // Can't walk through non-walkable buildings
                costs.set(struct.pos.x, struct.pos.y, 0xff);
              }
            });

            return costs;
          }
        }
      );

      console.log('Find Path End');
      console.log('    cost = ' + path.cost);
      console.log('    incomplete = ' + path.incomplete);
      console.log('    ops = ' + path.ops);
      console.log('    path.length = ' + path.path.length);

      Memory.powerbank.path = path.path;
      delete Memory.powerbank.pathRooms;
      delete Memory.powerbank.roomStructures;
      Memory.powerbank.findingPath = false;
    }
  }

  private static spawn(pSpawns: StructureSpawn[], bank: StructurePowerBank | null, power: null | Resource<RESOURCE_POWER>) {
    const spawns = _.filter(pSpawns, (s) => s.spawning === null);

    if (spawns.length) {
      // attakers and healers
      if (bank) {
        for (let i = 1; i <= 3; i++) {
          const a = Game.creeps['powera_' + i];
          if (a === undefined && Memory.powerbank.poweraSpawnedIndex < i) {
            const res = spawns[0].spawnCreep(this.poweraBody, 'powera_' + i,
              { memory: { role: 'powera', room: spawns[0].room.name, spawnTime: Game.time, powerbankPath: Memory.powerbank.path } });
            if (res === OK) {
              Memory.powerbank.poweraSpawnedIndex = i;
              Game.notify('Spawn powera_' + i);
            }
            return;
          }

          const h = Game.creeps['powerh_' + i];
          if (h === undefined && Memory.powerbank.powerhSpawnedIndex < i) {
            const res = spawns[0].spawnCreep(this.powerhBody, 'powerh_' + i,
              { memory: { role: 'powerh', room: spawns[0].room.name, spawnTime: Game.time, powerbankHealerTarget: 'powera_' + i, powerbankPath: Memory.powerbank.path } });
            if (res === OK) {
              Memory.powerbank.powerhSpawnedIndex = i;
              Game.notify('Spawn powerh_' + i);
            }
            return;
          }
        }
      }

      // carriers
      if (power && (bank === null || ((bank.hits / bank.hitsMax) < 0.6))) {
        for (let i = 1; i <= Memory.powerbank.carrierNeed; i++) {
          const c = Game.creeps['powerc_' + i];
          if (c === undefined) {
            const res = spawns[0].spawnCreep(this.powercBody, 'powerc_' + i,
              { memory: { role: 'powerc', room: spawns[0].room.name, spawnTime: Game.time, powerbankPath: Memory.powerbank.path } });
            if (res === OK) {
              Game.notify('Spawn powerc_' + i);
            }
            return;
          }
        }
      }
    }
  }

  private static move(bank: StructurePowerBank | null, power: Resource<RESOURCE_POWER> | null) {
    // a and h
    if (bank) {
      for (let i = 1; i <= 4; i++) {
        const a = Game.creeps['powera_' + i];
        if (a) {
          PowerBankAction.moveOne(a, bank);
        }

        const h = Game.creeps['powerh_' + i];
        if (h) {
          PowerBankAction.moveOne(h, bank);
        }
      }

      // c
      for (let i = 1; i <= Memory.powerbank.carrierNeed; i++) {
        const c = Game.creeps['powerc_' + i];
        if (c) {
          PowerBankAction.moveOne(c, bank);
        }
      }
    } else if (power) {
      for (let i = 1; i <= Memory.powerbank.carrierNeed; i++) {
        const c = Game.creeps['powerc_' + i];
        if (c) {
          PowerBankAction.pickPower(c, power);
        }
      }
    }

  }

  private static moveOne(c: Creep, bank: StructurePowerBank) {
    // creep in start room
    if (c.room.name === Memory.powerbank.start.roomName) {
      // at start point => move by cached path
      if (c.pos.x === Memory.powerbank.path!![0].x && c.pos.y === Memory.powerbank.path!![0].y) {
        const path = c.memory.powerbankPath!!.map(p => new RoomPosition(p.x, p.y, p.roomName));
        const res = c.moveByPath(path);
        console.log(c.name + " move by path " + res);
      }
      // not at start point => move to start point
      else {
        const res = c.moveTo(new RoomPosition(Memory.powerbank.path!![0].x, Memory.powerbank.path!![0].y, Memory.powerbank.path!![0].roomName));
        console.log(c.name + " move to start " + res);
      }
    }
    // a or h creep is close to power bank
    else if (c.room.name === bank.room.name && c.pos.getRangeTo(bank) < 10) {
      if (c.memory.role === 'powera') {
        if (c.pos.getRangeTo(bank) > 1) { // go next to bank
          c.moveTo(bank);
        }
      } else if (c.memory.role === 'powerh') {
        const healTarget = Game.creeps[c.memory.powerbankHealerTarget!!];
        if (c.pos.getRangeTo(healTarget) > 1) { // go next to a
          c.moveTo(healTarget);
        }
      } else if (c.memory.role === 'powerh') {
        if (c.pos.getRangeTo(bank) > 5) { // go range 5 from bank
          c.moveTo(bank);
        }
      }
    }
    // creep in half way
    else {
      // move by cached path
      const path = c.memory.powerbankPath!!.map(p => new RoomPosition(p.x, p.y, p.roomName));
      const res = c.moveByPath(path);
      console.log(c.name + " move by path " + res);
    }
  }

  private static attack(bank: StructurePowerBank | null) {
    if (bank) {
      for (let i = 1; i <= 4; i++) {
        const a = Game.creeps['powera_' + i];
        const h = Game.creeps['powerh_' + i];
        if (a && h && a.pos.getRangeTo(bank) === 1 && h.pos.getRangeTo(a) === 1) {
          a.attack(bank);
          h.heal(a);
        }
      }
    } else {
      for (let i = 1; i <= 4; i++) {
        const a = Game.creeps['powera_' + i];
        if (a) {
          a.suicide();
        }
        const h = Game.creeps['powerh_' + i];
        if (h) {
          h.suicide();
        }
      }
    }
  }

  private static pickPower(c: Creep, power: Resource<RESOURCE_POWER>) {
    const res = c.pickup(power);
    if (res === ERR_NOT_IN_RANGE) {
      c.moveTo(power);
    } else if (res === OK) {
      Game.notify(c.name + ' picked up power');
    }
  }

  private static back(bank: StructurePowerBank | null, power: Resource<RESOURCE_POWER> | null) {
    for (let i = 1; i <= Memory.powerbank.carrierNeed; i++) {
      const c = Game.creeps['powerc_' + i];
      if (c && ((c.carry.power === c.carryCapacity) || (bank === null && power === null))) {
        if (c.room.name !== Memory.powerbank.start.roomName) {
          console.log(c.moveTo(new RoomPosition(Memory.powerbank.start.x, Memory.powerbank.start.y, Memory.powerbank.start.roomName), { reusePath: 50 }));
        } else {
          let target: StructurePowerSpawn | StructureContainer | null = c.room.memory.powerSpawn;
          if (!target || target.power === target.powerCapacity) {
            const containers = c.room.find(FIND_STRUCTURES, {
              filter: s => s.structureType === STRUCTURE_CONTAINER && (!s.store.power || s.store.power < s.storeCapacity)
            }) as StructureContainer[];
            if (containers.length) {
              target = containers[0];
            }
          }
          if (target) {
            const res = c.transfer(target, RESOURCE_POWER);
            if (res === ERR_NOT_IN_RANGE) {
              c.moveTo(c.room.memory.powerSpawn!!);
            } else if (res === OK) {
              Game.notify(c.name + 'transfered power!');
              c.suicide();
            }
          } else {
            Game.notify(c.name + ' has power ' + c.carry.power + ' but no power spawn and container available.')
          }
        }
      }
    }
  }

  public static do(spawns: StructureSpawn[]) {
    try {
      PowerBankAction.internalDo(spawns);
    } catch (e) {
      const outText = ErrorMapper.sourceMappedStackTrace(e);
      Game.notify('Game.time = ' + Game.time + '\n' + 'Error in Power Bank Action' + '\n' + e + '\n' + outText);
    }
  }
}
