import { ReferralNetwork } from '../src/models/ReferralNetwork';

describe('ReferralNetwork', () => {
  let network: ReferralNetwork;

  beforeEach(() => {
    network = new ReferralNetwork();
  });

  describe('basic referral stuff', () => {
    test('should add referral when everything is fine', () => {
      expect(network.addReferral('alice', 'bob')).toBe(true);
      expect(network.getDirectRefs('alice')).toEqual(['bob']);
    });

    test('cant refer yourself obviously', () => {
      expect(network.addReferral('alice', 'alice')).toBe(false);
      expect(network.getDirectRefs('alice')).toEqual([]);
    });

    test('one person can only have one referrer', () => {
      network.addReferral('alice', 'charlie');
      expect(network.addReferral('bob', 'charlie')).toBe(false);
      expect(network.getReferrer('charlie')).toBe('alice');
    });

    test('should prevent cycles', () => {
      network.addReferral('alice', 'bob');
      network.addReferral('bob', 'charlie');
      expect(network.addReferral('charlie', 'alice')).toBe(false);
    });

    test('complex cycle prevention', () => {
      // make chain: alice -> bob -> charlie -> david
      network.addReferral('alice', 'bob');
      network.addReferral('bob', 'charlie');
      network.addReferral('charlie', 'david');
      
      // try to close cycle anywhere
      expect(network.addReferral('david', 'alice')).toBe(false);
      expect(network.addReferral('david', 'bob')).toBe(false);
      expect(network.addReferral('charlie', 'alice')).toBe(false);
    });

    test('get all users works', () => {
      network.addReferral('alice', 'bob');
      network.addReferral('charlie', 'david');
      
      const people = network.getAllUsers().sort();
      expect(people).toEqual(['alice', 'bob', 'charlie', 'david']);
    });
  });

  describe('reach calculations', () => {
    beforeEach(() => {
      // setup test network: alice -> bob -> charlie, alice -> david
      network.addReferral('alice', 'bob');
      network.addReferral('bob', 'charlie');
      network.addReferral('alice', 'david');
      network.addReferral('eve', 'frank');
    });

    test('total reach including downstream', () => {
      expect(network.getTotalReach('alice')).toBe(3); // bob, charlie, david
      expect(network.getTotalReach('bob')).toBe(1); // charlie
      expect(network.getTotalReach('eve')).toBe(1); // frank
      expect(network.getTotalReach('charlie')).toBe(0); // no refs
    });

    test('full reach list', () => {
      const aliceReach = network.getFullReach('alice').sort();
      expect(aliceReach).toEqual(['bob', 'charlie', 'david']);
      
      const bobReach = network.getFullReach('bob');
      expect(bobReach).toEqual(['charlie']);
    });

    test('top referrers ranking', () => {
      const topGuys = network.getTopReferrers(3);
      
      expect(topGuys[0].user).toBe('alice');
      expect(topGuys[0].totalReferrals).toBe(3);
      expect(topGuys[1].totalReferrals).toBe(1);
    });
  });

  describe('influencer detection', () => {
    beforeEach(() => {
      // network with some overlap
      network.addReferral('alice', 'common1');
      network.addReferral('alice', 'unique1');
      network.addReferral('bob', 'common2'); // common1 already taken by alice
      network.addReferral('bob', 'unique2');
      network.addReferral('charlie', 'unique3');
    });

    test('unique reach influencers work', () => {
      const uniqueInfluencers = network.getUniqueReachInfluencers(2);
      
      expect(uniqueInfluencers.length).toBeGreaterThan(0);
      expect(uniqueInfluencers[0].newReachAdded).toBeGreaterThanOrEqual(0);
    });

    test('flow centrality calculation', () => {
      // add more connections for better centrality test
      network.addReferral('common1', 'bridge');
      network.addReferral('common2', 'endpoint');
      
      const rankings = network.getFlowCentralityRanking();
      
      expect(rankings).toBeInstanceOf(Array);
      expect(rankings.length).toBeGreaterThan(0);
      expect(rankings[0]).toHaveProperty('user');
      expect(rankings[0]).toHaveProperty('centralityScore');
    });
  });

  describe('edge cases and weird stuff', () => {
    test('empty network queries dont crash', () => {
      expect(network.getDirectRefs('nobody')).toEqual([]);
      expect(network.getTotalReach('nobody')).toBe(0);
      expect(network.getReferrer('nobody')).toBeNull();
    });

    test('single user network', () => {
      network.addReferral('loner', 'friend');
      expect(network.getAllUsers()).toEqual(['loner', 'friend']);
      expect(network.getTotalReach('loner')).toBe(1);
    });
  });
});
