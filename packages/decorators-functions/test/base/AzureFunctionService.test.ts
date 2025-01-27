import { AzureFunctionService } from "../../src/base/AzureFunctionService";

test('AzureFunctionService should behave as expected', () => {
	const service = new AzureFunctionService();
	expect(service).toBeDefined();
});