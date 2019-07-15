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

  private static internalDo(bank: StructurePowerBank | null, power: null | Resource<RESOURCE_POWER>, spawns: StructureSpawn[]) {
    // cache path, init memory
    if (Memory.powerbank === undefined) {
      if (bank) {
        Game.notify('Power bank action started');
        Memory.powerbank = {} as PowerBankActionMemory;
        Memory.powerbank.start = new RoomPosition(14, 1, 'W9S7');
        Memory.powerbank.end = bank.pos;
        Memory.powerbank.path = PowerBankAction.findPath(bank);
        Memory.powerbank.carrierNeed = Math.ceil(bank.power / 1250);
        Memory.powerbank.finished = false;
        Memory.powerbank.poweraSpawnedIndex = 0;
        Memory.powerbank.powerhSpawnedIndex = 0;
      } else {
        throw new Error("Memory.powerbank === undefined && bank === null")
      }
    }

    if (Memory.powerbank.finished) {
      PowerBankAction.cleanupMemory();
      Game.notify('Power bank action finished');
      return;
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

  private static findPath(bank: StructurePowerBank) {
    console.log('Find power bank path start: ' + Game.cpu.getUsed());
    const res = PathFinder.search(new RoomPosition(Memory.powerbank.start.x, Memory.powerbank.start.y, Memory.powerbank.start.roomName), bank.pos, {
      maxOps: 50000,
      maxRooms: 64
    });
    console.log('Find power bank path end  : ' + Game.cpu.getUsed());
    console.log(res.cost)
    console.log(res.incomplete)
    console.log(res.ops)
    return res.path;
  }

  private static spawn(pSpawns: StructureSpawn[], bank: StructurePowerBank | null, power: null | Resource<RESOURCE_POWER>) {
    const spawns = _.filter(pSpawns, (s) => s.spawning === null);

    if (spawns.length) {
      // attakers and healers
      if (bank) {
        for (let i = 1; i <= 4; i++) {
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
      if (power && (bank === null || (bank.hits / bank.hitsMax < 0.3))) {
        for (let i = 1; i <= Memory.powerbank.carrierNeed; i++) {
          const c = Game.creeps['powerc_' + i];
          if (c === undefined) {
            const res = spawns[0].spawnCreep(this.powercBody, 'powerc_' + i,
              { memory: { role: 'powerc', room: spawns[0].room.name, spawnTime: Game.time, powerbankPath: Memory.powerbank.path } });
            if (res === OK) {
              Game.notify('Spawn powerh_' + i);
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
      Game.notify(c.name + ' picked up power ' + c.carry.power);
    }
  }

  private static back(bank: StructurePowerBank | null, power: Resource<RESOURCE_POWER> | null) {
    for (let i = 1; i <= Memory.powerbank.carrierNeed; i++) {
      const c = Game.creeps['powerc_' + i];
      if (c && ((c.carry.power === c.carryCapacity) || (bank === null && power === null))) {
        if (c.room.name !== Memory.powerbank.start.roomName) {
          c.moveTo(Memory.powerbank.start, { reusePath: 50 });
        } else {
          const res = c.transfer(c.room.memory.powerSpawn!!, RESOURCE_POWER);
          if (res === ERR_NOT_IN_RANGE) {
            c.moveTo(c.room.memory.powerSpawn!!);
          } else if (res === OK) {
            Game.notify(c.name + 'transfered power!');
            c.suicide();
          }
        }
      }
    }
  }

  private static cleanupMemory() {
    delete Memory['powerbank'];
  }

  public static do(pBank: StructurePowerBank[], pPower: Resource<RESOURCE_POWER>[], spawns: StructureSpawn[]) {
    if (pBank.length || pPower.length) {
      try {
        let bank = pBank.length ? pBank[0] : null;
        let power = pPower.length ? pPower[0] : null;
        PowerBankAction.internalDo(bank, power, spawns);
      } catch (e) {
        const outText = ErrorMapper.sourceMappedStackTrace(e);
        Game.notify('Game.time = ' + Game.time + '\n' + 'Error in Power Bank Action' + '\n' + e + '\n' + outText);
      }
    }
  }
}
