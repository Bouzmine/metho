import { SocialSharing } from "@ionic-native/social-sharing";

export default class SocialSharingMock extends SocialSharing {
  shareViaEmail(body: string, subject: string, to: string[], cc?: string[], bcc?: string[], files?: string | string[]): Promise<any> {
    console.info("SocialSharing: shareViaEmail");
    // It doesn't seem to be possible to put HTML in the `body` of mailto (http://stackoverflow.com/questions/5620324/mailto-with-html-body)
    window.location.href = `mailto:${to[0] || "hello@gmail.com"}?subject=${subject}&body=${encodeURI(body)}`;
    return Promise.resolve();
  }
}
