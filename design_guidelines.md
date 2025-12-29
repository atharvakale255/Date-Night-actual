# Design Guidelines: Couple's Connection App

## Design Approach

**Reference-Based Design** drawing inspiration from Spotify's playful energy, Instagram's visual intimacy, and dating app aesthetics (Hinge/Bumble) to create an emotionally engaging, modern romantic experience.

**Core Principles:**
- Warmth through soft, rounded elements and generous spacing
- Playfulness via micro-interactions and delightful details
- Intimacy through personalized content and close-up imagery

## Typography

**Font Families:**
- Primary: Poppins (headers, UI elements) - rounded, friendly, modern
- Secondary: Inter (body text, data) - clean, highly readable

**Hierarchy:**
- Hero/Dashboard Title: 3xl to 5xl, semibold
- Section Headers: 2xl, semibold
- Activity Titles: xl, medium
- Body Text: base, regular
- Labels/Metadata: sm, medium

## Layout System

**Spacing Primitives:** Use Tailwind units of 4, 6, 8, 12, 16 for consistent rhythm
- Component padding: p-6 to p-8
- Section spacing: gap-8 to gap-12
- Card margins: space-y-6
- Container max-width: max-w-6xl

## Component Library

### Dashboard Hero
- Full-width gradient background with soft overlay
- Large centered counter displaying "Days Together" or "Hours Spent" with animated numbers
- Couple's photo in circular frame (200px) centered above counter
- Subtle decorative hearts/icons floating around (CSS animations, very subtle)

### Activity Cards (3-column grid on desktop, stack mobile)
Each card features:
- Large rounded corners (rounded-2xl)
- Icon at top (64px, colored accent icons from Heroicons)
- Activity title (xl, semibold)
- Short description (sm text)
- "Start" CTA button (prominent, rounded-full)
- Hover lift effect (subtle shadow increase)

**Three Activities:**
1. **Movie Night**: Film reel icon, "Pick & watch together"
2. **Music Together**: Musical note icon, "Share your favorite songs"
3. **Quizzes**: Lightning bolt icon, "Test how well you know each other"

### Stats Bar (Below hero, above activities)
Horizontal flex container with 3-4 stat boxes:
- Movies watched together
- Songs shared
- Quiz score streak
- Messages sent
Each stat: Large number (2xl, bold) with small label below (sm)

### Recent Activity Feed
Timeline-style layout on right sidebar (desktop) or below activities (mobile):
- Small circular avatars
- Activity descriptions
- Timestamps
- Heart reaction buttons

### Navigation
Top navbar with:
- App logo/name (left)
- Dashboard, Activities, Calendar, Profile links (center)
- Notification bell + couple's avatars (right, small circles overlapping)

### Footer
Minimal centered footer:
- "Made with ❤️" tagline
- Privacy/Terms links
- Social share buttons

## Images

**Hero Section Image:**
- Yes, include large hero background image
- Full-width gradient overlay on couple's photo or romantic abstract imagery (sunset, starry sky, bokeh lights)
- Image should be soft-focused or have romantic treatment
- Centered couple's profile photo (circular, 200px diameter) overlays this background

**Activity Card Images:**
Use icon-based approach instead of photos for cleaner, more scalable design. Icons from Heroicons work perfectly.

**Recent Activity:**
Small thumbnail images (40px circles) showing activity-specific graphics or couple's photos for each entry.

## Animations

Minimal and purposeful only:
- Number counter animation on page load (counting up effect)
- Subtle card hover lift (transform: translateY(-4px))
- Heart pulse on activity completion (scale animation, one-time)
- Loading states: Gentle shimmer effect

## Accessibility

- All interactive elements minimum 44px touch target
- Form inputs with clear labels and error states
- High contrast text throughout (ensure readability)
- Focus states on all interactive elements (ring-2 utility)

## Special Interactions

**Buttons on Images (Hero CTA):**
- Blurred background (backdrop-blur-md)
- Semi-transparent white/dark background
- No special hover states beyond standard button treatment

**Activity Cards:**
- Click entire card to start activity
- Visual feedback on selection (border accent)
- Progress indicators for incomplete activities

## Mobile Considerations

- Stack activity cards vertically (grid-cols-1)
- Collapse stats into 2x2 grid instead of horizontal
- Move activity feed below main content
- Hamburger menu for navigation
- Maintain generous touch targets (min h-12)