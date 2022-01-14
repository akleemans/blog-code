describe('Mobile number cost', () => {
  const controller = new PhoneNumberCtrl();

  it('should create', () => {
    expect(controller).toBeDefined();
  });

  describe('Category B', () => {
    it('should recognize 5-7 same digits at the end', () => {
      expect(controller.getCategory('0791111111')).toBe('B');
      expect(controller.subcategory).toBe('5-7 same digits at the end');

      expect(controller.getCategory('0792111111')).toBe('B');
      expect(controller.subcategory).toBe('5-7 same digits at the end');

      expect(controller.getCategory('0792311111')).toBe('B');
      expect(controller.subcategory).toBe('5-7 same digits at the end');

      expect(controller.getCategory('0799999999')).toBe('B');
      expect(controller.subcategory).toBe('5-7 same digits at the end');
    });

    it('should recognize 3 equal 3-digit block', () => {
      expect(controller.getCategory('0791791791')).toBe('B');
      expect(controller.subcategory).toBe('3 equal 3-digit blocks');

      expect(controller.getCategory('0753753753')).toBe('B');
      expect(controller.subcategory).toBe('3 equal 3-digit blocks');
    });
  });

  describe('Category C', () => {
    it('3 blocks of 2', () => {
      expect(controller.getCategory('0795616161')).toBe('C');
      expect(controller.subcategory).toBe('3 equal 2-digit blocks');

      expect(controller.getCategory('0754010101')).toBe('C');
      expect(controller.subcategory).toBe('3 equal 2-digit blocks');
    });

    it('2 blocks of 3', () => {
      expect(controller.getCategory('0793244244')).toBe('C');
      expect(controller.subcategory).toBe('2 equal 3-digit blocks');

      expect(controller.getCategory('0754144144')).toBe('C');
      expect(controller.subcategory).toBe('2 equal 3-digit blocks');
    });

    it('2 blocks of 3 equal digits', () => {
      expect(controller.getCategory('0794222888')).toBe('C');
      expect(controller.subcategory).toBe('2 blocks of 3 equal digits');

      expect(controller.getCategory('0754000111')).toBe('C');
      expect(controller.subcategory).toBe('2 blocks of 3 equal digits');
    });

    it('2 blocks of 3 equal digits', () => {
      expect(controller.getCategory('0793500600')).toBe('C');
      expect(controller.subcategory).toBe('2 3-digit blocks ending in 00');

      expect(controller.getCategory('0754100200')).toBe('C');
      expect(controller.subcategory).toBe('2 3-digit blocks ending in 00');
    });

    it('3 3-digit blocks descending', () => {
      expect(controller.getCategory('0794784774')).toBe('C');
      expect(controller.subcategory).toBe('3 3-digit blocks descending');

      expect(controller.getCategory('0791691591')).toBe('C');
      expect(controller.subcategory).toBe('3 3-digit blocks descending');
    });

    it('3 3-digit blocks ascending', () => {
      expect(controller.getCategory('0795796797')).toBe('C');
      expect(controller.subcategory).toBe('3 3-digit blocks ascending');

      expect(controller.getCategory('0791891991')).toBe('C');
      expect(controller.subcategory).toBe('3 3-digit blocks ascending');
    });
  });

  describe('Category E', () => {
    it('should recognize other numbers as Cat. E', () => {
      expect(controller.getCategory('0793862030')).toBe('E');
      expect(controller.subcategory).toBe('other');

      expect(controller.getCategory('0754162030')).toBe('E');
      expect(controller.subcategory).toBe('other');

      expect(controller.getCategory('0796732244')).toBe('E');
      expect(controller.subcategory).toBe('other');

      expect(controller.getCategory('0794567891')).toBe('E');
      expect(controller.subcategory).toBe('other');

      expect(controller.getCategory('0754167891')).toBe('E');
      expect(controller.subcategory).toBe('other');

      expect(controller.getCategory('0754091172')).toBe('E');
      expect(controller.subcategory).toBe('other');
    });
  });

});
