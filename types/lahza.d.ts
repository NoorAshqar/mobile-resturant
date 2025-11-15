declare global {
  interface LahzaTransaction {
    reference?: string;
    status?: string;
    [key: string]: unknown;
  }

  interface LahzaTransactionConfig {
    key: string;
    amount: number;
    currency?: string;
    email?: string;
    mobile?: string;
    firstName?: string;
    lastName?: string;
    metadata?: Record<string, unknown>;
    onSuccess?: (transaction: LahzaTransaction) => void | Promise<void>;
    onCancel?: () => void;
  }

  interface LahzaPopupInstance {
    newTransaction(config: LahzaTransactionConfig): void;
  }

  interface Window {
    LahzaPopup?: new () => LahzaPopupInstance;
  }
}

export {};
