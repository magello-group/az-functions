const { exec } = require('child_process');

describe('CLI functionality of typebox-generator', () => {
	test('should execute command successfully', done => {
		exec('node path/to/your/cli.js', (error, stdout, stderr) => {
			expect(error).toBeNull();
			expect(stderr).toBe('');
			expect(stdout).toContain('Expected output');
			done();
		});
	});
});