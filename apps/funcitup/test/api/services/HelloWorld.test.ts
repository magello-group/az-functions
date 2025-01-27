import { HelloWorld } from "../../../src/api/services/HelloWorld";

describe('HelloWorld Service', () => {
	test('should return hello world', async () => {
		const result = await new HelloWorld().helloWorld();
    expect(result).toStrictEqual({ message: 'Hello, world!' });
	});
});