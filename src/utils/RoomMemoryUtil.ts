export class RoomMemoryUtil {
  public static initRoomMemory(roomConfig: RoomConfig) {
    const room = roomConfig.room;
    room.memory = {} as RoomMemory;

    RoomMemoryUtil.energy(room);
    RoomMemoryUtil.structures(room, roomConfig);
  }

  private static energy(room: Room) {
    const energyStructures: [StructureExtension, StructureSpawn] = room.find(FIND_MY_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION
    }) as [StructureExtension, StructureSpawn];

    let energy = 0;
    let energyCapacity = 0;

    energyStructures.forEach(s => {
      energy += s.energy;
      energyCapacity += s.energyCapacity;
    });

    room.memory.energy = energy;
    room.memory.energyCapacity = energyCapacity;;
    room.memory.energyPercentage = energy / energyCapacity;
  }

  private static structures(room: Room, roomConfig: RoomConfig) {
    // extensions
    room.memory.notFullExtensions = room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType === STRUCTURE_EXTENSION &&
          structure.energy < structure.energyCapacity;
      }
    }) as StructureExtension[];

    // spwans
    room.memory.notFullSpawns = room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType === STRUCTURE_SPAWN &&
          structure.energy < structure.energyCapacity;
      }
    }) as StructureSpawn[];

    // storege
    if (roomConfig.storage !== "") {
      room.memory.storage = Game.getObjectById(roomConfig.storage);
    } else {
      room.memory.storage = null;
    }

    // terminal
    if (roomConfig.terminal !== "") {
      room.memory.terminal = Game.getObjectById(roomConfig.terminal);
    } else {
      room.memory.terminal = null;
    }

    // towers
    room.memory.towers = roomConfig.towers.map(id => Game.getObjectById(id)).filter(t => t != null) as StructureTower[];
  }
}
