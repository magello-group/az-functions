// Define parameters
param appInsightsName string
param location string

// Create the Application Insights resource
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
  }
}

// Output the instrumentation key
output instrumentationKey string = appInsights.properties.InstrumentationKey
