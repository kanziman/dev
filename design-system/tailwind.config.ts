import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          normal:  'var(--semantic-primary-normal)',
          strong:  'var(--semantic-primary-strong)',
          heavy:   'var(--semantic-primary-heavy)',
        },
        label: {
          normal:      'var(--semantic-label-normal)',
          strong:      'var(--semantic-label-strong)',
          neutral:     'var(--semantic-label-neutral)',
          alternative: 'var(--semantic-label-alternative)',
          assistive:   'var(--semantic-label-assistive)',
          disable:     'var(--semantic-label-disable)',
        },
        background: {
          'normal-normal':      'var(--semantic-background-normal-normal)',
          'normal-alternative': 'var(--semantic-background-normal-alternative)',
          'elevated-normal':    'var(--semantic-background-elevated-normal)',
        },
        line: {
          'normal-normal': 'var(--semantic-line-normal-normal)',
          'solid-normal':  'var(--semantic-line-solid-normal)',
        },
        fill: {
          normal: 'var(--semantic-fill-normal)',
          strong: 'var(--semantic-fill-strong)',
        },
        status: {
          positive:   'var(--semantic-status-positive)',
          cautionary: 'var(--semantic-status-cautionary)',
          negative:   'var(--semantic-status-negative)',
        },
        interaction: {
          inactive: 'var(--semantic-interaction-inactive)',
          disable:  'var(--semantic-interaction-disable)',
        },
        inverse: {
          primary:    'var(--semantic-inverse-primary)',
          background: 'var(--semantic-inverse-background)',
        },
        material: {
          dimmer: 'var(--semantic-material-dimmer)',
        },
        accent: {
          'red-orange': 'var(--semantic-accent-background-red-orange)',
          lime:         'var(--semantic-accent-background-lime)',
          cyan:         'var(--semantic-accent-background-cyan)',
          'light-blue': 'var(--semantic-accent-background-light-blue)',
          violet:       'var(--semantic-accent-background-violet)',
          purple:       'var(--semantic-accent-background-purple)',
          pink:         'var(--semantic-accent-background-pink)',
        },
      },

      fontFamily: {
        sans: ['Pretendard', 'sans-serif'],
      },

      fontSize: {
        display1:  ['var(--font-display1-size)',  { lineHeight: 'var(--font-display1-lh)',  letterSpacing: 'var(--font-display1-ls)',  fontWeight: 'var(--font-display1-weight)' }],
        display2:  ['var(--font-display2-size)',  { lineHeight: 'var(--font-display2-lh)',  letterSpacing: 'var(--font-display2-ls)',  fontWeight: 'var(--font-display2-weight)' }],
        display3:  ['var(--font-display3-size)',  { lineHeight: 'var(--font-display3-lh)',  letterSpacing: 'var(--font-display3-ls)',  fontWeight: 'var(--font-display3-weight)' }],
        title1:    ['var(--font-title1-size)',    { lineHeight: 'var(--font-title1-lh)',    letterSpacing: 'var(--font-title1-ls)',    fontWeight: 'var(--font-title1-weight)' }],
        title2:    ['var(--font-title2-size)',    { lineHeight: 'var(--font-title2-lh)',    letterSpacing: 'var(--font-title2-ls)',    fontWeight: 'var(--font-title2-weight)' }],
        title3:    ['var(--font-title3-size)',    { lineHeight: 'var(--font-title3-lh)',    letterSpacing: 'var(--font-title3-ls)',    fontWeight: 'var(--font-title3-weight)' }],
        heading1:  ['var(--font-heading1-size)',  { lineHeight: 'var(--font-heading1-lh)',  letterSpacing: 'var(--font-heading1-ls)',  fontWeight: 'var(--font-heading1-weight)' }],
        heading2:  ['var(--font-heading2-size)',  { lineHeight: 'var(--font-heading2-lh)',  letterSpacing: 'var(--font-heading2-ls)',  fontWeight: 'var(--font-heading2-weight)' }],
        headline1: ['var(--font-headline1-size)', { lineHeight: 'var(--font-headline1-lh)', letterSpacing: 'var(--font-headline1-ls)', fontWeight: 'var(--font-headline1-weight)' }],
        headline2: ['var(--font-headline2-size)', { lineHeight: 'var(--font-headline2-lh)', letterSpacing: 'var(--font-headline2-ls)', fontWeight: 'var(--font-headline2-weight)' }],
        body1:     ['var(--font-body1-size)',     { lineHeight: 'var(--font-body1-lh)',     letterSpacing: 'var(--font-body1-ls)',     fontWeight: 'var(--font-body1-weight)' }],
        'body1-reading': ['var(--font-body1-size)', { lineHeight: 'var(--font-body1-reading-lh)', letterSpacing: 'var(--font-body1-ls)', fontWeight: 'var(--font-body1-weight)' }],
        body2:     ['var(--font-body2-size)',     { lineHeight: 'var(--font-body2-lh)',     letterSpacing: 'var(--font-body2-ls)',     fontWeight: 'var(--font-body2-weight)' }],
        'body2-reading': ['var(--font-body2-size)', { lineHeight: 'var(--font-body2-reading-lh)', letterSpacing: 'var(--font-body2-ls)', fontWeight: 'var(--font-body2-weight)' }],
        label1:    ['var(--font-label1-size)',    { lineHeight: 'var(--font-label1-lh)',    letterSpacing: 'var(--font-label1-ls)',    fontWeight: 'var(--font-label1-weight)' }],
        'label1-reading': ['var(--font-label1-size)', { lineHeight: 'var(--font-label1-reading-lh)', letterSpacing: 'var(--font-label1-ls)', fontWeight: 'var(--font-label1-weight)' }],
        label2:    ['var(--font-label2-size)',    { lineHeight: 'var(--font-label2-lh)',    letterSpacing: 'var(--font-label2-ls)',    fontWeight: 'var(--font-label2-weight)' }],
        caption1:  ['var(--font-caption1-size)',  { lineHeight: 'var(--font-caption1-lh)',  letterSpacing: 'var(--font-caption1-ls)',  fontWeight: 'var(--font-caption1-weight)' }],
        caption2:  ['var(--font-caption2-size)',  { lineHeight: 'var(--font-caption2-lh)',  letterSpacing: 'var(--font-caption2-ls)',  fontWeight: 'var(--font-caption2-weight)' }],
      },

      boxShadow: {
        'normal-xsmall': 'var(--elevation-shadow-normal-xsmall)',
        'normal-small':  'var(--elevation-shadow-normal-small)',
        'normal-medium': 'var(--elevation-shadow-normal-medium)',
        'normal-large':  'var(--elevation-shadow-normal-large)',
        'normal-xlarge': 'var(--elevation-shadow-normal-xlarge)',
        'spread-small':  'var(--elevation-shadow-spread-small)',
        'spread-medium': 'var(--elevation-shadow-spread-medium)',
      },

      borderRadius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
        '2xl':'var(--radius-2xl)',
        full: 'var(--radius-full)',
      },

      zIndex: {
        sticky:   'var(--z-sticky)',
        popover:  'var(--z-popover)',
        tooltip:  'var(--z-tooltip)',
        snackbar: 'var(--z-snackbar)',
        modal:    'var(--z-modal)',
      },

      transitionDuration: {
        fast:   'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow:   'var(--duration-slow)',
        xslow:  'var(--duration-xslow)',
      },

      transitionTimingFunction: {
        standard:   'var(--easing-standard)',
        decelerate: 'var(--easing-decelerate)',
        accelerate: 'var(--easing-accelerate)',
      },

      keyframes: {
        'fade-in':        { from: { opacity: '0' },                              to: { opacity: '1' } },
        'fade-out':       { from: { opacity: '1' },                              to: { opacity: '0' } },
        'zoom-in':        { from: { opacity: '0', transform: 'scale(0.96)' },    to: { opacity: '1', transform: 'scale(1)' } },
        'zoom-out':       { from: { opacity: '1', transform: 'scale(1)' },       to: { opacity: '0', transform: 'scale(0.96)' } },
        'slide-up-in':    { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-up-out':   { from: { opacity: '1', transform: 'translateY(0)' },   to: { opacity: '0', transform: 'translateY(8px)' } },
        'slide-down-in':  { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-down-out': { from: { opacity: '1', transform: 'translateY(0)' },    to: { opacity: '0', transform: 'translateY(-8px)' } },
        'accordion-open':   { from: { height: '0' },       to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-close':  { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
      },

      animation: {
        'fade-in':        'fade-in var(--duration-normal) var(--easing-decelerate) both',
        'fade-out':       'fade-out var(--duration-normal) var(--easing-accelerate) both',
        'zoom-in':        'zoom-in var(--duration-slow) var(--easing-decelerate) both',
        'zoom-out':       'zoom-out var(--duration-normal) var(--easing-accelerate) both',
        'slide-up-in':    'slide-up-in var(--duration-slow) var(--easing-decelerate) both',
        'slide-up-out':   'slide-up-out var(--duration-normal) var(--easing-accelerate) both',
        'slide-down-in':  'slide-down-in var(--duration-normal) var(--easing-decelerate) both',
        'slide-down-out': 'slide-down-out var(--duration-normal) var(--easing-accelerate) both',
        'accordion-open':  'accordion-open var(--duration-normal) var(--easing-decelerate)',
        'accordion-close': 'accordion-close var(--duration-normal) var(--easing-accelerate)',
      },

      spacing: {
        0:  'var(--spacing-0)',
        2:  'var(--spacing-2)',
        4:  'var(--spacing-4)',
        6:  'var(--spacing-6)',
        8:  'var(--spacing-8)',
        10: 'var(--spacing-10)',
        12: 'var(--spacing-12)',
        16: 'var(--spacing-16)',
        20: 'var(--spacing-20)',
        24: 'var(--spacing-24)',
        32: 'var(--spacing-32)',
        40: 'var(--spacing-40)',
        48: 'var(--spacing-48)',
        56: 'var(--spacing-56)',
        64: 'var(--spacing-64)',
        72: 'var(--spacing-72)',
        80: 'var(--spacing-80)',
      },
    },
  },
  plugins: [],
};

export default config;
