/**
 * TypeScript declarations for Izipay V1 SDK
 */

declare global {
  interface Window {
    Izipay: typeof Izipay;
  }
}

declare class Izipay {
  constructor(options: { config: IzipayConfig });
  
  LoadForm(options: {
    authorization: string;
    keyRSA: string;
    callbackResponse: (response: any) => void;
  }): void;

  static enums: {
    payActions: {
      PAY: string;
    };
    processType: {
      AUTHORIZATION: string;
    };
    showMethods: {
      ALL: string;
    };
    documentType: {
      DNI: string;
      RUC: string;
    };
    typeForm: {
      IFRAME: string;
      POP_UP: string;
    };
  };
}

interface IzipayConfig {
  transactionId: string;
  action: string;
  merchantCode: string;
  order: {
    orderNumber: string;
    currency: string;
    amount: string;
    processType: string;
    merchantBuyerId: string;
    dateTimeTransaction: string;
    payMethod: string;
  };
  billing: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    document: string;
    documentType: string;
  };
  render: {
    typeForm: string;
    container: string;
    showButtonProcessForm: boolean;
  };
  appearance?: {
    logo?: string;
  };
}

export {};