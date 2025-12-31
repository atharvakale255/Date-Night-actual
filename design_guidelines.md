# Design Guidelines: LoveSync - Couple's Connection App

## Design Approach

**Reference-Based Design** inspired by Duolingo's playful gamification, Spotify's vibrant energy, and modern fintech apps (Revolut, Cash App) that blend premium feel with fun interactions. Creates an emotionally engaging, game-like romantic experience.

**Core Principles:**
- Premium playfulness through glassmorphism and floating elements
- Vibrant energy via bouncy animations and dynamic interactions
- Game-like progression with rewards, achievements, and delightful feedback

## Typography

**Font Families:**
- Primary: Poppins (all headings, buttons, UI) - rounded, playful, energetic
- Secondary: Inter (body text, descriptions) - clean readability

**Hierarchy:**
- Hero Counter: 6xl to 7xl, bold (animated counting numbers)
- Section Headers: 3xl, semibold
- Card Titles: xl, semibold
- Body Text: base, regular
- Badges/Labels: xs to sm, bold (all caps)

## Layout System

**Spacing Primitives:** Tailwind units of 4, 6, 8, 12, 16, 20
- Card padding: p-8
- Section gaps: gap-12 to gap-16
- Container max-width: max-w-7xl
- Floating element offsets: -top-4, -right-6 variations

## Component Library

### Hero Dashboard
Full-width animated gradient background with large couple's photo (400px circular frame with thick border, floating above with subtle bounce animation on load). Large animated counter showing "Days Together" with sparkle/heart particle effects around numbers. Floating achievement badges (small circles, glassmorphism) positioned around the main counter. Two prominent CTAs below: "Start Activity" and "View Memories" with glassmorphism backgrounds.

### Stats Dashboard (Below hero)
Four stat cards in horizontal grid, each with:
- Glassmorphism card background (rounded-3xl, backdrop blur)
- Large animated icon (floating, subtle rotation)
- Big number display (3xl, bold) with counter animation
- Label below (sm, medium)
- Small progress bar or level indicator at bottom
- Hover: gentle bounce and glow effect

Stats include: Movies Watched, Songs Shared, Quiz Streak, Connection Score

### Activity Cards (2-column grid desktop, stack mobile)
Premium game-like cards with:
- Rounded-3xl borders with subtle gradient edges
- Glassmorphism background layer
- Large floating icon (96px) positioned top-right with gentle float animation
- Activity title (2xl, semibold)
- Description (base text)
- Progress indicator (circular or bar)
- "Play" button with icon (rounded-full, prominent)
- Decorative floating mini-hearts/stars around card
- Hover: lift + scale effect with bouncy spring animation

**Six Core Activities:**
1. Movie Night Roulette (film icon, purple accent)
2. Music Mood Match (musical note, teal accent)
3. Relationship Quiz Battle (lightning, pink accent)
4. Photo Memory Game (camera, purple accent)
5. Date Night Generator (calendar, teal accent)
6. Love Language Test (heart, pink accent)

### Achievement Showcase
Horizontal scrollable row of achievement badges:
- Circular badges (80px) with glassmorphism
- Icons representing milestones
- Locked state (grayscale) vs unlocked (vibrant, animated shine)
- Tooltip on hover showing achievement name
- "Claim Reward" pulse animation for newly unlocked achievements

### Recent Activity Timeline
Left sidebar (desktop) or below activities (mobile):
- Vertical timeline with connecting line
- Glassmorphism cards (rounded-2xl) for each entry
- Small couple avatars (overlapping circles)
- Activity description with timestamp
- Reaction hearts with number count
- Smooth slide-in animation on scroll

### Navigation
Top navbar with glassmorphism:
- Logo with bouncing heart icon
- Center links: Dashboard, Activities, Calendar, Achievements, Profile
- Right side: Notification bell (with badge count), couple's avatars (overlapping with border)
- Sticky on scroll with blur increase

### Floating Elements
Decorative particles throughout:
- Small hearts, stars, sparkles (16-24px) floating in background
- Slow drift animation with occasional pulse
- Semi-transparent, non-intrusive
- Concentrated around hero and achievement areas

### Footer
Centered glassmorphism footer bar:
- "Built with love" tagline with animated heart
- Quick links (Privacy, Terms, Support)
- Social share buttons with bounce on hover

## Images

**Hero Background:** 
Full-width romantic gradient overlay image (sunset, bokeh lights, dreamy landscape). Soft focus with multiple gradient layers for depth. Main couple's photo (circular, 400px) centered with thick decorative border, floating above background with subtle bounce animation.

**Activity Cards:**
Icon-based design using Heroicons for consistency and scalability. Large colorful icons (96px) positioned as floating elements.

**Achievement Badges:**
Icon-based with vibrant accent treatments. Custom decorative frames around each badge.

**Timeline Thumbnails:**
Small circular photos (48px) for each activity entry in recent feed.

## Animations

Embrace playful motion throughout:
- **Page Load:** Hero counter counts up with bounce easing, floating elements fade in with stagger
- **Cards:** Bouncy spring hover (scale 1.05, lift 8px, duration 400ms)
- **Buttons:** Squish effect on click (scale 0.95 → 1.1 → 1.0)
- **Achievements:** Confetti burst animation on unlock, badge shake
- **Stats:** Number counter with rolling effect
- **Floating Elements:** Continuous gentle drift with CSS keyframes
- **Transitions:** Use spring physics (cubic-bezier(0.68, -0.55, 0.265, 1.55))
- **Loading States:** Shimmer with bouncing dots

## Glassmorphism Implementation

Apply to cards, overlays, and navigation:
- backdrop-filter: blur(12px)
- Semi-transparent backgrounds
- Subtle border with gradient
- Inner shadow for depth
- Works on hero CTAs, stat cards, activity cards, navbar, achievement badges

## Accessibility

- Maintain text contrast despite glassmorphism (ensure overlays don't compromise readability)
- All touch targets minimum 48px
- Reduce motion preference: disable bouncy animations, keep functional transitions
- Focus indicators with high contrast rings (ring-4)
- Form inputs with clear labels and inline validation

## Mobile Adaptations

- Stack activity cards (grid-cols-1)
- Reduce floating element density
- Convert timeline to horizontal scroll
- Scale down hero photo to 280px
- Hamburger menu with slide-in drawer (glassmorphism background)
- Touch-optimized spacing (larger gaps between cards)

## Special UI Treatments

**Level/Progress System:**
Display couple's connection level prominently with XP bar, level badges unlock new activities and themes.

**Streak Indicators:**
Flame icons with day count for consecutive activity completion, encouraging daily engagement.

**Celebration Moments:**
Full-screen confetti animation on milestones, achievement unlocks with modal overlay (glassmorphism) showing reward details.