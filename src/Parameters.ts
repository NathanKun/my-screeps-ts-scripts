import { ErrorMapper } from "utils/ErrorMapper";

export class Parameters {

  // spawn creeps params
  public static spawnParams(): SpawnParam[] {
    return [{
      spawns: [],
      harvester: {
        count: 2,
        parts: [
          WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE, MOVE, MOVE, MOVE
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
        harvestRoom: 'W9S6',
        harvesterExtPrimaryTransferTargets: {
          links: ["5d372e697a1f04171f82597b", "5d3731d4cb855562844e876c", "5d3736521304ce627084d38b", "5d373cd85c57a23fff553d0a"]
        }
      },
      builder: {
        count: -1,
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
        count: -1,
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
          WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
        ],
        collectorWithdrawTargets: {
          // containers: ['5d2cd8d4937fab26cebd5327', '5d2cdca8b82aed7ab6b0153e', '5d2cd4c26b36a240262ca76d', '5d2ce61998788e62449d6113', '5d2ce08e83c0952690fb3514']
          links: ["5cf53529ac644b09c5efd05c"]
        }
      },
      claimer: {
        count: 1,
        parts: [CLAIM, MOVE],
        claimerRoom: 'W9S6',
        claimerAction: 'reserve'
      }
    },





    {
      spawns: [],
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
        count: 3,
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
          links: ["5d4b9d6c0906206365449cb8", "5d4b88f8ea104379d9097392", "5d4b937914989673a627418a"]
        }
      },
      builder: {
        count: -1,
        parts: [
          WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE, MOVE, MOVE, MOVE
        ],
      },
      upgrader: {
        count: 1,
        parts: [
          WORK, CARRY, MOVE
        ],
        upgraderUseStorageMin: 100000
      },
      maintainer: {
        count: -1,
        parts: [
          WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE
        ],
      },
      collector: {
        count: 1,
        parts: [
          WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE
        ],
        collectorWithdrawTargets: {
          terminal: "5d24244044ff1d2a689d8a9d"
        }
      },
      claimer: {
        count: 1,
        parts: [CLAIM, MOVE],
        claimerRoom: 'W8S5',
        claimerAction: 'reserve'
      }
    },





    {
      spawns: [],
      harvester: {
        count: 1,
        parts: [
          WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
        ],
      },
      harvesterExt: {
        count: 3,
        parts: [
          WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE, MOVE, MOVE, MOVE
        ],
        harvestRoom: 'W7S6',
        canAttack: true,
        harvesterExtPrimaryTransferTargets: {
          links: ["5d1bef377df56e6464adbd1c", "5d25b240d2b78a5d2a18d093", "5d38c77cb82aed7ab6b52fe0"]
        }
      },
      builder: {
        count: -1,
        parts: [
          WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE, MOVE, MOVE, MOVE
        ],
      },
      upgrader: {
        count: 2,
        parts: [
          WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE, MOVE, MOVE, MOVE
        ],
        upgraderUseStorageMin: 30000
      },
      maintainer: {
        count: -1,
        parts: [
          WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE
        ]
      },
      collector: {
        count: 1,
        parts: [
          WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE
        ],
        collectorWithdrawTargets: {
          links: ["5d1bcab6b88799384c5fc414"],
          terminal: "5d278ec3d2b78a5d2a199272"
        }
      },
      claimer: {
        count: 1,
        parts: [CLAIM, MOVE], // auto add 1 CLAIM if reservation tick < 4000 (see SpawnHelper.internalSpawnOne(:  claimer part)
        claimerRoom: 'W7S6',
        claimerAction: 'reserve'
      }
    },





