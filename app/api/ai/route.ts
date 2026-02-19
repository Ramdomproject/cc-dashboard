import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

function buildHighlightsPrompt(data: Record<string, unknown>): string {
  return `You are a financial advisor for Custom Contracting Inc, a home services company in Ontario, Canada (roofing, eavestrough, siding, windows, doors).

Analyze this dashboard data and identify the most important financial health indicators that need attention.

Return ONLY a JSON array with 4-8 items in this exact format:
[
  {
    "metric": "Contribution Margin",
    "status": "red",
    "message": "CM is 42% — below the 50% target for profitable scaling",
    "action": "Review variable costs, especially materials and subcontractor rates",
    "section": "break-even"
  }
]

Status values: "red" (critical issue), "yellow" (needs attention), "green" (performing well)
Section values: "break-even", "scenario", "budget", "service-lines"

Focus on:
- Break-even health (revenue vs break-even gap)
- Contribution margin percentage
- Service line profitability vs targets
- Lead source cost efficiency
- Overhead as % of revenue
- Debt service coverage

Dashboard data:
${JSON.stringify(data, null, 2)}

Return ONLY the JSON array, no other text.`;
}

function buildProfitMasterPrompt(data: Record<string, unknown>): string {
  return `You are a profit optimization specialist for Custom Contracting Inc, a home services company in Ontario, Canada (roofing, eavestrough, siding, windows, doors).

Analyze this dashboard data and produce a comprehensive profit optimization report.

## 🎯 Profit Master Report — Custom Contracting Inc

### Executive Summary
(2-3 sentence overview of current financial health and biggest opportunity)

### Current State Assessment
(Key metrics: revenue, break-even, surplus, contribution margin, top service lines)

### 🚨 Critical Issues (Top 3)
(Most urgent problems that are costing money right now)

### 💡 Top 5 Profit Improvement Opportunities
(Specific, actionable opportunities ranked by impact — include estimated $ impact where possible)

### 🏆 Best Performing Service Lines
(What's working and why — replicate this)

### ⚠️ Underperforming Service Lines
(What needs fixing with specific recommendations)

### 📊 Path to Profitability
(If not profitable: what it takes to break even + 20% margin. If profitable: how to get to next level)

### ✅ 90-Day Action Plan
(Specific actions for next 30, 60, 90 days with expected impact)

Dashboard data:
${JSON.stringify(data, null, 2)}`;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured. Set ANTHROPIC_API_KEY in environment variables.' },
        { status: 500 }
      );
    }

    const { data, mode } = await request.json();

    if (!data || !mode) {
      return NextResponse.json({ error: 'Missing data or mode' }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    if (mode === 'highlights') {
      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        messages: [{ role: 'user', content: buildHighlightsPrompt(data) }],
      });

      const text = message.content[0].type === 'text' ? message.content[0].text : '[]';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const highlights = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      return NextResponse.json({ highlights });

    } else if (mode === 'profit_master') {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        messages: [{ role: 'user', content: buildProfitMasterPrompt(data) }],
      });

      const report = message.content[0].type === 'text' ? message.content[0].text : '';
      return NextResponse.json({ report });
    }

    return NextResponse.json(
      { error: 'Invalid mode. Use "highlights" or "profit_master"' },
      { status: 400 }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
