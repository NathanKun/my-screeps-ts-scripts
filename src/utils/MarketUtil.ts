export class MarketUtil {
  public static doMarket(rooms: RoomConfig[]): void {
    if (Memory.lastDoMarket !== undefined && Game.time - Memory.lastDoMarket < 15) {
      return;
    }

    Memory.lastDoMarket = Game.time;

    const terminals = (rooms
      .map(r => r.room.terminal)
      .filter(t => t && t.store.energy > 10000) as StructureTerminal[])
      .sort((t1, t2) => t2.store.energy - t1.store.energy);

    if (!terminals.length) {
      return;
    }

    let sellMinPrice = 0.004;

    if (terminals[0].store.energy / terminals[0].storeCapacity >= 0.99) {
      sellMinPrice = 0.001;
    }

    const sellOrders = Game.market.getAllOrders(
      (order) =>
        order.type === ORDER_BUY && order.resourceType === RESOURCE_ENERGY && order.price >= sellMinPrice
    );

    for (const order of sellOrders) {
      const amount = order.amount > terminals[0].store.energy ? terminals[0].store.energy : order.amount;
      Game.market.deal(order.id, amount, terminals[0].room.name)
      console.log('Deal ' + amount + ' of energy with price ' + order.price);
    }
  }
}
