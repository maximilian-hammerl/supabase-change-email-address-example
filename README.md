# Supabase `auth.email.double_confirm_changes` bug

This repository demonstrates a bug in the Supabase authentication feature, specifically with the `auth.emaildouble_confirm_changes` configuration option in the `config.toml` file for a locally running Supabase. When set to true, this option should require a user to confirm an e-mail address change via both the old and new e-mail addresses. However, in a locally running Supabase instance, only one confirmation is required to complete the e-mail address change, regardless of the `double_confirm_changes` setting.

## Bug Description

### Expected Behavior

When `auth.email.double_confirm_changes` is enabled in the `config.toml` configuration:

> If enabled, a user will be required to confirm any e-mail change on both the old, and new e-mail addresses. If disabled, only the new e-mail is required to confirm.

https://supabase.com/docs/guides/local-development/cli/config#auth.email.double_confirm_changes

### Observed Behavior

Even when `double_confirm_changes` is set to true, the user’s e-mail address updates after clicking only one of the two confirmation links, whether from the old or the new e-mail address.

## Repository Structure

The repository is divided into two main directories:

1. `supabase` directory

Contains the Supabase project with the `config.toml` configuration file and the `request-change-email-address-links` edge function.

2. `frontend` directory

Contains a simple frontend to register a new user, request e-mail change confirmation links, and test the bug.

## Usage

1. Clone the repository
2. Start Supabase (`cd supabase/`, `npm run start`, and optionally `npm run serve`)
3. Start the frontend (`cd frontend/`, `npm install` and `npm run dev`)
4. Open the frontend at http://localhost:5173/
5. Register a new user
6. Request the change e-mail address links
7. Click on either one of the two links, then check that the e-mail address of the user has already changed without clicking on the second link

## License

This repository is open-source and available under the MIT License.
