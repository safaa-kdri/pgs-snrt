const backendPackage = require('../package.json');

describe('Convention PDF generation dependency', () => {
  it('declares pdf-lib as a direct backend dependency', () => {
    expect(backendPackage.dependencies).toHaveProperty('pdf-lib');
  });
});
