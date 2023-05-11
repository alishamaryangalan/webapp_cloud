var assert = require('assert');

describe("Adding two numbers", () => {
    describe( "Test1", () => {
        beforeEach(() => {
          console.log( "executes before every test" );
        });
      
        it("Is returning 6 when multiplying 2 * 3", () => {
          assert.equal(2*3, 6);
        });
      });
      describe("Test2", () => {
        beforeEach(() => {
          console.log( "executes before every test" );
        });
      
        it("Is returning 8 when multiplying 2 * 4", () => {
          assert.equal(2*4, 8);
        });
      });
});
