export class LinkUtil {
  public static transfer(roomLinks: RoomLinks[]) {
    for (const roomLink of roomLinks) {
      for (const links of roomLink.links) {
        if (links.sender && links.receiver && links.sender.energy > 0 && links.sender.cooldown === 0) {
          links.sender.transferEnergy(links.receiver);
        }
      }
    }
  }
}
