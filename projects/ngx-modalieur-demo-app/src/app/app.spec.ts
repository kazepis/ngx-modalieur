import { TestBed } from '@angular/core/testing';
import { provideHighlightOptions } from 'ngx-highlightjs';

import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHighlightOptions({
          coreLibraryLoader: () => import('highlight.js/lib/core'),
          languages: {
            typescript: () => import('highlight.js/lib/languages/typescript')
          }
        })
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the demo heading and hero CTA', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Reactive Bootstrap modals');
    expect(compiled.querySelector('.demo-hero .btn-primary')?.textContent).toContain('Try confirm()');
  });

  it('should render section navigation links, including the playground', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.demo-nav a[href="#playground"]')).toBeTruthy();
    expect(compiled.querySelector('.demo-nav a[href="#getting-started"]')).toBeTruthy();
    expect(compiled.querySelector('.demo-nav a[href="#message-boxes"]')).toBeTruthy();
  });

  it('should default the playground outcome', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#playground output')?.textContent).toContain('—');
  });

  it('should update the generated playground snippet when config changes', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as {
      playgroundCode: () => string;
      pgMode: { set: (value: 'shell' | 'unstyled') => void };
    };
    expect(component.playgroundCode()).toContain('ConfirmModalComponent');
    component.pgMode.set('unstyled');
    expect(component.playgroundCode()).toContain('PlainModalComponent');
  });
});
