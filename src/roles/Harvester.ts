import { FindSourceUtil } from "utils/FindSourceUtil";
import { BaseCreep } from "./BaseCreep";

export class Harvester extends BaseCreep {
  public hasHostile: boolean = false;
  public roomLinks: RoomLinks[];

  constructor(creep: Creep, hasHostile: boolean, roomLinks: RoomLinks[]) {
    super(creep);
    this.hasHostile = hasHostile;
    this.roomLinks = roomLinks;
  }

  protected run() {
    if (this.memory.transfering && this.carry.energy === 0) {
      this.memory.transfering = false;
      this.memory.transferTarget = undefined;
      this.say('🔄 harvest');
    }
    if (!this.memory.transfering && this.carry.energy === this.carryCapacity) {
      this.memory.transfering = true;
      FindSourceUtil.clear(this);
      this.say('🚧 transfer');
    }

    // transfer
    if (this.memory.transfering) {
      // has hostile: charge towers
      if (this.hasHostile) {
        if (this.memory.transferTarget === undefined) {
          const towers = this.findTowers(1000).sort((t1, t2) => t1.energy - t2.energy);
          if (towers.length) {
            this.memory.transferTarget = towers[0].id;
          }
        }
        const tower = Game.getObjectById(this.memory.transferTarget) as (StructureTower | null);
        if (tower && this.transfer(tower, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          this.moveTo(tower, { reusePath: 2, visualizePathStyle: { stroke: '#ff0000' } });
        }
      }
      // no hostile
      else {
        let targets: AnyStructure[];

        // prior find extensions
        targets = this.findExtensions();

        // prior find spawns
        if (targets.length === 0) {
          targets = this.findSpawns();
        }

        // find low energy towers
        if (targets.length === 0) {
          targets = this.findTowers(500);
        }

        // find links
        if (targets.length === 0) {
          targets = this.findLinks();
        }

        // find prefer transfer structure
        if (targets.length === 0) {
          if (this.memory.preferTransferStructure === 'tower') {
            targets = this.findTowers(850);
          } else if (this.memory.preferTransferStructure === 'storage') {
            targets = this.findStorage();
          }
        }

        // find high energy towers
        if (targets.length === 0) {
          targets = this.findTowers(850);
        }

        // find storages
        if (targets.length === 0) {
          targets = this.findStorage();
        }

        if (targets.length > 0) {
          if (this.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            this.moveTo(targets[0], { reusePath: 2, visualizePathStyle: { stroke: '#ffaa00' } });
          }
        }
        // nothing to do, upgrade room controller
        else {
          if (this.upgradeController(this.room.controller!!) === ERR_NOT_IN_RANGE) {
            this.moveTo(this.room.controller!!, { visualizePathStyle: { stroke: '#66ccff' } });
          }
        }
      }
    }
    // harvest
    else {
      // harvest in base room
      if (this.memory.harvesterRoom === undefined || this.memory.harvesterRoom === 'base') {
        const source = FindSourceUtil.findSource(this);
        if (this.harvest(source) === ERR_NOT_IN_RANGE) {
          this.moveTo(source, { reusePath: 2, visualizePathStyle: { stroke: '#ffffff' } });
        }
      }
      // harvest in an other room
      else {
        // move to the room to gain visibility
        if (this.room.name !== this.memory.harvesterRoom) {
          this.moveTo(new RoomPosition(20, 20, this.memory.harvesterRoom))
        }
        else {
          const source = FindSourceUtil.findSource(this);
          if (this.harvest(source) === ERR_NOT_IN_RANGE) {
            this.moveTo(source, { reusePath: 2, visualizePathStyle: { stroke: '#ffffff' } });
          } else {
            console.log(this.harvest(source))
          }
        }
      }
    }
  }

  private findExtensions() {
    return this.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType === STRUCTURE_EXTENSION &&
          structure.energy < structure.energyCapacity;
      }
    }).sort((s1, s2) =>
      this.pos.getRangeTo(s1.pos.x, s1.pos.y) - this.pos.getRangeTo(s2.pos.x, s2.pos.y));
  }

  private findSpawns() {
    return this.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType === STRUCTURE_SPAWN &&
          structure.energy < structure.energyCapacity;
      }
    }).sort((s1, s2) =>
      this.pos.getRangeTo(s1.pos.x, s1.pos.y) - this.pos.getRangeTo(s2.pos.x, s2.pos.y));
  }

  private findStorage() {
    return this.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType === STRUCTURE_STORAGE &&
          structure.store.energy < structure.storeCapacity;
      }
    });
  }

  private findTowers(maxEnergy: number): StructureTower[] {
    return (this.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType === STRUCTURE_TOWER &&
          structure.energy <= maxEnergy;
      }
    }) as StructureTower[]).sort((t1, t2) => t1.energy - t2.energy);
  }

  private findLinks(): StructureLink[] {
    const res: StructureLink[] = []

    for (const roomLinks of this.roomLinks) {
      if (roomLinks.room.name === this.room.name) {
        for (const links of roomLinks.links) {
          if (links.sender && links.sender.energy < links.sender.energyCapacity) {
            res.push(links.sender);
          }
        }
      }
    }

    return res.sort((l1, l2) => l1.cooldown - l2.cooldown);
  }
};
