require('./assets/styles/bulma-helpers.min.css')
require('./assets/styles/custom.css')

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import '@aws-amplify/ui-vue'
import Amplify, { Auth } from 'aws-amplify'
import VueApollo from 'vue-apollo'
import AWSAppSyncClient, { AUTH_TYPE } from 'aws-appsync'
import awsconfig from './aws-exports'
import store from './store/store'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'

/*
if (awsconfig['aws_user_files_s3_bucket'] !== undefined) {
  delete awsconfig['aws_user_files_s3_bucket']
}
if (awsconfig['aws_user_files_s3_bucket_region'] !== undefined) {
  delete awsconfig['aws_user_files_s3_bucket_region']
}
*/

Amplify.configure(awsconfig)
let JWTToken = "";

try { JWTToken = (await Auth.currentSession()).getAccessToken().getJwtToken() }
catch(E) {}

const appSyncConfig = {
  url: awsconfig.aws_appsync_graphqlEndpoint,
  region: awsconfig.aws_appsync_region,
  auth: {
    type: AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
    jwtToken: JWTToken
  }
}
const options = {
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache'
    }
  }
}

const appSyncClient = new AWSAppSyncClient(appSyncConfig, options)
const appsyncProvider = new VueApollo({
  defaultClient: appSyncClient
})
Vue.use(VueApollo)

const s3_config = {
  Storage: {
    AWSS3: {
      /*
      bucket: process.env.VUE_APP_AWS_S3_BUCKET,
      region: process.env.VUE_APP_AWS_S3_REGION,
      */
      //bucket: awsconfig.aws_user_files_s3_bucket,
      bucket: "broadcast-monitoring-458961639005-us-east-1",
      region: awsconfig.aws_user_files_s3_bucket_region,
      customPrefix: { public: '' } // without this override, amplify tries to load s3 images by prepedning "public/"
    }
  }
}
Amplify.configure(s3_config)

Vue.use(Buefy)

Vue.config.productionTip = true

console.log(awsconfig.aws_appsync_graphqlEndpoint);
console.log(awsconfig.aws_appsync_region);
console.log(awsconfig.aws_user_files_s3_bucket);
console.log(awsconfig.aws_user_files_s3_bucket_region);

new Vue({
  render: h => h(App),
  router,
  store,
  components: { App },
  apolloProvider: appsyncProvider
}).$mount('#app')
