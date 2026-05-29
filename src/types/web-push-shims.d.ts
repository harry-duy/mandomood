/**
 * Type shim cho web-push
 * Cài: npm install web-push (optional, chỉ cần khi dùng push notifications)
 */
declare module "web-push" {
  interface PushSubscription {
    endpoint: string;
    keys?: { p256dh: string; auth: string };
  }

  interface VapidDetails {
    subject: string;
    publicKey: string;
    privateKey: string;
  }

  function setVapidDetails(subject: string, publicKey: string, privateKey: string): void;
  function sendNotification(
    subscription: PushSubscription | unknown,
    payload: string | Buffer,
    options?: Record<string, unknown>
  ): Promise<{ statusCode: number; body: string; headers: Record<string, string> }>;

  export { setVapidDetails, sendNotification, PushSubscription };
  const webpush: { setVapidDetails: typeof setVapidDetails; sendNotification: typeof sendNotification };
  export default webpush;
}
