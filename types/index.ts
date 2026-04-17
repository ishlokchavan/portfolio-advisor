export type Property = {
  id: string;
  project_name: string;
  developer: string | null;
  unit_number: string | null;
  purchase_price: number;
  payment_plan_type: string | null;
  expected_handover: string | null;
  created_by: string;
  created_at: string;
};

export type PropertyOwner = {
  id: string;
  property_id: string;
  user_id: string;
  ownership_percentage: number;
  role: string | null;
  created_at: string;
};

export type PaymentStatus = 'paid' | 'upcoming' | 'overdue';

export type PaymentSchedule = {
  id: string;
  property_id: string;
  milestone: string;
  due_date: string;
  amount: number;
  status: PaymentStatus;
  created_at: string;
};

export type PaymentPlanTemplate = '80/20' | '70/30' | '60/40' | 'Post Handover';
