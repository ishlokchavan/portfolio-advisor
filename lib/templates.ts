import type { PaymentPlanTemplate } from '@/types';

type Milestone = { milestone: string; due_date: string; amount: number };

const addMonths = (date: Date, months: number) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
};

export function generateMilestones(
  template: PaymentPlanTemplate,
  price: number,
  handover: string
): Milestone[] {
  const h = new Date(handover);
  const now = new Date();

  if (template === '80/20') {
    return [
      { milestone: 'Down Payment (20%)', due_date: now.toISOString().split('T')[0], amount: price * 0.2 },
      { milestone: 'Construction (60%)', due_date: addMonths(now, 6), amount: price * 0.6 },
      { milestone: 'Handover (20%)', due_date: handover, amount: price * 0.2 }
    ];
  }
  if (template === '70/30') {
    return [
      { milestone: 'Down Payment (20%)', due_date: now.toISOString().split('T')[0], amount: price * 0.2 },
      { milestone: 'Construction (50%)', due_date: addMonths(now, 6), amount: price * 0.5 },
      { milestone: 'Handover (30%)', due_date: handover, amount: price * 0.3 }
    ];
  }
  if (template === '60/40') {
    return [
      { milestone: 'Down Payment (20%)', due_date: now.toISOString().split('T')[0], amount: price * 0.2 },
      { milestone: 'Construction (40%)', due_date: addMonths(now, 6), amount: price * 0.4 },
      { milestone: 'Handover (40%)', due_date: handover, amount: price * 0.4 }
    ];
  }
  const postMilestones: Milestone[] = [
    { milestone: 'Down Payment (20%)', due_date: now.toISOString().split('T')[0], amount: price * 0.2 },
    { milestone: 'Construction (20%)', due_date: addMonths(now, 6), amount: price * 0.2 },
    { milestone: 'Handover (20%)', due_date: handover, amount: price * 0.2 }
  ];
  for (let i = 1; i <= 6; i++) {
    postMilestones.push({
      milestone: `Post-Handover ${i}`,
      due_date: addMonths(h, i * 6),
      amount: (price * 0.4) / 6
    });
  }
  return postMilestones;
}
