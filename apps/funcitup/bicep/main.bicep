// Define parameters
param baseName string = 'DevApp'
param location string = 'northeurope'
param functionAppName string = toLower('${baseName}Func${uniqueString(resourceGroup().id)}')
param storageAccountName string = toLower(substring('${baseName}storage${uniqueString(resourceGroup().id)}', 0, 24))
param appInsightsName string = 'FunctionAppInsights'

// az deployment group create --resource-group ServerlessDev --template-file bicep/main.bicep
// Resource Group: ServerlessDev

// Import modules
module storageAccount 'storageAccount.bicep' = {
  name: 'storageAccountModule'
  params: {
    storageAccountName: storageAccountName
    location: location
  }
}

module appInsights 'appInsights.bicep' = {
  name: 'appInsightsModule'
  params: {
    appInsightsName: appInsightsName
    location: location
  }
}

module functionAppPlan 'functionAppPlan.bicep' = {
  name: 'functionAppPlanModule'
  params: {
    functionAppName: functionAppName
    location: location
  }
}

module functionApp 'functionApp.bicep' = {
  name: 'functionAppModule'
  params: {
    functionAppName: functionAppName
    location: location
    storageAccountConnectionString: storageAccount.outputs.connectionString
    appInsightsInstrumentationKey: appInsights.outputs.instrumentationKey
    functionAppPlanId: functionAppPlan.outputs.planId
  }
}
