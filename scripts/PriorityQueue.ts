// scripts/PriorityQueue.ts

export interface UserPosition {
  id: string;              // User Wallet Address
  healthFactor: number;    // Health Score (Agar < 1 hai toh shikar hai)
  totalCollateralUSD: number;
  totalDebtUSD: number;
}

export class PriorityQueue {
  private queue: UserPosition[] = [];

  // Naya user add karo
  enqueue(item: UserPosition) {
    this.queue.push(item);
    this.sort();
  }

  // List ko sort karo: Jiska Health Factor sabse kam, wo sabse upar
  private sort() {
    this.queue.sort((a, b) => a.healthFactor - b.healthFactor);
  }

  // Sabse risky user ko bahar nikalo (Target)
  dequeue(): UserPosition | undefined {
    return this.queue.shift();
  }

  // Queue khali hai ya nahi?
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  // Poori list dekhne ke liye
  getAll(): UserPosition[] {
    return this.queue;
  }
}