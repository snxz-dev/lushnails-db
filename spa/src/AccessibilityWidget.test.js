import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import AccessibilityWidget from './AccessibilityWidget';
import i18n from './i18n';

beforeEach(() => {
  localStorage.clear();
  i18n.changeLanguage('es');
  document.body.innerHTML = '<div id="root"></div>';
  document.documentElement.style.fontSize = '';
});
afterEach(cleanup);
function openWidget() {
  render(<AccessibilityWidget />);
  fireEvent.click(screen.getByRole('button', { name: 'Abrir menú de accesibilidad' }));
}
test('text size reaches its limit, persists and resets', () => {
  openWidget();
  const bigger = screen.getByRole('button', { name: i18n.t('acc.bigger') });
  for (let i = 0; i < 4; i++) fireEvent.click(bigger);
  expect(document.documentElement.style.fontSize).toBe('160%');
  expect(bigger).toBeDisabled();
  expect(localStorage.getItem('acc-font-level')).toBe('4');
  fireEvent.click(screen.getByRole('button', { name: i18n.t('acc.reset') }));
  expect(document.documentElement.style.fontSize).toBe('');
  expect(bigger).not.toBeDisabled();
});
test('visual options toggle independently and reset; background modes exclude each other', () => {
  openWidget();
  const root = document.getElementById('root');
  for (const [key, cls] of [['grayscale','grayscale'], ['negative','negative'], ['underline','underline'], ['readable','readable-font']]) {
    const button = screen.getByRole('button', { name: i18n.t(`acc.${key}`) });
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(root).toHaveClass(`acc-${cls}`);
  }
  fireEvent.click(screen.getByRole('button', { name: i18n.t('acc.contrast') }));
  fireEvent.click(screen.getByRole('button', { name: i18n.t('acc.lightbg') }));
  expect(root).toHaveClass('acc-light-bg');
  expect(root).not.toHaveClass('acc-high-contrast');
  fireEvent.click(screen.getByRole('button', { name: i18n.t('acc.reset') }));
  expect(root.className).toBe('');
});
test('language persists and Escape returns keyboard focus', () => {
  openWidget();
  fireEvent.click(screen.getByRole('button', { name: 'English' }));
  expect(localStorage.getItem('i18nextLng')).toBe('en');
  expect(document.documentElement.lang).toBe('en');
  const trigger = screen.getByRole('button', { name: 'Open accessibility menu' });
  fireEvent.click(trigger);
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(trigger).toHaveFocus();
  expect(screen.queryByRole('region')).not.toBeInTheDocument();
});
test('invalid saved font size falls back to default', () => {
  localStorage.setItem('acc-font-level', 'broken');
  openWidget();
  expect(document.documentElement.style.fontSize).toBe('');
});
