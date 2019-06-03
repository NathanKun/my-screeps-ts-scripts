
interface RoomLink {
  room: Room;
  outLinks: StructureLink[];
  inLink: StructureLink
}

export class LinkUtil {
  public static roomLinks: RoomLink[] = [
    {
      room: Game.rooms['W9S7'],
      outLinks: [
        Game.getObjectById('') as StructureLink,
        Game.getObjectById('') as StructureLink
      ],
      inLink: Game.getObjectById('') as StructureLink
    }
  ];

  public static transfer() {
    for (const roomLink of LinkUtil.roomLinks) {
      for (const out of roomLink.outLinks) {
        //
      }
    }
  }
}
