const { getSignedStampCoordinates } = require('../src/utils/conventionStamp');

describe('Convention stamp placement', () => {
  it('keeps the exact top-left coordinate when converting to PDF coordinates', () => {
    const pageSize = { width: 595, height: 842 };
    const position = { x: 100, y: 200, width: 150, height: 70, page: 0 };

    expect(getSignedStampCoordinates(position, pageSize)).toEqual({
      x: 100,
      y: 572,
      width: 150,
      height: 70,
      page: 0,
    });
  });

  it('clamps the stamp inside the PDF page bounds', () => {
    const pageSize = { width: 595, height: 842 };
    const position = { x: 700, y: 900, width: 150, height: 70, page: 0 };

    expect(getSignedStampCoordinates(position, pageSize)).toEqual({
      x: 445,
      y: 0,
      width: 150,
      height: 70,
      page: 0,
    });
  });
});
