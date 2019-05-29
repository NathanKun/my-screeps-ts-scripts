import { FindSourceUtil } from "utils/FindSourceUtil";
import { BaseCreep } from "./BaseCreep";

export class Harvester extends BaseCreep {
  public hasHostile: boolean;

  constructor(creep: Creep, hasHostile: boolean) {
    super(creep);
    this.hasHostile = hasHostile;
  }

  protected run() {
    if (this.creep.memory.transfering && this.creep.carry.energy === 0) {
      this.creep.memory.transfering = false;
      this.creep.memory.transferTarget = undefined;
      this.creep.say('🔄 harvest');
    }
    if (!this.creep.memory.transfering && this.creep.carry.energy === this.creep.carryCapacity) {
      this.creep.memory.transfering = true;
      FindSourceUtil.clear(this.creep);
      this.creep.say('🚧 transfer');
    }

    // transfer
    if (this.creep.memory.transfering) {
      // has hostile: charge towers
      if (this.hasHostile) {
        if (this.creep.memory.transferTarget === undefined) {
          const towers = this.findTowers(this.creep).sort((t1, t2) => t1.energy - t2.energy);
          this.creep.memory.transferTarget = towers[0].id;
        }
        const tower = Game.getObjectById(this.creep.memory.transferTarget) as StructureTower;
        if (this.creep.transfer(tower, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          this.creep.moveTo(tower, { reusePath: 2, visualizePathStyle: { stroke: '#ff0000' } });
        }
      }
      // no hostile
      else {
        let targets: AnyStructure[];

        // prior find spwans and extensions
        targets = this.findSpawnsAndExtensions(this.creep);

        // find prefer transfer structure
        if (targets.length === 0) {
          if (this.memory.preferTransferStructure === 'tower') {
            targets = this.findTowers(this.creep);
          } else if (this.memory.preferTransferStructure === 'storage') {
            targets = this.findStorages(this.creep);
          }
        }

        // find towers
        if (targets.length === 0) {
          targets = this.findTowers(this.creep).sort((t1, t2) => t1.energy - t2.energy);
        }

        // find storages
        if (targets.length === 0) {
          targets = this.findStorages(this.creep);
        }

        if (targets.length > 0) {
          targets = targets.sort((s1, s2) =>
            this.creep.pos.getRangeTo(s1.pos.x, s1.pos.y) - this.creep.pos.getRangeTo(s2.pos.x, s2.pos.y));

          if (this.creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            this.creep.moveTo(targets[0], { reusePath: 2, visualizePathStyle: { stroke: '#ffaa00' } });
          }
        }
        // nothing to do, upgrade room controller
        else {
          if (this.creep.upgradeController(this.creep.room.controller!!) === ERR_NOT_IN_RANGE) {
            this.creep.moveTo(this.creep.room.controller!!, { visualizePathStyle: { stroke: '#66ccff' } });
          }
        }
      }
    }
    // harvest
    else {
      // harvest in base room
      if (this.memory.harvesterRoom === undefined || this.memory.harvesterRoom === 'base') {
        const source = FindSourceUtil.findSource(this.creep);
        if (this.creep.harvest(source) === ERR_NOT_IN_RANGE) {
          this.creep.moveTo(source, { reusePath: 2, visualizePathStyle: { stroke: '#ffffff' } });
        }
      }
      // harvest in an other room
      else {
        // move to the room to gain visibility
        if (this.creep.room.name !== this.memory.harvesterRoom) {
          this.creep.moveTo(new RoomPosition(20, 20, this.memory.harvesterRoom))
        }
        else {
          const source = FindSourceUtil.findSource(this.creep);
          if (this.creep.harvest(source) === ERR_NOT_IN_RANGE) {
            this.creep.moveTo(source, { reusePath: 2, visualizePathStyle: { stroke: '#ffffff' } });
          } else {
            console.log(this.creep.harvest(source))
          }
        }
      }
    }
  }

  private findSpawnsAndExtensions(creep: Creep) {
    return creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType === STRUCTURE_EXTENSION ||
          structure.structureType === STRUCTURE_SPAWN) &&
          structure.energy < structure.energyCapacity;
      }
    });
  }

  private findStorages(creep: Creep) {
    return creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType === STRUCTURE_STORAGE &&
          structure.store.energy < structure.storeCapacity;
      }
    });
  }

  private findTowers(creep: Creep): StructureTower[] {
    return creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType === STRUCTURE_TOWER &&
          structure.energy < (structure.energyCapacity - creep.carry.energy);
      }
    }) as StructureTower[];
  }
};
