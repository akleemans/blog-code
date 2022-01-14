describe('Check digit calculation', () => {
  const controller = new IdCheckDigitCtrl();

  it('should create', () => {
    expect(controller).toBeDefined();
  });

  describe('date checksum', () => {
    it('should correctly calculate different checksums', () => {
      controller.partA = '88052200';
      controller.partB = '100000';
      controller.partC = '001001';
      controller.calculate();
      expect(controller.checksumA).toBe('3');
      expect(controller.checksumB).toBe('7');
      expect(controller.checksumC).toBe('2');
    });
  });

  describe('global checksum', () => {
    it('should correctly calculate global checksum', () => {
      controller.partA = 'S2100023';
      controller.partB = '710801';
      controller.partC = '200229';
      controller.calculate();
      expect(controller.checksumA).toBe('6');
      expect(controller.checksumB).toBe('9');
      expect(controller.checksumC).toBe('3');
      expect(controller.globalChecksum).toBe('6');
    });
  });
});
