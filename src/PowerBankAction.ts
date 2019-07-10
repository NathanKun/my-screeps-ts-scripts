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

  private static internalDo(bank: StructurePowerBank, spawns: StructureSpawn[]) {
    // cache path
    if (Memory.powerbank === undefined) {
      Game.notify('Power bank action started');
      Memory.powerbank = {} as PowerBankActionMemory;
      Memory.powerbank.start = new RoomPosition(14, 1, 'W9S7');
      Memory.powerbank.path = PowerBankAction.findPath(bank);
    }

    // spawn 4 attacker-healer pairs
    PowerBankAction.spawns(spawns);

    // move to power BANK
    PowerBankAction.move(bank);

  }

  private static findPath(bank: StructurePowerBank) {
    console.log('Find power bank path start: ' + Game.cpu.getUsed());
    const res = PathFinder.search(Memory.powerbank.start, bank.pos);
    console.log('Find power bank path end  : ' + Game.cpu.getUsed());
    return res.path;
  }

  private static spawns(pSpawns: StructureSpawn[]) {
    const spawns = _.filter(pSpawns, (s) => s.spawning === null);

    if (spawns.length) {
      for (let i = 1; i <= 4; i++) {
        const a = Game.creeps['powera_' + i];
        if (a === undefined) {
          spawns[0].spawnCreep(this.poweraBody, 'powera_' + i,
            { memory: { role: 'powera', room: spawns[0].room.name, spawnTime: Game.time } });
          break;
        }

        const h = Game.creeps['powerh_' + i];
        if (h === undefined) {
          spawns[0].spawnCreep(this.powerhBody, 'powerh_' + i,
            { memory: { role: 'powerh', room: spawns[0].room.name, spawnTime: Game.time, powerbankHealerTarget: 'powera_' + i } });
          break;
        }
      }
    }
  }


  private static move(bank: StructurePowerBank) {
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
  }

  private static moveOne(c: Creep, bank: StructurePowerBank) {
    // creep in start room
    if (c.room.name === Memory.powerbank.start.roomName) {
      // at start point => move by cached path
      if (c.pos.x === Memory.powerbank.start.x && c.pos.y === Memory.powerbank.start.y) {
        c.moveByPath(Memory.powerbank.path);
      }
      // not at start point => move to start point
      else {
        c.moveTo(Memory.powerbank.start);
      }
    }
    // creep is close to power bank
    else if (c.room.name === bank.room.name && c.pos.getRangeTo(bank) < 10) {
      if (c.memory.role === 'powera') {
        if (c.pos.getRangeTo(bank) > 1) {
          c.moveTo(bank);
        }
      } else if (c.memory.role === 'powerh') {
          const healTarget = Game.creeps[c.memory.powerbankHealerTarget!!];
          if (c.pos.getRangeTo(healTarget) > 1) {
            c.moveTo(healTarget);
          }
      }
    }
    // creep in half way
    else {
      // move by cached path
      c.moveByPath(Memory.powerbank.path);
    }
  }

  private static cleanupMemory() {
    delete Memory['powerbank'];
  }

  public static do(bank: StructurePowerBank, spawns: StructureSpawn[]) {
    if (bank) {
      try {
        // PowerBankAction.internalDo(bank, spawns);
      } catch (e) {
        const outText = ErrorMapper.sourceMappedStackTrace(e);
        Game.notify('Game.time = ' + Game.time + '\n' + 'Error in TowerTask ' + bank.id +
          '\n' + e + '\n' + outText);
      }
    }
  }
}
