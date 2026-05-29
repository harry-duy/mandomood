/**
 * Type shim cho stripe v22 (không có root index.d.ts)
 * Pattern tương tự next-auth-shims.d.ts (Sprint 5)
 */

declare module "stripe" {
  interface StripeConstructorOptions {
    apiVersion?: string;
    maxNetworkRetries?: number;
  }

  interface CheckoutSessionCreateParams {
    payment_method_types?: string[];
    mode: "payment" | "subscription" | "setup";
    customer_email?: string;
    line_items: Array<{ price: string; quantity: number }>;
    success_url: string;
    cancel_url: string;
    metadata?: Record<string, string>;
    allow_promotion_codes?: boolean;
  }

  interface CheckoutSession {
    id: string;
    url: string | null;
    customer_email: string | null;
    metadata: Record<string, string> | null;
    payment_status: string;
  }

  interface WebhookEvent {
    type: string;
    data: { object: Record<string, unknown> };
  }

  interface Webhooks {
    constructEvent(
      payload: string,
      sig: string,
      secret: string
    ): WebhookEvent;
  }

  class Stripe {
    webhooks: Webhooks;
    checkout: {
      sessions: {
        create(params: CheckoutSessionCreateParams): Promise<CheckoutSession>;
      };
    };
    constructor(secretKey: string, options?: StripeConstructorOptions);
  }

  export = Stripe;
}
