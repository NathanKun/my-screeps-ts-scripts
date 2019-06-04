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
          sender: Game.getObjectById('5cf53529ac644b09c5efd05c') as StructureLink,
          receiver: Game.getObjectById('5cf53c6d03632c664c611dce') as StructureLink
        }, {
          sender: Game.getObjectById('5cf543d960fc8009c45c72d3') as StructureLink,
          receiver: Game.getObjectById('5cf53c6d03632c664c611dce') as StructureLink
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
