<template>
  <div class="card p-3">
    <h5 class="card-title">Application Access Token</h5>
    <h6 class="card-subtitle mb-2 text-muted">{{ app.source }}</h6>
    <div class="card-body" style="width: 800px"><pre>{{ app.accessTokenDecode }}</pre>
      <div>Calling protected API with result of {{ test.result }}</div>
      <button v-on:click="logout" class="btn btn-primary">Logout</button>
    </div>
  </div>
</template>

<script>
import Cookies from 'js-cookie';
import jwt_decode from "jwt-decode";
import axios from "axios";

export default {

  name: 'Home',
  async created() {
    const appAccessToken = Cookies.get('app.access-token');
    if (appAccessToken) {
      this.app.accessToken = appAccessToken;
      this.app.accessTokenDecode = JSON.stringify(jwt_decode(appAccessToken), null, 4);
      this.app.source = 'cookie'
    }
    if (!appAccessToken) {
      const appAccessToken = window.localStorage.getItem('app.access-token');
      if (appAccessToken) {
        this.app.accessToken = appAccessToken;
        this.app.accessTokenDecode = JSON.stringify(jwt_decode(appAccessToken), null, 4);
        this.app.source = 'local-storage'
      }
    }

    if (appAccessToken) {
          try {
            const result = await axios.get("http://localhost:3000/api/protected", {
              headers: {
                'Authorization': `Bearer ${appAccessToken}` 
              }
            });
            this.test.result = result.data;
          } catch (err) {
            this.test.result = err;
          }
    }
  },
  data() {
    return {
      app: {
        accessToken: undefined,
        source: undefined,
        accessTokenDecode: undefined,
      },
      test: {
        result: undefined
      }
    }
  },
  methods: {
    logout() {
      Cookies.remove('app.access-token');
      window.localStorage.removeItem('app.access-token');
      this.$router.push('/');
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
