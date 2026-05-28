import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['create-contact', 'create-order', 'process-payment', 'create-invoice', 'list-transactions', 'get-customer', 'sync']).describe('Business action'),
  system: z.enum(['stripe', 'shopify', 'salesforce', 'hubspot', 'quickbooks', 'xero']).default('stripe').describe('Business system'),
  customerId: z.string().optional().describe('Customer identifier'),
  contactData: z.object({ name: z.string().optional(), email: z.string().optional(), phone: z.string().optional(), company: z.string().optional() }).optional().describe('Contact information'),
  orderData: z.object({ items: z.array(z.object({ sku: z.string(), quantity: z.number().int(), price: z.number() })).optional(), total: z.number().optional(), currency: z.string().default('USD') }).optional().describe('Order data'),
  paymentData: z.object({ amount: z.number(), currency: z.string().default('USD'), source: z.string().optional(), description: z.string().optional() }).optional().describe('Payment details'),
  invoiceData: z.object({ lineItems: z.array(z.any()).optional(), dueDate: z.string().optional(), notes: z.string().optional() }).optional().describe('Invoice data'),
  filters: z.record(z.any()).optional().describe('Query filters')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  id: z.string().optional(),
  status: z.string().optional(),
  transactions: z.array(z.object({ id: z.string(), amount: z.number(), currency: z.string(), status: z.string(), date: z.string() })).optional(),
  invoiceUrl: z.string().optional(),
  syncStatus: z.string().optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
