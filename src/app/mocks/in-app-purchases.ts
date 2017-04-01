import { InAppPurchase } from "@ionic-native/in-app-purchase";

export default class InAppPurchaseMock extends InAppPurchase {
  buy(productId: string): Promise<any> {
    console.info("InAppPurchase: buy");
    return Promise.resolve();
  }

  getProducts(productsStrings: string[]): Promise<any> {
    console.info("InAppPurchase: getProducts");
    return Promise.resolve([
      {
        price: "1,39$",
        productId: "1"
      }
    ]);
  }

  restorePurchases(): Promise<any> {
    console.info("InAppPurchase: restorePurchases");
    return Promise.resolve([
      {
        price: "1,39$",
        productId: "1"
      }
    ]);
  }
}
