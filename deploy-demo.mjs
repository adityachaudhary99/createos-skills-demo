// Dogfooding: deploy the demo page using opencode-createos plugin
import { deploy } from "file:///C:/Users/adity/Documents/opencode-createos/dist/tools/deploy.js"
import { CreateOSClient } from "file:///C:/Users/adity/Documents/opencode-createos/dist/client.js"

const apiKey = process.env.CREATEOS_API_KEY
if (!apiKey) {
  console.error("Error: CREATEOS_API_KEY not set")
  process.exit(1)
}

async function main() {
  // 1. First, check GitHub connection via the plugin's client
  const client = new CreateOSClient(apiKey)
  const accounts = await client.listGithubAccounts()
  console.log(`GitHub accounts: ${accounts.length}`)
  if (accounts.length === 0) {
    console.error("No GitHub accounts connected. Install the GitHub app first.")
    process.exit(1)
  }

  const acct = accounts[0]
  console.log(`Using account: ${acct.name} (id: ${acct.id})`)

  // 2. Find the demo repo
  const repos = await client.listGithubRepositories(acct.id)
  const demoRepo = repos.find(r => r.name === "createos-skills-demo")
  if (!demoRepo) {
    console.error("Demo repo not found. Create it first.")
    process.exit(1)
  }
  console.log(`Found repo: ${demoRepo.fullName} (id: ${demoRepo.id})`)

  // 3. Deploy via the plugin tool
  console.log("\n--- Calling createos_deploy ---")
  const result = await deploy.execute({
    projectName: "createos-skills-demo",
    displayName: "CreateOS Skills Demo",
    type: "vcs",
    vcsInstallationId: acct.id,
    vcsRepoId: String(demoRepo.id),
    runtime: "node:20",
    port: 80,
    framework: "vanilla-js",
    branch: "main",
    environmentName: "production",
    resourceCpu: 200,
    resourceMemory: 500,
    resourceReplicas: 1,
  })

  console.log(result)

  // 4. Get project info to find the deployment URL
  console.log("\n--- Project created! Poll for deployment status ---")
  console.log("Run: createos_get_project({ projectId: 'createos-skills-demo' })")
}

main().catch(err => {
  console.error("Deploy failed:", err.message)
  process.exit(1)
})
