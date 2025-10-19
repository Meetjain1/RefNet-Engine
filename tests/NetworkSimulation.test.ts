import { NetworkSimulation } from '../src/simulation/NetworkSimulation';

describe('NetworkSimulation', () => {
  let sim: NetworkSimulation;

  beforeEach(() => {
    sim = new NetworkSimulation();
  });

  describe('growth simulation', () => {
    test('simulate basic growth over time', () => {
      const results = sim.simulate(0.1, 10);
      
      expect(results).toHaveLength(10);
      expect(results[0]).toBeGreaterThan(0); // day 1 should have some growth
      expect(results[results.length - 1]).toBeGreaterThanOrEqual(results[0]); // should grow
    });

    test('zero prob means no growth', () => {
      const results = sim.simulate(0, 5);
      expect(results.every(cnt => cnt === 0)).toBe(true);
    });

    test('high prob gives lots of growth', () => {
      const results = sim.simulate(0.8, 5);
      expect(results[0]).toBeGreaterThan(50); // should be significant
    });

    test('find days to hit target', () => {
      const days = sim.daysToTarget(0.1, 100);
      expect(days).toBeGreaterThan(0);
      
      // double check it actually works
      const testRun = sim.simulate(0.1, days);
      expect(testRun[testRun.length - 1]).toBeGreaterThanOrEqual(100);
    });

    test('impossible with zero prob', () => {
      const days = sim.daysToTarget(0, 100);
      expect(days).toBe(-1);
    });
  });

  describe('bonus optimization', () => {
    // mock adoption func - higher bonus = higher adoption
    const mockAdoption = (bonus: number) => Math.min(0.9, bonus / 1000);

    test('find min bonus for realistic target', () => {
      const bonus = sim.minBonusForTarget(30, 500, mockAdoption);
      
      expect(bonus).not.toBeNull();
      expect(bonus! % 10).toBe(0); // should be multiple of $10
      
      // verify it actually works
      if (bonus !== null) {
        const prob = mockAdoption(bonus);
        const testResults = sim.simulate(prob, 30);
        expect(testResults[testResults.length - 1]).toBeGreaterThanOrEqual(500);
      }
    });

    test('return null for impossible stuff', () => {
      // really low adoption rate
      const badAdoption = () => 0.001; 
      const bonus = sim.minBonusForTarget(5, 10000, badAdoption);
      
      expect(bonus).toBeNull();
    });

    test('handle case where zero bonus works', () => {
      const goodAdoption = () => 0.5; // high base rate
      const bonus = sim.minBonusForTarget(50, 100, goodAdoption);
      
      expect(bonus).not.toBeNull();
      expect(bonus).toBeGreaterThanOrEqual(0);
    });

    test('respect $10 increment rule', () => {
      const bonus = sim.minBonusForTarget(20, 300, mockAdoption);
      
      if (bonus !== null) {
        expect(bonus % 10).toBe(0);
      }
    });
  });

  describe('edge cases', () => {
    test('tiny probability values', () => {
      const results = sim.simulate(0.001, 10);
      expect(results).toHaveLength(10);
      expect(results.every(cnt => cnt >= 0)).toBe(true);
    });

    test('single day sim', () => {
      const results = sim.simulate(0.1, 1);
      expect(results).toHaveLength(1);
      expect(results[0]).toBeGreaterThan(0);
    });
  });
});
