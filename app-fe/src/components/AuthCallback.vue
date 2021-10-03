<template>
  Redirecting ...
</template>

<script>
import * as oidcClient from "oidc-client";
import axios from "axios";

export default {
  name: "AuthCallback",
  async created() {
    const origin = window.location.origin;
    const oidcConfig = {
      authority: "https://dev-875318.okta.com/oauth2/default",
      client_id: "0oacfsc1scGONyuvo357",
      redirect_uri: `${origin}/api/auth/callback`,
      post_logout_redirect_uri: `${origin}`,
      response_type: "code",
      scope: "openid profile email offline_access",
      loadUserInfo: false,
    };
    const userManager = new oidcClient.UserManager(oidcConfig);
    const { state, response } = await userManager["readSigninResponseState"](window.location.href, undefined, true);

    const request = {
      client_id: state.client_id,
      client_secret: state.client_secret,
      code: response.code,
      redirect_uri: state.redirect_uri,
      code_verifier: state.code_verifier,
    };
    const result = await axios.post("http://localhost:3000/api/auth/oidc-fe/callback", request);
    window.localStorage.setItem('app.access-token', result.data.token);
    this.$router.push('/home');
  },
  methods: {
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
