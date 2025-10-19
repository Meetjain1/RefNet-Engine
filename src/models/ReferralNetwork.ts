export class ReferralNetwork {
  // main referral map - who refers who
  private refMap: Map<string, Set<string>> = new Map();
  // reverse lookup - who referred this person
  private whoReferred: Map<string, string> = new Map();

  /**
   * adds referral link, checks for cycles and stuff
   */
  addReferral(referrer: string, candidate: string): boolean {
    if (referrer === candidate) {
      return false; // can't refer yourself, duh
    }

    if (this.whoReferred.has(candidate)) {
      return false; // already has someone who referred them
    }

    // check if this would make a cycle
    if (this.wouldMakeCycle(referrer, candidate)) {
      return false;
    }

    // actually add the referral now
    if (!this.refMap.has(referrer)) {
      this.refMap.set(referrer, new Set());
    }
    this.refMap.get(referrer)!.add(candidate);
    this.whoReferred.set(candidate, referrer);

    return true;
  }

  /**
   * get direct referrals only
   */
  getDirectRefs(user: string): string[] {
    const refs = this.refMap.get(user);
    return refs ? Array.from(refs) : [];
  }

  /**
   * check if user exists anywhere in network
   */
  hasUser(user: string): boolean {
    return this.refMap.has(user) || this.whoReferred.has(user);
  }

  /**
   * who referred this person?
   */
  getReferrer(candidate: string): string | null {
    return this.whoReferred.get(candidate) || null;
  }

  /**
   * get everyone in the network
   */
  getAllUsers(): string[] {
    const allPeople = new Set<string>();
    
    // add all the referrers first
    for (const ref of this.refMap.keys()) {
      allPeople.add(ref);
    }
    
    // now add all the people who got referred
    for (const person of this.whoReferred.keys()) {
      allPeople.add(person);
    }
    
    return Array.from(allPeople);
  }

  /**
   * count total referrals including downstream ones (BFS)
   */
  getTotalReach(user: string): number {
    const seen = new Set<string>();
    const queue = [user];
    let cnt = 0;

    while (queue.length > 0) {
      const curr = queue.shift()!;
      
      if (seen.has(curr)) {
        continue;
      }
      seen.add(curr);

      const directRefs = this.refMap.get(curr);
      if (directRefs) {
        for (const ref of directRefs) {
          if (!seen.has(ref)) {
            queue.push(ref);
            cnt++;
          }
        }
      }
    }

    return cnt;
  }

  /**
   * get full reach list (all downstream referrals)
   */
  getFullReach(user: string): string[] {
    const reached = new Set<string>();
    const queue = [user];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      
      const directRefs = this.refMap.get(curr);
      if (directRefs) {
        for (const ref of directRefs) {
          if (!reached.has(ref)) {
            reached.add(ref);
            queue.push(ref);
          }
        }
      }
    }

    return Array.from(reached);
  }

  /**
   * get top referrers by reach
   * k should be like 10-20 for dashboards, 50+ for analysis
   */
  getTopReferrers(k: number): Array<{ user: string; totalReferrals: number }> {
    const allPeople = this.getAllUsers();
    const userStats = allPeople.map(user => ({
      user,
      totalReferrals: this.getTotalReach(user)
    }));

    return userStats
      .sort((a, b) => b.totalReferrals - a.totalReferrals)
      .slice(0, k);
  }

  /**
   * greedy algorithm to find influencers with unique reach
   * tries to minimize overlap between selected users
   */
  getUniqueReachInfluencers(k: number): Array<{ user: string; newReachAdded: number }> {
    const allPeople = this.getAllUsers();
    const reachMap = new Map<string, Set<string>>();
    
    // pre-compute everyone's reach first
    for (const person of allPeople) {
      reachMap.set(person, new Set(this.getFullReach(person)));
    }

    const picked: Array<{ user: string; newReachAdded: number }> = [];
    const coveredPeople = new Set<string>();

    for (let i = 0; i < k && picked.length < allPeople.length; i++) {
      let bestPick = '';
      let bestNewReach = 0;

      // find person who adds most new unique reach
      for (const person of allPeople) {
        if (picked.some(p => p.user === person)) {
          continue; // already picked this person
        }

        const personReach = reachMap.get(person)!;
        const newReachCount = Array.from(personReach).filter(candidate => 
          !coveredPeople.has(candidate)
        ).length;

        if (newReachCount > bestNewReach) {
          bestNewReach = newReachCount;
          bestPick = person;
        }
      }

      if (bestNewReach === 0) {
        break; // no more unique reach possible
      }

      picked.push({ user: bestPick, newReachAdded: bestNewReach });
      
      // add this person's reach to covered set
      const bestPickReach = reachMap.get(bestPick)!;
      for (const candidate of bestPickReach) {
        coveredPeople.add(candidate);
      }
    }

    return picked;
  }

  /**
   * flow centrality - finds broker users who connect network parts
   * basically finds people who are on many shortest paths
   */
  getFlowCentralityRanking(): Array<{ user: string; centralityScore: number }> {
    const allPeople = this.getAllUsers();
    const distMatrix = this.buildDistanceMatrix();
    const scores = new Map<string, number>();

    // init all scores to 0
    for (const person of allPeople) {
      scores.set(person, 0);
    }

    // for every pair, see which users are on shortest paths
    for (const src of allPeople) {
      for (const dest of allPeople) {
        if (src === dest) continue;

        const directDist = distMatrix.get(src)?.get(dest);
        if (directDist === undefined || directDist === Infinity) continue;

        // check each potential intermediate
        for (const mid of allPeople) {
          if (mid === src || mid === dest) continue;

          const srcToMid = distMatrix.get(src)?.get(mid);
          const midToDest = distMatrix.get(mid)?.get(dest);

          // if this path goes through mid and it's a shortest path
          if (srcToMid !== undefined && midToDest !== undefined &&
              srcToMid + midToDest === directDist) {
            scores.set(mid, scores.get(mid)! + 1);
          }
        }
      }
    }

    return Array.from(scores.entries())
      .map(([person, score]) => ({ user: person, centralityScore: score }))
      .sort((a, b) => b.centralityScore - a.centralityScore);
  }

  private buildDistanceMatrix(): Map<string, Map<string, number>> {
    const allPeople = this.getAllUsers();
    const dist = new Map<string, Map<string, number>>();

    // setup distance matrix with infinity
    for (const person of allPeople) {
      dist.set(person, new Map());
      for (const otherPerson of allPeople) {
        dist.get(person)!.set(otherPerson, person === otherPerson ? 0 : Infinity);
      }
    }

    // set direct connections to distance 1
    for (const [referrer, refSet] of this.refMap) {
      for (const ref of refSet) {
        dist.get(referrer)!.set(ref, 1);
      }
    }

    // floyd warshall to get all shortest paths
    for (const k of allPeople) {
      for (const i of allPeople) {
        for (const j of allPeople) {
          const currentDist = dist.get(i)!.get(j)!;
          const pathThroughK = dist.get(i)!.get(k)! + dist.get(k)!.get(j)!;
          
          if (pathThroughK < currentDist) {
            dist.get(i)!.set(j, pathThroughK);
          }
        }
      }
    }

    return dist;
  }

  private wouldMakeCycle(referrer: string, candidate: string): boolean {
    // if candidate not in network yet, definitely no cycle
    if (!this.hasUser(candidate)) {
      return false;
    }

    // use DFS to see if referrer is reachable from candidate
    const seen = new Set<string>();
    const stack = [candidate];

    while (stack.length > 0) {
      const curr = stack.pop()!;
      
      if (curr === referrer) {
        return true; // found cycle!
      }

      if (seen.has(curr)) {
        continue;
      }
      seen.add(curr);

      const currRefs = this.refMap.get(curr);
      if (currRefs) {
        for (const ref of currRefs) {
          if (!seen.has(ref)) {
            stack.push(ref);
          }
        }
      }
    }

    return false; // no cycle found
  }
}
