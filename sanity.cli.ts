import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
    dataset: process.env.SANITY_STUDIO_DATASET!,
  },
  /**
   * Bind to IPv4 explicitly. On Windows, Vite can otherwise listen on ::1 only,
   * which makes http://localhost:3333 / 127.0.0.1 fail with ERR_CONNECTION_REFUSED.
   */
  server: {
    hostname: process.env.SANITY_STUDIO_SERVER_HOSTNAME!,
    port: Number(process.env.SANITY_STUDIO_SERVER_PORT),
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
})
