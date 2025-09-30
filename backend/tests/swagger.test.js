const swagger = require('../services/swagger');

describe('swagger service', () => {
  it('should be an object or function', () => {
    expect(['object', 'function']).toContain(typeof swagger);
  });

  // Add more tests for swagger service if it exports functions
});
