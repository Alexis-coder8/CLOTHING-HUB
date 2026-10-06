# LUVERIA app setup

## Configure accounts and community sharing

1. Create a Supabase project and run `supabase-setup.sql` in its SQL editor.
2. Put the project's URL and **public anon/publishable key** in `js/supabase-config.js`. Never put a service-role key in the app.
3. Enable email/password sign-up in Supabase Authentication and configure email confirmation and allowed redirect URLs for the deployed website. Add a native deep-link callback only if confirmation links should open the app directly.
4. Serve the site over HTTPS. Account sign-in, public community uploads, and comments use Supabase; without these settings, community posts are kept only on the current device and sign-in is unavailable.

## Build the mobile app

Install Node.js 20 or later, then run:

```sh
npm install
npm run build
npm run android
npm run ios
```

Android and iOS project shells are included in the repository. If you add a platform to a fresh project instead, use `npx cap add android` or `npx cap add ios` once before syncing. The native and PWA icons and launch screens are generated from the LUVERIA artwork; on Windows, rerun `powershell -ExecutionPolicy Bypass -File scripts/generate-icons.ps1` after changing the icon artwork and before syncing. Open the native projects with Android Studio and Xcode to configure signing, screenshots, permissions, and store-specific metadata. Android builds require Android Studio and its SDK. iOS builds and App Store submissions require macOS with Xcode.

## Before a store release

- Confirm `com.luveria.app` is an app ID you control and available in both stores. If you change it after generating the native projects, also update the Android namespace/application ID and iOS bundle identifier.
- Review the generated icons and launch screens against store requirements; prepare final screenshots, age/content ratings, a support contact, and a public privacy policy that describes accounts, uploaded photos, and Supabase data.
- Create Apple Developer and Google Play Console accounts, configure signing, test on real devices, and submit each store's review materials.
- Store publication is a separate manual process and is not performed by this repository.
