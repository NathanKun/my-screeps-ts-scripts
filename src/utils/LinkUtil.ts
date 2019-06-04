interface LinkPair {
  sender: StructureLink;
  receiver: StructureLink
}

interface RoomLinks {
  room: Room;
  links: LinkPair[]
}

export class LinkUtil {
  public static roomLinks: RoomLinks[] = [
    {
      room: Game.rooms['W9S7'],
      links: [
        {
          sender: Game.getObjectById('') as StructureLink,
          receiver: Game.getObjectById('') as StructureLink
        }, {
          sender: Game.getObjectById('') as StructureLink,
          receiver: Game.getObjectById('') as StructureLink
        }
      ]
    }
  ];

  public static transfer() {
    for (const roomLink of LinkUtil.roomLinks) {
      for (const links of roomLink.links) {
        if (links.sender && links.receiver && links.sender.energy > 0 && links.sender.cooldown === 0) {
          links.sender.transferEnergy(links.receiver);
        }
      }
    }
  }
}
