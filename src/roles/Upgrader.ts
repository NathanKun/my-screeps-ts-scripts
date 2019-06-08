import { FindSourceUtil } from "utils/FindSourceUtil";
import { BaseCreep } from "./BaseCreep";

export class Upgrader extends BaseCreep {

  public link: StructureLink | null = null;
  public roomLinks: RoomLinks[];

  constructor(creep: Creep, roomLinks: RoomLinks[]) {
    super(creep);
    this.roomLinks = roomLinks;
  }

  protected run() {
    if (this.memory.upgrading && this.carry.energy === 0) {
      this.memory.upgrading = false;
      this.say('🔄 harvest');
    }
    if (!this.memory.upgrading && this.carry.energy === this.carryCapacity) {
      this.memory.upgrading = true;
      FindSourceUtil.clear(this);
      this.say('⚡ upgrade');
    }

    // upgrade room controller
    if (this.memory.upgrading) {
      if (this.upgradeController(this.room.controller!!) === ERR_NOT_IN_RANGE) {
        this.moveTo(this.room.controller!!, { maxRooms: 1, visualizePathStyle: { stroke: '#66ccff' } });
      }
    }
    // harvest or withdraw link
    else {
      // check if has link in memory and link has energy
      if (this.memory.upgraderLinkTarget) {
        const link = Game.getObjectById(this.memory.upgraderLinkTarget);
        if (link === null || (link as StructureLink).energy === 0) {
          this.memory.upgraderLinkTarget = undefined;
        }
      }

      // find a valid link
      if (this.memory.upgraderLinkTarget === undefined) {
        for (const roomLink of this.roomLinks) {
          if (roomLink.room.name === this.room.name) {
            for (const links of roomLink.links) {
              if (links.receiver && links.receiver.energy > 0 && this.pos.getRangeTo(links.receiver.pos) < 10) {
                this.memory.upgraderLinkTarget = links.receiver.id;
              }
            }
          }
        }
      }

      // withdraw link
      if (this.memory.upgraderLinkTarget) {
        const link = Game.getObjectById(this.memory.upgraderLinkTarget) as StructureLink;
        const res = this.withdraw(link, RESOURCE_ENERGY);
        if (res === ERR_NOT_IN_RANGE) {
          this.moveTo(link, { visualizePathStyle: { stroke: '#ffffff' } });
        } else if (res === OK) {
          this.memory.upgrading = true;
          this.say('⚡ upgrade');
        }
      }
      // withdraw storage
      else if (this.memory.upgraderUseStorageMin !== undefined) {
        const storage = this.room.find(FIND_MY_STRUCTURES, {
          filter: s => s.structureType === STRUCTURE_STORAGE && s.store.energy > this.memory.upgraderUseStorageMin!!
        });

        if (storage.length) {
          if (this.withdraw(storage[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            this.moveTo(storage[0], { maxRooms: 1, visualizePathStyle: { stroke: '#ffffff' } });
          }
        }
      }
      // harvest
      else {
        const source = FindSourceUtil.findSource(this);
        if (this.harvest(source) === ERR_NOT_IN_RANGE) {
          this.moveTo(source, { maxRooms: 1, visualizePathStyle: { stroke: '#ffffff' } });
        }
      }
    }
  }
};
