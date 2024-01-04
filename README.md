# You've landed on Janus

- [Remix Docs](https://remix.run/docs)

## System Requirements

- [Git][git] v2.13 or greater
- [Node.js][node] latest LTS or higher
- [Yarn][yarn] `classic` or higher

## Development

Start by installing the dependencies:

```sh
yarn install
yarn
```

Since the Remix app will run against an Express server, and our entry point _(server.ts)_ is written in TypeScript, we need to build the app before we can run it, at least the first time you run the app locally or when the `server.ts` file changes:

```sh
yarn run build
yarn build
```

Start the Remix development asset server and the Express server by running:

```sh
yarn run dev
yarn dev
```

This starts your app in development mode, which will purge the server require cache when Remix rebuilds assets so you don't need a process manager restarting the express server.

[git]: https://git-scm.com/
[node]: https://nodejs.org/
[yarn]: https://yarnpkg.com/

## How to?

### Validate form data on the server

```tsx
import { json } from '@remix-run/node';
import type { ActionArgs } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { z } from 'zod';
import { Button } from '@/components/Core/button';
import InputText from '@/components/Core/Forms/InputText';
import { submissionValidator } from '@/utils/submissionValidator.server';

// Define the schema to validate the form data against.
const schema = z.object({
  email: z.string().email('Email is invalid'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function action({ request }: ActionArgs) {
  // Parse the form data from the request.
  const formData = await request.formData();

  // Extract the relevant form fields and their values.
  const formPayload = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  // Validate the form payload against the schema using `submissionValidator`.
  const submissionResult = submissionValidator(schema, formPayload);

  // If validation fails, return an error response with the validation errors.
  if (!submissionResult.success) {
    return json(
      { response: null, errors: submissionResult.errors },
      { status: 200 },
    );
  }

  // If validation succeeds, return a success response with a message and no errors.
  return json({ response: 'Hello World', errors: null }, { status: 200 });
}

export default function LoginForm() {
  // Retrieve the action data from Remix using the `useActionData` hook.
  const actionData = useActionData<typeof action>();

  // Render the login form with appropriate props and error messages.
  return (
    <Form method="POST">
      <InputText
        error={actionData?.errors?.email != null}
        helperText={actionData?.errors?.email}
        label="Email"
        name="email"
        type="email"
      />

      <InputText
        error={actionData?.errors?.password != null}
        helperText={actionData?.errors?.password}
        label="Password"
        name="password"
        type="password"
      />

      <Button type="submit" variant="primary">
        Submit
      </Button>
    </Form>
  );
}
```

## Auth0

For more in-depth info, checkout the documentation of the libraries used:

- [Remix-auth library](https://github.com/sergiodxa/remix-auth)
- [Remix-auth-Auth0 strategry](https://github.com/danestves/remix-auth-auth0)

### Authenticating & Protecting Routes

The Auth0 auth flow is used to authenticate that a user is logged in and says who they claim to be. This serves two purposes for our app:

1. Protecting routes and pages to only be viewable by authorized users.\* (Usually done via `loaders`)
2. Providing the access token to protected API routes that require authentication/authorization. (Usually via `fetch` or `actions`)

\*\_As 04/24: "Authorized" just means logged in right now, we have no other forms of authorization implemented yet (e.g. admin only routes)

#### Protecting Routes

By default, anyone can visit any page, which isn't desired behavior for some or all routes depending. To protect a route, we can ensure that only an "Authorized" user can view it by calling the `isAuthenticated` flow in the `loader` functions! Here's how:

```javascript
import { remixAuth0 } from '@/session.server';

export async function loader(args: DataFunctionArgs): Promise<Response> {
  // pass along the `request` object from the `loader` or `action` to the `isAuthenticated()` helper and it'll return the UserToken
  const { authSession, headers } = await remixAuth0.isAuthenticated(args.request);
  // you can forward the accessToken to the client side react if needed, but it's not required
  return json(authSession.accessToken);
}
```

#### Calling the API

Most calls to the Janus API will happen in `loaders` and `actions`. Since these functions happen on server side and don't expose anything to the client side, it's preferred to use these methods to fetch data, but there are ways to fetch from the client side when needed.

Step 1: Authenticate the user (see "Protecting Routes" subsection above)
Step 2: Grab the token and fetch the data w/ `callJanusApi()` helper function. For the most part, it works exactly like `fetch` but with some things already set. ex:

```javascript
import { callJanusApi } from '@/utils/auth.server';

callJanusApi("uri", { // only need the route, domain is handled in the helper function
  method: "GET", // "POST", "DELETE", etc. Not required, defaults to "GET"
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${authToken.accessToken}`
    ...OtherProps
  },
  ...body,
  ...etc,
});
```

#### using the remixAuth0()

The auth0 library we use provides an `remixAuth0` object (exported in session.server.ts) that controls most of the auth functionality, including authentication. If you need to authenticate a user (and the `isAuthenticated()` helper doesn't cut it), you can use the `remixAuth0` object:

1. isAuthenticated(): This is to quickly check if the logged in user is authenticated without triggering the entire auth0 workflow (useful for `loaders`):

```javascript
import { remixAuth0 } from '@/session.server';

// get authenticated session data. also returns cookie headers | null
// Will throw redirect if session is invalidated or expired!
let { authSession, headers } = await remixAuth0.isAuthenticated(request);

// instantiate headers, if they are null
headers ??= new Headers();
```

Since we added Refresh Tokens to our session flows, we either have to redirect the request on a refresh cycle, or return the cookie headers and let all calling functions handle the headers.

We chose to go with the latter approach. Now all loaders and actions must handle `headers` from `isAuthenticated()`.

2. authenticate(): This is the full auth0 workflow (useful for `actions` and other `fetch` calls to the API)

```javascript
// "auth0" is the name of the strategy used (required)
return await remixAuth0.authenticate(request, {
  // redirects are optional, but a failureRedirect is most-likely preferred if authentication fails
  successRedirect: '/dashboard',
  failureRedirect: '/login',
});
```

_[See more about these functions here](https://github.com/sergiodxa/remix-auth#usage)_
