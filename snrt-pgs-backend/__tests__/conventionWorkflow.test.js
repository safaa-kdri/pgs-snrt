const { canGenerateSignedPdf, canResendConventionToStudent, canApplyNewSignature } = require('../src/controllers/conventionController');

describe('Convention workflow permissions', () => {
  it('allows regenerating a signed PDF from a previously sent convention', () => {
    expect(canGenerateSignedPdf('EnvoyeeEtudiant')).toBe(true);
    expect(canGenerateSignedPdf('SigneeRH')).toBe(true);
  });

  it('allows re-sending or re-signing a convention when it is already signed or sent', () => {
    expect(canResendConventionToStudent('SigneeRH')).toBe(true);
    expect(canResendConventionToStudent('EnvoyeeEtudiant')).toBe(true);
    expect(canApplyNewSignature('EnvoyeeEtudiant')).toBe(true);
  });
});
