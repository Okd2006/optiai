import { describe, it, expect } from 'vitest';
import { runAudit, AuditInput } from '../lib/audit-engine';

describe('OptiAI Cost Audit Calculations Engine', () => {

  // Test Case 1: Team plan overkill for small teams
  it('should recommend downgrading team plan overkill for super small teams', () => {
    const input: AuditInput = {
      teamSize: 1,
      primaryUseCase: 'coding',
      tools: [
        {
          toolId: 'chatgpt',
          planName: 'Team',
          seats: 1,
          monthlySpend: 60 // 2 seats min * $30
        },
        {
          toolId: 'cursor',
          planName: 'Business',
          seats: 1,
          monthlySpend: 40
        }
      ]
    };

    const results = runAudit(input);
    
    // ChatGPT Team should downgrade to Plus ($20/user/mo)
    const chatGptRec = results.recommendations.find(r => r.toolId === 'chatgpt');
    expect(chatGptRec).toBeDefined();
    expect(chatGptRec?.recommendedPlan).toBe('Plus');
    expect(chatGptRec?.recommendedSpend).toBe(20);
    expect(chatGptRec?.monthlySavings).toBe(40); // 60 - 20 = 40

    // Cursor Business should downgrade to Pro ($20/user/mo)
    const cursorRec = results.recommendations.find(r => r.toolId === 'cursor');
    expect(cursorRec).toBeDefined();
    expect(cursorRec?.recommendedPlan).toBe('Pro');
    expect(cursorRec?.recommendedSpend).toBe(20);
    expect(cursorRec?.monthlySavings).toBe(20); // 40 - 20 = 20

    expect(results.totalMonthlySavings).toBe(60);
    expect(results.totalAnnualSavings).toBe(720);
  });

  // Test Case 2: Already optimal stack plan
  it('should detect when an AI subscription stack is already fully optimized', () => {
    const input: AuditInput = {
      teamSize: 3,
      primaryUseCase: 'coding',
      tools: [
        {
          toolId: 'cursor',
          planName: 'Pro',
          seats: 3,
          monthlySpend: 60 // 3 * $20
        }
      ]
    };

    const results = runAudit(input);
    expect(results.totalMonthlySavings).toBe(0);
    expect(results.isWellOptimized).toBe(true);
    expect(results.showCredexCta).toBe(false);
    expect(results.recommendations[0].reason).toContain('optimized');
  });

  // Test Case 3: Alternative vendor recommendation & redundancy
  it('should recommend dropping GitHub Copilot if developers are using Cursor IDE', () => {
    const input: AuditInput = {
      teamSize: 4,
      primaryUseCase: 'coding',
      tools: [
        {
          toolId: 'cursor',
          planName: 'Pro',
          seats: 4,
          monthlySpend: 80
        },
        {
          toolId: 'copilot',
          planName: 'Individual',
          seats: 4,
          monthlySpend: 40
        }
      ]
    };

    const results = runAudit(input);
    
    // Copilot should be cancelled (recommended spend 0, Hobby/Inactive)
    const copilotRec = results.recommendations.find(r => r.toolId === 'copilot');
    expect(copilotRec).toBeDefined();
    expect(copilotRec?.recommendedSpend).toBe(0);
    expect(copilotRec?.monthlySavings).toBe(40);
    expect(copilotRec?.reason).toContain('Cursor');
    expect(copilotRec?.reason).toContain('redundant');
  });

  // Test Case 4: Credex consultation CTA threshold (> $500/mo savings)
  it('should trigger strong Credex partner credits CTA if savings exceed $500/month', () => {
    const input: AuditInput = {
      teamSize: 12,
      primaryUseCase: 'coding',
      tools: [
        {
          toolId: 'chatgpt',
          planName: 'Enterprise',
          seats: 18,
          monthlySpend: 1080 // 18 * $60
        }
      ]
    };

    const results = runAudit(input);
    
    // Recommend downgrade to ChatGPT Team ($30/user/mo)
    const chatgptRec = results.recommendations.find(r => r.toolId === 'chatgpt');
    expect(chatgptRec).toBeDefined();
    expect(chatgptRec?.recommendedSpend).toBe(540); // 18 * $30
    expect(chatgptRec?.monthlySavings).toBe(540); // 1080 - 540
    
    expect(results.totalMonthlySavings).toBe(540);
    expect(results.showCredexCta).toBe(true);
    expect(results.isWellOptimized).toBe(false);
  });

  // Test Case 5: Low-savings honesty case (< $100/mo savings)
  it('should report honest messaging if savings are low (< $100/month)', () => {
    const input: AuditInput = {
      teamSize: 2,
      primaryUseCase: 'writing',
      tools: [
        {
          toolId: 'chatgpt',
          planName: 'Team',
          seats: 2,
          monthlySpend: 60
        }
      ]
    };

    const results = runAudit(input);
    
    // For 2 users, ChatGPT Team (2 seats) is already optimal, so savings = 0
    expect(results.totalMonthlySavings).toBe(0);
    expect(results.isWellOptimized).toBe(true);
    expect(results.showCredexCta).toBe(false);
  });
});
