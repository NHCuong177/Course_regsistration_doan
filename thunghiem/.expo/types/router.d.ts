/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/../screens/ThongTinLop`; params?: Router.UnknownInputParams; } | { pathname: `/../screens/ThongTinGiangVien`; params?: Router.UnknownInputParams; } | { pathname: `/../screens/ThongBao`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/../screens/ThongTinLop`; params?: Router.UnknownOutputParams; } | { pathname: `/../screens/ThongTinGiangVien`; params?: Router.UnknownOutputParams; } | { pathname: `/../screens/ThongBao`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/${`?${string}` | `#${string}` | ''}` | `/../screens/ThongTinLop${`?${string}` | `#${string}` | ''}` | `/../screens/ThongTinGiangVien${`?${string}` | `#${string}` | ''}` | `/../screens/ThongBao${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/../screens/ThongTinLop`; params?: Router.UnknownInputParams; } | { pathname: `/../screens/ThongTinGiangVien`; params?: Router.UnknownInputParams; } | { pathname: `/../screens/ThongBao`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
    }
  }
}
