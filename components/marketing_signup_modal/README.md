# Marketing Signup Modal

A modal that pops up after 3 seconds when a logged out user from outside Artsy lands on the containing page.

![](https://cloud.githubusercontent.com/assets/1022172/20072470/8735dfe4-a4f6-11e6-9364-6e05c42bf304.jpg)

## Usage

This uses config a variable to determine where it's applied. The Marketing Signup Modal supports multiple campaigns using a hardcode stringified JSON object. Use `heroku config:set` to configure a campaign. e.g. Set `MARKETING_SIGNUP_MODALS='[{"slug":"miami","copy":"Sign up for early access","image":"http://placekitten.com/200/200"}, {"slug:":"art-fair","copy":"Get exclusive access","image":"http://placekitten.com/200/200"}]'` to allow the query param ?m-id=miami to be added to any page for a modal to appear.

Examples:

`MARKETING_SIGNUP_MODALS='[{"slug":"miami","copy":"Sign up for early access","image":"http://placekitten.com/200/200"}, {"slug:":"art-fair","copy":"Get exclusive access","image":"http://placekitten.com/200/200"}]'`

If this experiment results in a worthwhile amount of collector acquistion then eventually the idea is we will replace this config data with a tool we give Marketing to manage themselves.

## Implementation

This is implemented globally in our main_layout and fair_layout component by adding the view client-side and checking against the config variables added to sharify.
