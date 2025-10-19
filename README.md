# Referral Network System

A comprehensive referral network implementation featuring graph-based data structures, advanced network analysis algorithms, and business growth simulation with optimization capabilities.

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Implementation Details](#implementation-details)
- [Algorithm Analysis](#algorithm-analysis)
- [Testing Strategy](#testing-strategy)

## Overview

This project implements a complete referral network system that handles:
- **Graph Management**: Acyclic referral relationships with constraint enforcement
- **Network Analysis**: Multiple influence metrics and reach calculations  
- **Growth Simulation**: Mathematical modeling of network expansion over time
- **Bonus Optimization**: Binary search algorithms for cost-effective hiring targets

**Technology Stack:**
- **Language**: TypeScript 5.0
- **Runtime**: Node.js 20+
- **Testing**: Jest with comprehensive test coverage
- **Build**: Native TypeScript compiler
```

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Referral Network System                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │   ReferralNetwork   │    │    NetworkSimulation        │ │
│  │   (Core Graph)      │    │   (Growth & Optimization)   │ │
│  │                     │    │                             │ │
│  │ • Graph Storage     │    │ • Mathematical Models      │ │
│  │ • Cycle Detection   │    │ • Binary Search Algorithms │ │
│  │ • Influence Metrics │    │ • Probability Simulation   │ │
│  │ • Reach Calculations│    │ • Bonus Optimization       │ │
│  └─────────────────────┘    └─────────────────────────────┘ │
│           │                              │                  │
│           └──────────────┬───────────────┘                  │
│                          │                                  │
│  ┌───────────────────────▼──────────────────────────────┐   │
│  │                 Demo Application                     │   │
│  │              (End-to-End Integration)               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

         ▲                           ▲
         │                           │
┌────────┴─────────┐       ┌────────┴─────────┐
│   Test Suite     │       │   TypeScript     │
│                  │       │   Build System   │
│ • Unit Tests     │       │                  │
│ • Integration    │       │ • Type Safety    │
│ • Edge Cases     │       │ • Modern ES2020  │
└──────────────────┘       └──────────────────┘
```

### Component Interaction Flow

```
User Input ──► ReferralNetwork.addReferral() ──► Constraint Validation
                     │                                    │
                     ▼                                    ▼
            Graph Storage Update ◄──────────── Cycle Detection (DFS)
                     │
                     ▼
        Network Analysis ──► BFS Traversal ──► Reach Calculations
                     │              │                │
                     ▼              ▼                ▼
           Influence Metrics ──► Greedy Algorithm ──► Flow Centrality
                     │              │                │
                     ▼              ▼                ▼
         Simulation Input ──► Growth Modeling ──► Optimization Results
```

## Project Structure

### File Organization

```
mercor-challenge/
│
├── src/                          # Source code directory
│   ├── models/                   # Core data structures
│   │   └── ReferralNetwork.ts    # Main graph implementation
│   │
│   ├── simulation/               # Business logic & optimization  
│   │   └── NetworkSimulation.ts  # Growth models & algorithms
│   │
│   └── index.ts                  # Demo application & integration
│
├── tests/                        # Comprehensive test suite
│   ├── ReferralNetwork.test.ts   # Graph functionality tests
│   └── NetworkSimulation.test.ts # Simulation & optimization tests
│
├── dist/                         # Compiled JavaScript output
│   ├── models/
│   ├── simulation/
│   └── index.js
│
├── package.json                  # Project configuration & dependencies
├── tsconfig.json                 # TypeScript compiler settings
├── .gitignore                    # Version control exclusions
└── README.md                     # This documentation
```

### Component Responsibilities

| Component | Purpose | Key Methods |
|-----------|---------|-------------|
| **ReferralNetwork** | Core graph operations, constraint enforcement | `addReferral()`, `getTotalReach()`, `getFlowCentralityRanking()` |
| **NetworkSimulation** | Growth modeling, optimization algorithms | `simulate()`, `daysToTarget()`, `minBonusForTarget()` |
| **Test Suite** | Validation, edge case coverage, regression prevention | 24 comprehensive test cases |
| **Demo Application** | End-to-end integration, usage examples | `demonstrateReferralNetwork()` |

## Implementation Details

### Part 1: Core Graph Data Structure

**Design Philosophy:** Dual-mapping approach for optimal constraint enforcement

**Data Structure Design:**
```typescript
class ReferralNetwork {
  private refMap: Map<string, Set<string>>;     // referrer → {referees}
  private whoReferred: Map<string, string>;    // referee → referrer
}
```

**Key Implementation Decisions:**

1. **Adjacency List Storage (`refMap`)**
   - **Rationale**: O(1) lookup time for direct referrals, Set prevents duplicates automatically
   - **Space Efficiency**: Only stores actual relationships, no sparse matrix overhead
   - **Scalability**: Handles networks with varying connectivity patterns efficiently

2. **Reverse Mapping (`whoReferred`)**  
   - **Purpose**: Enforces "unique referrer per candidate" constraint in O(1) time
   - **Alternative Considered**: Scanning entire graph each time (O(V+E) vs O(1))
   - **Trade-off**: Extra memory for significant performance gain

3. **Cycle Detection Algorithm**
   ```
   wouldMakeCycle(referrer, candidate):
     if candidate not in network: return false
     
     stack = [candidate]
     visited = {}
     
     while stack not empty:
       current = stack.pop()
       if current == referrer: return true  // Cycle found!
       
       add current to visited
       add current's referrals to stack
   ```
   - **Approach**: Depth-First Search from candidate toward referrer
   - **Time Complexity**: O(V) worst case, typically much faster
   - **Memory**: O(V) stack space, acceptable for business-scale networks

### Part 2: Network Reach Analysis

**Algorithm Strategy:** Breadth-First Search for comprehensive reach calculation

**Core Implementation:**
```typescript
getTotalReach(user: string): number {
  const queue = [user];
  const seen = new Set<string>();
  let count = 0;
  
  while (queue.length > 0) {
    const current = queue.shift();
    // Process all direct referrals...
  }
}
```

**Design Rationale:**
- **BFS Choice**: Guarantees finding all reachable nodes systematically
- **Memory Management**: Uses visited set to prevent infinite loops and duplicate counting
- **Performance**: O(V+E) time complexity, optimal for this problem type

**Business Context for Rankings:**
- **Small K (10-20)**: Executive dashboards, strategic insights
- **Medium K (50-100)**: Team performance analysis, operational metrics  
- **Large K (>100)**: Complete network audits, comprehensive reporting

### Part 3: Advanced Influence Metrics

**Unique Reach Expansion Algorithm:**
```
1. Pre-compute full reach for each user
2. Initialize: selected = [], covered = {}
3. For each selection round:
   - Find user with maximum uncovered reach
   - Add to selected list  
   - Update covered set with user's reach
4. Return ranked selection
```

**Flow Centrality Implementation:**
```
1. Compute all-pairs shortest paths (Floyd-Warshall)
2. For each user pair (source, target):
   - Find shortest distance
   - Check each potential intermediate user
   - If intermediate lies on shortest path: increment score
3. Rank users by centrality scores
```

**Metric Comparison & Business Applications:**

| Metric | Best Use Case | Example Scenario | Computational Cost |
|--------|---------------|------------------|-------------------|
| **Total Reach** | Volume-based rewards | Quarterly bonus programs | O(V+E) per user |
| **Unique Reach** | Coverage optimization | Marketing campaign selection | O(V²) greedy approximation |
| **Flow Centrality** | Network stability | Retention strategy planning | O(V³) Floyd-Warshall |

### Part 4: Growth Simulation Engine

**Mathematical Model:**
```
Daily Growth = Active_Users × Probability × Capacity_Factor
Active_Users(day) = Initial_Users + New_Referrals - Exhausted_Users
```

**Implementation Approach:**
1. **Linear Probability Model**: Simple but captures essential growth dynamics
2. **Capacity Constraints**: Models realistic referrer fatigue (10 referrals max)
3. **Binary Search Optimization**: Efficient target day calculation

**Model Parameters:**
- **100 Initial Referrers**: Typical enterprise program launch size
- **10 Referral Capacity**: Balances growth potential with quality maintenance
- **Daily Probability**: Aligns with standard business reporting cycles

### Part 5: Bonus Optimization Algorithm  

**Binary Search Strategy:**
```
minBonusForTarget(days, target, adoptionFunction):
  1. Verify target is achievable at maximum bonus
  2. Binary search on bonus amount (in $10 increments)
  3. For each candidate bonus:
     - Get adoption probability
     - Run growth simulation  
     - Compare result to target
  4. Return minimum viable bonus
```

**Key Design Choices:**
- **$10 Increments**: Business-realistic constraint, reduces search space
- **Conservative Upper Bound**: $100,000 prevents infinite loops
- **Simulation Integration**: Validates each candidate bonus with growth model

**Time Complexity Analysis:**
- **Overall**: O(log(max_bonus) × simulation_time)  
- **Simulation**: O(days) per run
- **Search Space**: ~1,000 possible bonus values
- **Typical Runtime**: Sub-second for reasonable parameters

## Algorithm Analysis

### Performance Characteristics

| Operation | Time Complexity | Space Complexity | Typical Use Case |
|-----------|-----------------|------------------|------------------|
| **Add Referral** | O(V) | O(1) | Real-time referral processing |
| **Get Direct Refs** | O(1) | O(1) | Dashboard queries |
| **Calculate Total Reach** | O(V + E) | O(V) | Performance analysis |
| **Unique Reach Selection** | O(V² + VE) | O(V²) | Campaign planning |
| **Flow Centrality** | O(V³) | O(V²) | Strategic network analysis |
| **Growth Simulation** | O(days) | O(1) | Forecasting & planning |
| **Bonus Optimization** | O(log(B) × days) | O(1) | Real-time pricing decisions |

*Where V = users, E = referral relationships, B = maximum bonus*

### Scalability Analysis

**Small Networks (< 1,000 users):**
- All operations execute in milliseconds
- Flow centrality remains practical
- Memory usage negligible

**Medium Networks (1,000 - 10,000 users):**  
- Core operations still very fast
- Flow centrality becomes expensive but manageable
- Consider approximation algorithms for centrality at upper bound

**Large Networks (> 10,000 users):**
- May need to optimize flow centrality (use sampling or approximation)
- All other operations scale well
- Memory usage becomes more significant consideration

### Workflow Explanation

```
1. INITIALIZATION
   ├─ Create ReferralNetwork instance
   ├─ Initialize dual-mapping data structures
   └─ Prepare constraint validation systems

2. REFERRAL PROCESSING  
   ├─ Validate: No self-referrals
   ├─ Validate: Unique referrer constraint
   ├─ Check: Cycle detection (DFS traversal)
   └─ Store: Update both mapping structures

3. NETWORK ANALYSIS
   ├─ Calculate reach using BFS traversal
   ├─ Rank users by multiple metrics
   ├─ Generate influence rankings
   └─ Export results for business decisions

4. GROWTH SIMULATION
   ├─ Model daily probability-based growth
   ├─ Apply capacity constraints realistically  
   ├─ Calculate target achievement timelines
   └─ Optimize bonus structures

5. BUSINESS INTEGRATION
   ├─ Generate executive reports
   ├─ Support real-time decision making
```

**Testing Philosophy:**
- Focused on business requirements rather than implementation details
- Ensured all constraint violations are properly caught
- Added realistic edge cases based on potential production scenarios

### Problem-Solving Approach

1. **Algorithm Selection Process:**
   - Always started with simplest approach that met requirements
   - Optimized only when performance became an issue
   - Chose readability over micro-optimizations

2. **Debugging Methodology:**
   - Used extensive logging during development
   - Built small test cases to isolate issues  
   - Verified algorithms with hand-traced examples

3. **Code Organization Strategy:**
   - Separated concerns early (graph logic vs simulation logic)
   - Used descriptive variable names that explain intent
   - Added comments only where logic was non-obvious

## Testing Strategy

### Test Coverage Approach

**24 Comprehensive Test Cases covering:**

#### Core Functionality Tests
- Basic referral addition and retrieval
- Self-referral prevention  
- Unique referrer constraint enforcement
- Cycle detection in complex scenarios
- Network traversal and reach calculations

#### Edge Case Coverage  
- Empty network queries
- Single-user networks
- Impossible simulation targets
- Zero probability scenarios
- Boundary conditions for optimization

#### Integration Testing
- End-to-end workflow validation
- Cross-component data consistency
- Realistic business scenario testing

### Test Design Philosophy

**Requirement-Focused Testing:**
- Tests validate business requirements, not implementation details
- Enables confident refactoring for performance improvements  
- Focuses on API contracts rather than internal algorithms

**Realistic Scenario Testing:**
- Uses actual names (alice, bob, charlie) for readability
- Mirrors real-world network structures and growth patterns
- Includes business-realistic parameters and constraints

## Testing Strategy

**Coverage Areas:**
- **Core Constraints**: Self-referrals, unique referrers, acyclicity
- **Edge Cases**: Empty networks, single users, impossible scenarios  
- **Algorithm Correctness**: BFS reach, centrality calculations, optimization bounds
- **Business Logic**: Realistic simulation parameters, bonus increments

**Test Philosophy:**
Tests focus on business requirements rather than implementation details, ensuring reliability when refactoring algorithms for performance.

## Contact

Connect with me through the following platforms:

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/meet-jain-413015265/)
[![Twitter](https://img.shields.io/badge/X-000000?style=flat&logo=x&logoColor=white)](https://twitter.com/Meetjain_100)

### Social Media and Platforms
[![Discord](https://img.shields.io/badge/Discord-7289DA?style=flat&logo=discord&logoColor=white)](https://discordapp.com/users/meetofficial)
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=flat&logo=instagram&logoColor=white)](https://www.instagram.com/m.jain_17/)
[![Stack Overflow](https://img.shields.io/badge/Stack%20Overflow-FE7A16?style=flat&logo=stackoverflow&logoColor=white)](https://stackoverflow.com/users/21919635/meet-jain)
[![Medium](https://img.shields.io/badge/Medium-12100E?style=flat&logo=medium&logoColor=white)](https://medium.com/@meetofficialhere)
[![Hashnode](https://img.shields.io/badge/Hashnode-2962FF?style=flat&logo=hashnode&logoColor=white)](https://hashnode.com/@meetofficial)


## Support Me

<h3>If you like my work, you can support me by buying me a coffee. Thanks! </h3>

[![Buy Me A Coffee](https://img.shields.io/badge/-Buy%20Me%20A%20Coffee-orange?style=flat-square&logo=buymeacoffee)](https://buymeacoffee.com/meetjain)