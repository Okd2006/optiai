# Test Suite Catalog — OptiAI

OptiAI prioritizes absolute functional correctness for all pricing calculations. We utilize **Vitest** for unit testing due to its high performance and seamless integration with TypeScript.

---

## 📂 Test Location
- **Test File Path:** [tests/audit-engine.test.ts](file:///C:/Users/Omkrrish/.gemini/antigravity/scratch/optiai/tests/audit-engine.test.ts)
- **Engine Logic File Path:** [lib/audit-engine.ts](file:///C:/Users/Omkrrish/.gemini/antigravity/scratch/optiai/lib/audit-engine.ts)

---

## 🧪 Test Scenarios & Coverage

Our suite covers five core business logic and mathematical scenarios to guarantee pricing integrity:

### 1. Team Plan Overkill for Small Teams
- **Objective:** Verify that the engine accurately flags plans with a high cost-per-user or high billing seat minimums when allocated to single users.
- **Scenario:** A team size of 1 with ChatGPT Team ($60/mo) and Cursor Business ($40/mo).
- **Assertions:**
  - Asserts that ChatGPT Team is recommended to downgrade to ChatGPT Plus ($20/mo), securing a monthly savings of $40.
  - Asserts that Cursor Business is recommended to downgrade to Cursor Pro ($20/mo), securing a monthly savings of $20.
  - Asserts that the total monthly savings accumulate to $60 ($720/year).

### 2. Already Optimal Stack
- **Objective:** Ensure the engine does not recommend changes or generate false savings when a company has structured their accounts perfectly.
- **Scenario:** A team size of 3 with Cursor Pro (3 seats, $60/mo).
- **Assertions:**
  - Asserts that monthly savings are exactly $0.
  - Asserts that the system sets `isWellOptimized: true` and `showCredexCta: false`.
  - Asserts that the recommendation reason guides the user that their stack is optimal.

### 3. Alternative Vendor Redundancy
- **Objective:** Flag duplicate tool allocations across overlapping product categories (e.g. subscribing to multiple code assistants simultaneously).
- **Scenario:** A team size of 4 with both Cursor Pro (4 seats, $80/mo) and GitHub Copilot Individual (4 seats, $40/mo).
- **Assertions:**
  - Asserts that the engine recommends dropping GitHub Copilot completely (recommended spend: $0, Hobby/Inactive tier) since Cursor already features built-in AI code-completions.
  - Asserts that monthly savings are exactly $40.
  - Asserts that the recommendation reason flags "Cursor" and "redundant" vocabulary.

### 4. Credex Consultation CTA Threshold
- **Objective:** Verify that high-value savings profiles trigger our monetization pathway automatically.
- **Scenario:** A team size of 12 with ChatGPT Enterprise (18 seats, $1080/mo).
- **Assertions:**
  - Asserts that the engine recommends downsizing ChatGPT Enterprise to ChatGPT Team ($30/user/mo), resulting in a recommended spend of $540.
  - Asserts that monthly savings equal $540.
  - Asserts that `showCredexCta: true` is enabled, and `isWellOptimized: false` is flagged, offering the startup accelerator consultation link.

### 5. Low-Savings Honesty Case
- **Objective:** Assert absolute brand transparency by presenting honest optimization feedback for minor or optimized configurations.
- **Scenario:** A team size of 2 with ChatGPT Team (2 seats, $60/mo).
- **Assertions:**
  - Asserts that monthly savings are exactly $0.
  - Asserts that `isWellOptimized: true` is triggered, and `showCredexCta: false` is blocked, displaying our positive "already optimized" prompt.

---

## 🏃 Running the Tests Locally

Execute the test suite using our standardized npm script command:

```bash
npm test
```

### CI/CD Integration
This test suite is configured to execute automatically on every push or pull request to the `main` branch via our GitHub Actions CI pipeline. Any regression in calculation logic will instantly halt deployment builds.
