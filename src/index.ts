import { ReferralNetwork } from './models/ReferralNetwork';
import { NetworkSimulation } from './simulation/NetworkSimulation';

/**
 * demo of the referral network system
 */
function demonstrateReferralNetwork() {
  console.log('=== Referral Network Demo ===\n');

  // build up a network
  const network = new ReferralNetwork();
  
  console.log('1. Building network...');
  const refs = [
    ['alice', 'bob'],
    ['alice', 'charlie'],
    ['bob', 'david'],
    ['charlie', 'eve'],
    ['alice', 'frank'],
    ['frank', 'george']
  ];

  refs.forEach(([referrer, candidate]) => {
    const worked = network.addReferral(referrer, candidate);
    console.log(`   ${referrer} -> ${candidate}: ${worked ? 'OK' : 'Failed'}`);
  });

  // analyze reach
  console.log('\n2. Reach Analysis:');
  const topGuys = network.getTopReferrers(3);
  topGuys.forEach(({ user, totalReferrals }, i) => {
    console.log(`   #${i + 1}: ${user} (${totalReferrals} total reach)`);
  });

  // find influencers
  console.log('\n3. Influencers:');
  const uniqueInfluencers = network.getUniqueReachInfluencers(2);
  uniqueInfluencers.forEach(({ user, newReachAdded }, i) => {
    console.log(`   Influencer ${i + 1}: ${user} (adds ${newReachAdded} unique)`);
  });

  const flowRanking = network.getFlowCentralityRanking().slice(0, 3);
  flowRanking.forEach(({ user, centralityScore }, i) => {
    console.log(`   Broker ${i + 1}: ${user} (score: ${centralityScore})`);
  });

  // growth simulation
  console.log('\n4. Growth Sim:');
  const sim = new NetworkSimulation();
  const growth = sim.simulate(0.05, 10);
  console.log(`   Expected refs after 10 days: ${Math.round(growth[9])}`);

  const daysNeeded = sim.daysToTarget(0.05, 500);
  console.log(`   Days to hit 500 refs: ${daysNeeded}`);

  console.log('\n5. Bonus Optimization:');
  const adoptionFunc = (bonus: number) => Math.min(0.1, bonus / 2000); // max 10% at $2k
  const minBonus = sim.minBonusForTarget(30, 300, adoptionFunc);
  console.log(`   Min bonus for 300 hires in 30 days: $${minBonus || 'impossible'}`);

  console.log('\n=== Done ===');
}
// run demo if this file is executed directly
if (require.main === module) {
  demonstrateReferralNetwork();
}

export { demonstrateReferralNetwork };
