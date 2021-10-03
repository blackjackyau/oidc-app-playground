<template>
  <div>
    <button class="btn btn-primary mb-2" v-on:click="feLogin">
      <i class="fa fa-key mr-1"></i>Oidc Auth Code FE Login
    </button>
  </div>
  <div>
    <button class="btn btn-primary mb-2" v-on:click="beLogin">
      <i class="fa fa-key mr-1"></i>Oidc Auth Code BE Login
    </button>
  </div>
</template>

<script>
import * as oidcClient from "oidc-client";

export default {
  name: "Login",
  props: {
    msg: String,
  },
  methods: {
    async feLogin() {
      const origin = window.location.origin;
      const oidcConfig = {
        authority: "https://dev-875318.okta.com/oauth2/default",
        client_id: "0oacfsc1scGONyuvo357",
        redirect_uri: `${origin}/auth/callback`,
        post_logout_redirect_uri: `${origin}`,
        response_type: "code",
        scope: "openid profile email offline_access",
        loadUserInfo: false,
      };
      const userManager = new oidcClient.UserManager(oidcConfig);
      userManager.signinRedirect();
    },
    beLogin() {
      window.location.href = "http://localhost:3000/api/auth/oidc";
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
