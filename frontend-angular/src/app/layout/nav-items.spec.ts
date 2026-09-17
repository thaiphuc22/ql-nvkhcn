import { navItemsForApp, visibleNavItems } from './nav-items';

describe('navItemsForApp', () => {
  it('shows NV KHCN navigation in qlnvkhcn', () => {
    expect(navItemsForApp('qlnvkhcn').map((item) => item.key)).toEqual(['worklist', 'nvkhcn']);
  });

  it('keeps dashboard with workflow config in quytrinh', () => {
    expect(navItemsForApp('quytrinh').map((item) => item.key)).toEqual(['dashboard', 'quytrinh-config']);
    expect(navItemsForApp('he-thong').map((item) => item.key)).toEqual(['ph2', 'ph3']);
  });

  it('fails closed before an app is selected', () => {
    expect(navItemsForApp(null)).toEqual([]);
  });
});

describe('visibleNavItems', () => {
  it('hides leaves the user cannot view and drops empty groups', () => {
    const items = visibleNavItems('qlnvkhcn', (code) => code === 'NV01');
    expect(items.map((item) => item.key)).toEqual(['nvkhcn']);
    const group = items[0];
    expect('children' in group && group.children.map((leaf) => leaf.key)).toEqual(['nhiem-vu']);
  });

  it('keeps ungated leaves', () => {
    const items = visibleNavItems('quytrinh', () => false);
    const config = items.find((item) => item.key === 'quytrinh-config');
    expect(config && 'children' in config ? config.children.map((leaf) => leaf.key) : []).toEqual([
      'luat',
      'matran',
      'servicetask',
      'nhatky',
    ]);
  });
});
