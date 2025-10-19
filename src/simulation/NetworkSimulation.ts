export class NetworkSimulation {
  private readonly startingReferrers = 100;
  private readonly maxRefsPerUser = 10;

  /**
   * simulate growth over days with given prob
   * returns cumulative referrals at end of each day
   */
  simulate(prob: number, days: number): number[] {
    const dailyTotals: number[] = [];
    let activeUsers = this.startingReferrers;
    let totalRefs = 0;

    for (let day = 1; day <= days; day++) {
      // how many new refs we expect today
      const expectedNewRefs = activeUsers * prob;
      totalRefs += expectedNewRefs;

      // figure out how many users hit their limit
      const avgRefsPerUser = day * prob;
      
      // when users hit capacity they go inactive
      if (avgRefsPerUser >= this.maxRefsPerUser) {
        // most initial users should be inactive by now
        activeUsers = Math.max(0, this.startingReferrers - 
          Math.floor((day * prob - this.maxRefsPerUser + 1) * this.startingReferrers));
      }

      // new referrals become active too
      activeUsers += Math.floor(expectedNewRefs);

      dailyTotals.push(totalRefs);
    }

    return dailyTotals;
  }

  /**
   * find minimum days to hit target using binary search
   */
  daysToTarget(prob: number, target: number): number {
    if (prob <= 0) {
      return -1; // impossible with zero prob
    }

    // binary search setup
    let low = 1;
    let high = Math.ceil(target / (this.startingReferrers * prob)) * 2;

    // expand upper bound if needed
    while (high < 10000) {
      const testRun = this.simulate(prob, high);
      if (testRun[testRun.length - 1] >= target) {
        break;
      }
      high *= 2;
    }

    // binary search for exact day
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const testRun = this.simulate(prob, mid);
      const finalTotal = testRun[testRun.length - 1];

      if (finalTotal >= target) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }

    return low;
  }

  /**
   * find min bonus needed to hit target hires in given days
   * uses binary search on bonus amounts (multiples of $10)
   * time complexity: O(log(maxBonus) * simulation time)
   */
  minBonusForTarget(
    days: number,
    targetHires: number,
    adoptionFunc: (bonus: number) => number,
    precision: number = 1e-3
  ): number | null {
    const maxBonus = 10000; // $100k should be enough for anyone
    
    // check if even possible at max bonus
    const maxProb = adoptionFunc(maxBonus);
    const maxTest = this.simulate(maxProb, days);
    const maxPossible = maxTest[maxTest.length - 1];
    
    if (maxPossible < targetHires) {
      return null; // sorry, impossible
    }

    // binary search on bonus (in $10 steps)
    let lowBonus = 0; 
    let highBonus = maxBonus;

    while (highBonus - lowBonus > 10) { 
      const midBonus = Math.floor((lowBonus + highBonus) / 20) * 10; // round to $10
      const testProb = adoptionFunc(midBonus);
      const testRun = this.simulate(testProb, days);
      const finalHires = testRun[testRun.length - 1];

      if (finalHires >= targetHires) {
        highBonus = midBonus;
      } else {
        lowBonus = midBonus + 10;
      }
    }

    // double check our result works
    const resultBonus = Math.ceil(highBonus / 10) * 10;
    const checkProb = adoptionFunc(resultBonus);
    const checkRun = this.simulate(checkProb, days);
    const checkHires = checkRun[checkRun.length - 1];

    return checkHires >= targetHires ? resultBonus : null;
  }
}
