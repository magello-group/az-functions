// Define parameters
param functionAppName string
param location string

// Create the App Service Plan
resource functionAppPlan 'Microsoft.Web/serverfarms@2021-02-01' = {
  name: '${functionAppName}-plan'
  location: location
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
}

// Output the plan ID
output planId string = functionAppPlan.id
