import { navItemsForApp } from './nav-items';

describe('navItemsForApp', () => {
  it('shows only NV KHCN navigation in qlnvkhcn', () => {
    expect(navItemsForApp('qlnvkhcn').map((item) => item.key)).toEqual(['dashboard', 'worklist', 'nvkhcn']);
  });

  it('keeps workflow and system groups in separate apps', () => {
    expect(navItemsForApp('quytrinh').map((item) => item.key)).toEqual(['quytrinh-config']);
    expect(navItemsForApp('he-thong').map((item) => item.key)).toEqual(['ph2', 'ph3']);
  });

  it('gives HR Tools its own two groups', () => {
    expect(navItemsForApp('hrtools').map((item) => item.key)).toEqual(['hr-nhiem-vu', 'hr-nhan-su']);
  });

  it('fails closed before an app is selected', () => {
    expect(navItemsForApp(null)).toEqual([]);
  });
});
