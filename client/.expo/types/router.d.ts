/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `` | `/` | `/(routes)/AllNotices` | `/(routes)/ChatJusticeBot` | `/(routes)/MySearchNotices` | `/(routes)/PublishNotice` | `/(routes)/UpdatePassword` | `/(routes)/UpdateProfile` | `/(routes)/article` | `/(routes)/forgot-password` | `/(routes)/login` | `/(routes)/notice-details` | `/(routes)/onboarding` | `/(routes)/sign-up` | `/(routes)/verifyAccount` | `/(routes)/welcome-intro` | `/(routes)\AllAdds\` | `/(routes)\createAd\` | `/(tabs)` | `/AllNotices` | `/ChatJusticeBot` | `/MySearchNotices` | `/PublishNotice` | `/UpdatePassword` | `/UpdateProfile` | `/_sitemap` | `/article` | `/forgot-password` | `/login` | `/notice-details` | `/notices` | `/onboarding` | `/profile` | `/search` | `/sign-up` | `/verifyAccount` | `/welcome-intro`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