    {
      spawns: [],
      harvester: {
        count: 2,
        parts: [
          WORK, WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
      },
      harvesterExt: {
        count: 0,
        parts: [],
        harvestRoom: 'W6S7',
        canAttack: true,
        harvesterExtPrimaryTransferTargets: {}
      },
      builder: {
        count: -1,
        parts: [
          WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE, MOVE, MOVE, MOVE
        ],
      },
      upgrader: {
        count: 2,
        parts: [
          WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE, MOVE, MOVE, MOVE
        ],
        upgraderUseStorageMin: 30000
      },
      maintainer: {
        count: -1,
        parts: [
          WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE
        ]
      },
      collector: {
        count: 1,
        parts: [
          WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE
        ],
        collectorWithdrawTargets: {
          terminal: "5d39829e8fef3a638864eef6"
        }
      },
      claimer: {
        count: 0,
        parts: [CLAIM, MOVE], // auto add 1 CLAIM if reservation tick < 4000 (see SpawnHelper.internalSpawnOne(:  claimer part)
        claimerRoom: 'W6S7',
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
        towers: ["5ce5ab4e9917085da40c257a", "5ceb0ce35a7eb776ba2e79fa", "5d220538ad1ea5150aad34b3", "5d220bf6320b57371f109e9f", "5d2214948a9c3b645e92842e", "5d03eab035873a443bfef3ea"],
        terminal: "5d047c79f149a971a0d3a4be",
        powerSpawn: "5d2286cb51c46e1504dad35e",
        nuker: "5d22e8fd320b57371f11008e",
        observer: "5d22f0b171b41e2a5c874355",
        containers: ["5d2cd4c26b36a240262ca76d", "5d2cd8d4937fab26cebd5327", "5d2ce08e83c0952690fb3514", "5d2cdca8b82aed7ab6b0153e"]
      },
      {
        room: Game.rooms['W9S5'],
        spawns: [Game.spawns['Spawn2'], Game.spawns['Spawn2.1'], Game.spawns['Spawn2.2']],
        collectorWithdrawStorageMode: false,
        hasHostile: Game.spawns['Spawn2'].room.find(FIND_HOSTILE_CREEPS).length > 0,
        storage: "5cfb3d17bcac0c0fd600f74d",
        towers: ["5cf6d44f1a35fd098d7d7ad5", "5d004c75c0d974664ad4d35e", "5d22dcdd64842a72e7e1d3ae", "5d4ba717de98312b1d9a8583", "5d4b68c866d7ea40916099df", "5d4b722c6700154079e00c7e"],
        terminal: "5d24244044ff1d2a689d8a9d",
        powerSpawn: "",// TODO: power spawn
        nuker: "",// TODO: nuker
        observer: "",// TODO: observer
        containers: []
      },
      {
        room: Game.rooms['W8S6'],
        spawns: [Game.spawns['Spawn3'], Game.spawns['Spawn3.1']],
        collectorWithdrawStorageMode: false,
        hasHostile: Game.spawns['Spawn3'].room.find(FIND_HOSTILE_CREEPS).length > 0,
        storage: "5d1869d8df35e2635a0e1281",
        towers: ["5d17c3713a42dc03d2042956", "5d1bbb0b71b41e2a5c844bcb", "5d38b3017d75867abb818af7"],
        terminal: "5d278ec3d2b78a5d2a199272",
        powerSpawn: "",
        nuker: "",
        observer: "",
        containers: []
      },
      {
        room: Game.rooms['W7S7'],
        spawns: [Game.spawns['Spawn4'], Game.spawns['Spawn4.1']],
        collectorWithdrawStorageMode: false,
        hasHostile: Game.spawns['Spawn4'].room.find(FIND_HOSTILE_CREEPS).length > 0,
        storage: "5d322a5fa92583627b4c6d10",
        towers: ["5d306fe5ae29775e0163b4c3", "5d3366d057e7d21a1a40159e", "5d47a344a7e81e40c5323ee5"],
        terminal: "5d39829e8fef3a638864eef6",
        powerSpawn: "",
        nuker: "",
        observer: "",
        containers: []
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
        },
        {
          sender: Game.getObjectById('5d372e697a1f04171f82597b') as StructureLink,
          receiver: Game.getObjectById('5cf53529ac644b09c5efd05c') as StructureLink,
          senderType: "nextToExit"
        },
        {
          sender: Game.getObjectById('5d3731d4cb855562844e876c') as StructureLink,
          receiver: Game.getObjectById('5cf53529ac644b09c5efd05c') as StructureLink,
          senderType: "nextToExit"
        },
        {
          sender: Game.getObjectById('5d3736521304ce627084d38b') as StructureLink,
          receiver: Game.getObjectById('5cf53529ac644b09c5efd05c') as StructureLink,
          senderType: "nextToExit"
        },
        {
          sender: Game.getObjectById('5d373cd85c57a23fff553d0a') as StructureLink,
          receiver: Game.getObjectById('5cf53529ac644b09c5efd05c') as StructureLink,
          senderType: "nextToExit"
        }
      ]
    },
    {
      room: Game.rooms['W9S5'],
      links: [
        {
          sender: Game.getObjectById('5d4b9d6c0906206365449cb8') as StructureLink,
          receiver: Game.getObjectById('5d4b793caab68c73d85bf42f') as StructureLink,
          senderType: "nextToExit"
        },
        {
          sender: Game.getObjectById('5d4b88f8ea104379d9097392') as StructureLink,
          receiver: Game.getObjectById('5d4b793caab68c73d85bf42f') as StructureLink,
          senderType: "nextToExit"
        },
        {
          sender: Game.getObjectById('5d4b937914989673a627418a') as StructureLink,
          receiver: Game.getObjectById('5d4b793caab68c73d85bf42f') as StructureLink,
          senderType: "nextToExit"
        },
        {
          sender: Game.getObjectById('5d4b793caab68c73d85bf42f') as StructureLink,
          receiver: Game.getObjectById('5d0090631fe8da31ef52469c') as StructureLink,
          senderType: "cityCenter"
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
        },
        {
          sender: Game.getObjectById('5d38c77cb82aed7ab6b52fe0') as StructureLink,
          receiver: Game.getObjectById('5d1bcab6b88799384c5fc414') as StructureLink,
          senderType: "nextToExit"
        }
      ]
    },
    {
      room: Game.rooms['W7S7'],
      links: [
        {
          sender: Game.getObjectById('5d35c61ee6b1d77ce73eb9e7') as StructureLink,
          receiver: Game.getObjectById('5d337855d787641a0fe30de0') as StructureLink,
          senderType: "cityCenter"
        },
        {
          sender: Game.getObjectById('5d39a77e758e3f745340c647') as StructureLink,
          receiver: Game.getObjectById('5d337855d787641a0fe30de0') as StructureLink,
          senderType: "cityCenter"
        },
        {
          sender: Game.getObjectById('5d47ae74903e412b1f4a0016') as StructureLink,
          receiver: Game.getObjectById('5d337855d787641a0fe30de0') as StructureLink,
          senderType: "cityCenter"
        },]
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

      if (!spawn.room.storage || !spawn.room.storage.store.energy) {
        return false;
      }

      if (energy / capacity < 0.7) {
        return true;
      }

      if (spawn.room.memory.harvester < spawnParam.harvester.count || spawn.room.memory.harvesterExt < spawnParam.harvesterExt.count) {
        return true;
      }

      if (Memory.powerbank && Memory.powerbank.start.roomName === spawn.room.name && (energy / capacity < 0.8)) {
        return true;
      }

      // container has power && power spawn has no power and has not full energy
      // so collector goes in withdraw mode, and fill power spawn, then, collector exit withdraw mode, and transfer container power to power spawn
      if (spawn.room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_CONTAINER && s.store.power }).length &&
        spawn.room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_POWER_SPAWN && s.power === 0 && s.energy < s.energyCapacity }).length) {
        return true;
      }

      return false;
    } catch (e) {
      const outText = ErrorMapper.sourceMappedStackTrace(e);
      Game.notify('Game.time = ' + Game.time + '\n' +
        'Error in getCollectorWithdrawStorageMode ' + spawn.name + '\n' + e + '\n ' + outText);
      return false;
    }
  }
}
