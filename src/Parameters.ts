import { ErrorMapper } from "utils/ErrorMapper";

export class Parameters {

  // spawn creeps params
  public static spawnParams(): SpawnParam[] {
    return [{
      spawns: [Game.spawns['Spawn1'], Game.spawns['Spawn1.1'], Game.spawns['Spawn1.2']],
      harvester: {
        count: 1,
        parts: [
          WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
        ]
      },
      harvesterExt: {
        count: 4,
        parts: [
          WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE, MOVE, MOVE, MOVE
        ],
        harvestRoom: 'W9S6'
      },
      builder: {
        count: 1,
        parts: [
          WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
          WORK, WORK, WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
        ]
      },
      upgrader: {
        count: 1,
        parts: [
          WORK, CARRY, MOVE
        ],
        upgraderUseStorageMin: 100000
      },
      maintainer: {
        count: 0,
        parts: [
          WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE
        ]
      },
      collector: {
        count: 1,
        parts: [
          WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE
        ]
      },
      claimer: {
        count: 1,
        parts: [CLAIM, CLAIM, MOVE],
        claimerRoom: 'W9S6',
        claimerAction: 'reserve'
      }
    },
    {
      spawns: [Game.spawns['Spawn2']],
      harvester: {
        count: 1,
        parts: [
          WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
        ]
      },
      harvesterExt: {
        count: 4,
        parts: [
          WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE, MOVE, MOVE, MOVE
        ],
        harvestRoom: 'W8S5',
        canAttack: false,
        harvesterExtPrimaryTransferTargets: {
          links: ["5d22efceaf7b0c634e1579b4"]
        }
      },
      builder: {
        count: 1,
        parts: [
          WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
          , MOVE],
      },
      upgrader: {
        count: 1,
        parts: [
          WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        upgraderUseStorageMin: 30000
      },
      maintainer: {
        count: 0,
        parts: [
          WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE],
      },
      collector: {
        count: 1,
        parts: [
          WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE],
        collectorWithdrawTargets: {
          terminal: "5d24244044ff1d2a689d8a9d"
        }
      },
      claimer: {
        count: 1,
        parts: [CLAIM, CLAIM, MOVE],
        claimerRoom: 'W8S5',
        claimerAction: 'reserve'
      }
    },
    {
      spawns: [Game.spawns['Spawn3']],
      harvester: {
        count: 1,
        parts: [
          WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE],
      },
      harvesterExt: {
        count: 4,
        parts: [
          WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          ATTACK,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE, MOVE, MOVE, MOVE],
        harvestRoom: 'W7S6',
        canAttack: true,
        harvesterExtPrimaryTransferTargets: {
          links: ["5d1bef377df56e6464adbd1c"]
        }
      },
      builder: {
        count: 1,
        parts: [
          WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
      },
      upgrader: {
        count: 2,
        parts: [
          WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        upgraderUseStorageMin: 30000
      },
      maintainer: {
        count: 1,
        parts: [
          WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
      },
      collector: {
        count: 1,
        parts: [
          WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        collectorWithdrawTargets: {
          links: ["5d1bcab6b88799384c5fc414"]
        }
      },
      claimer: {
        count: 1,
        parts: [CLAIM, CLAIM, MOVE],
        claimerRoom: 'W7S6',
        claimerAction: 'reserve'
      }
    }]
  }



  public static rooms(): RoomConfig[] {
    return [
      {
        room: Game.rooms['W9S7'],
        spawns: [Game.spawns['Spawn1'], Game.spawns['Spawn1.1']],
        collectorWithdrawStorageMode: false,
        hasHostile: Game.spawns['Spawn1'].room.find(FIND_HOSTILE_CREEPS).length > 0,
        storage: "5ced749d7f5e00234025f1c3",
        towers: ["5ce5ab4e9917085da40c257a", "5ceb0ce35a7eb776ba2e79fa", "5d220538ad1ea5150aad34b3", "5d220bf6320b57371f109e9f", "5d2214948a9c3b645e92842e"],
        terminal: "5d047c79f149a971a0d3a4be",
        powerSpawn: "5d2286cb51c46e1504dad35e",
        nuker: "5d22e8fd320b57371f11008e",
        observer: "5d22f0b171b41e2a5c874355"
      },
      {
        room: Game.rooms['W9S5'],
        spawns: [Game.spawns['Spawn2'], Game.spawns['Spawn2.1']],
        collectorWithdrawStorageMode: false,
        hasHostile: Game.spawns['Spawn2'].room.find(FIND_HOSTILE_CREEPS).length > 0,
        storage: "5cfb3d17bcac0c0fd600f74d",
        towers: ["5cf6d44f1a35fd098d7d7ad5", "5d004c75c0d974664ad4d35e", "5d22dcdd64842a72e7e1d3ae"],
        terminal: "5d24244044ff1d2a689d8a9d",
        powerSpawn: "",
        nuker: "",
        observer: ""
      },
      {
        room: Game.rooms['W8S6'],
        spawns: [Game.spawns['Spawn3']],
        collectorWithdrawStorageMode: false,
        hasHostile: Game.spawns['Spawn3'].room.find(FIND_HOSTILE_CREEPS).length > 0,
        storage: "5d1869d8df35e2635a0e1281",
        towers: ["5d17c3713a42dc03d2042956", "5d1bbb0b71b41e2a5c844bcb"],
        terminal: "",
        powerSpawn: "",
        nuker: "",
        observer: ""
      }
    ]
  }




  public static roomLinks(): RoomLinks[] {
    return [{
      room: Game.rooms['W9S7'],
      links: [
        {
          sender: Game.getObjectById('5cf53529ac644b09c5efd05c') as StructureLink,
          receiver: Game.getObjectById('5cf53c6d03632c664c611dce') as StructureLink,
          senderType: "cityCenter"
        }/*, {
          sender: Game.getObjectById('5cf543d960fc8009c45c72d3') as StructureLink,
          receiver: Game.getObjectById('5cf53c6d03632c664c611dce') as StructureLink,
          senderType: "cityCenter"
        }, {
          sender: Game.getObjectById('5d03e47bc2ac6453595fe392') as StructureLink,
          receiver: Game.getObjectById('5cf53c6d03632c664c611dce') as StructureLink,
          senderType: "cityCenter"
        }*/
      ]
    },
    {
      room: Game.rooms['W9S5'],
      links: [
        {
          sender: Game.getObjectById('5d0061ba63738f09b7810b80') as StructureLink,
          receiver: Game.getObjectById('5d0090631fe8da31ef52469c') as StructureLink,
          senderType: "cityCenter"
        },
        {
          sender: Game.getObjectById('5d0a7d41308228440a39201d') as StructureLink,
          receiver: Game.getObjectById('5d0090631fe8da31ef52469c') as StructureLink,
          senderType: "cityCenter"
        },
        {
          sender: Game.getObjectById('5d22efceaf7b0c634e1579b4') as StructureLink,
          receiver: Game.getObjectById('5d0090631fe8da31ef52469c') as StructureLink,
          senderType: "nextToExit"
        }
      ]
    },
    {
      room: Game.rooms['W8S6'],
      links: [
        {
          sender: Game.getObjectById('5d1bef377df56e6464adbd1c') as StructureLink,
          receiver: Game.getObjectById('5d1bcab6b88799384c5fc414') as StructureLink,
          senderType: "nextToExit"
        },
        {
          sender: Game.getObjectById('5d25b240d2b78a5d2a18d093') as StructureLink,
          receiver: Game.getObjectById('5d1bcab6b88799384c5fc414') as StructureLink,
          senderType: "nextToExit"
        }
      ]
    }
    ]
  }

  public static readonly observeRooms = ['W10S0', 'W10S1', 'W10S2', 'W10S3', 'W10S4', 'W10S5', 'W10S6', 'W10S7', 'W10S8', 'W10S9', 'W10S10'];

  public static getCollectorWithdrawStorageMode(spawnParam: SpawnParam): boolean {
    const spawn = spawnParam.spawns[0];
    if (!spawn) {
      return false;
    }

    try {
      const capacity = spawn.room.memory.energyCapacity;
      const energy = spawn.room.memory.energy;

      const storageNotEmpty = spawn.room.find(FIND_MY_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_STORAGE && s.store.energy > 0
      }).length > 0;

      return ((energy / capacity < 0.2) ||
        spawn.room.memory.harvester < spawnParam.harvester.count ||
        spawn.room.memory.harvesterExt < spawnParam.harvesterExt.count)
        && storageNotEmpty;
    } catch (e) {
      const outText = ErrorMapper.sourceMappedStackTrace(e);
      Game.notify('Game.time = ' + Game.time + '\n' +
        'Error in getCollectorWithdrawStorageMode ' + spawn.name + '\n' + e + '\n ' + outText);
      return false;
    }
  }
}
