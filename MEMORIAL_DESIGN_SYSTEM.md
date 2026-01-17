# HereAfter, Pal - Memorial Website Design System

A clean, respectful memorial website with a mobile-first approach that honors loved ones with dignity and elegance.

## 🎨 Design Philosophy

### Core Principles

1. **Emotion First**: Creates a calming, respectful atmosphere that helps users honor and remember their loved ones
2. **Mobile-First**: Prioritizes mobile experience (80% of memorial site visits are mobile)
3. **Minimal & Clean**: Removes visual clutter to focus on memories and stories
4. **Accessible**: Ensures all users can navigate and interact regardless of ability (WCAG AAA compliance)
5. **Timeless**: Avoids trendy elements; aims for classic, enduring design

## 🎨 Color Palette

### Light Mode (Primary)
```css
Background: #FAF9F7       /* Soft warm white - peaceful, paper-like quality */
Surface/Cards: #FFFFFF    /* Pure white with subtle shadows */
Text Primary: #2C2C2C     /* Deep charcoal - readable but not harsh */
Text Secondary: #6B6B6B   /* Warm gray */
Accent: #C9A961          /* Muted gold - dignified, memorial-appropriate */
Dividers: #E8E8E8        /* Very light gray */
```

### Dark Mode (Optional)
```css
Background: #0A0F1C       /* Deep navy blue - peaceful night sky */
Surface: #141B2D          /* Slightly lighter navy */
Text Primary: #F5F5F5     /* Soft white */
Text Secondary: #B0B0B0   /* Light gray */
Accent: #D4AF76          /* Soft amber */
Dividers: #1F2937        /* Dark divider */
```

## 📝 Typography

- **Headings**: `Playfair Display`, `Crimson Text`, or `Lora` (serif fonts) - classic, dignified
- **Body**: `Inter`, `Source Sans Pro` (sans-serif) - modern readability
- **Base Size**: 14px on mobile, 16px on desktop
- **Line Height**: Generous 1.7-1.8 for easy reading
- **Letter Spacing**: Slightly increased (0.02em) on headings for elegance

## 📐 Layout Principles

### Mobile (320px - 768px)
- Single column layout throughout
- Full-width cards with 16px side padding
- Generous whitespace between sections (32px minimum)
- Touch targets: Minimum 44x44px for all interactive elements
- Bottom tab navigation for easy thumb access
- Vertical photo galleries: Stack images with 12px gaps

### Tablet (768px - 1024px)
- Two-column grid where appropriate
- Side padding: 24-32px
- Card-based layouts with subtle elevation

### Desktop (1024px+)
- Max content width: 1200px, centered
- Three-column grid for photo galleries
- Horizontal top navigation
- Hover states: Subtle, respectful interactions

## 🧩 Key Components

### Memorial Profile Page (`/memorial/[id]`)
Complete memorial page featuring:
- **Hero Section**: Full-width memorial photo with name, life dates, and optional quote
- **Biography**: Elegant introduction with "In Loving Memory" heading
- **Timeline**: Vertical timeline with milestone cards (responsive layout)
- **Photo Gallery**: Masonry grid (desktop) / single column (mobile) with lightbox
- **Guestbook**: Message form and card-based message display
- **Navigation**: Bottom tab bar (mobile) / top horizontal nav (desktop)

### Components Created

1. **MemorialHero.js** - Hero section with photo, name, dates, quote, and biography
2. **PhotoGallery.js** - Responsive gallery with lightbox and swipe navigation
3. **Guestbook.js** - Message form and display with loading states
4. **Timeline.js** - Vertical timeline with milestone cards
5. **MemorialNav.js** - Mobile-first navigation (bottom tabs + top nav)
6. **QuickActions.js** - Action cards for homepage
7. **MemorialHomeLanding.js** - Peaceful homepage hero section

## 🎭 Animations & Micro-interactions

All animations are **gentle and respectful**:

- **Page Transitions**: Gentle fades (300ms)
- **Image Loading**: Blur-up effect for progressive loading
- **Scroll Behavior**: Smooth scrolling between sections
- **Hover States**: Subtle opacity changes (0.8-0.9) or slight scale
- **Button Press**: Slight scale down (0.98)
- **Loading States**: Gentle pulsing, not harsh spinners

## ♿ Accessibility Features

- **Contrast**: WCAG AAA compliance (7:1 minimum)
- **Focus States**: Clear 3px gold outline on all interactive elements
- **Screen Reader**: Proper ARIA labels, semantic HTML
- **Keyboard Navigation**: Full site navigable without mouse
- **Text Sizing**: Supports up to 200% zoom without breaking layout
- **Touch Targets**: Minimum 44x44px for all interactive elements

## 📱 Mobile-First Approach

### Mobile Interface Features:
1. **Bottom Tab Navigation**: Easy thumb access to main sections
2. **Single Column Layouts**: Clean, focused content flow
3. **Large Touch Targets**: All buttons minimum 44px height
4. **Optimized Images**: Lazy loading with blur-up effect
5. **Swipe Gestures**: Natural photo gallery navigation
6. **Form Inputs**: Large, accessible input fields

## 🎯 Content Hierarchy

- **Primary**: Name, main photo, life dates
- **Secondary**: Biography, timeline milestones
- **Tertiary**: Photos, guest messages, stories
- **Actions**: Add message, share, print

## 📏 Spacing System

```
4px   - Icon padding, tiny gaps
8px   - Component padding, small gaps
16px  - Card padding, section padding (mobile)
24px  - Section padding (tablet)
32px  - Section gaps (mobile)
48px  - Section gaps (tablet/desktop)
64px  - Major section dividers
```

## 🖼️ Imagery Guidelines

- **Photo Treatment**: Subtle desaturation for cohesive look, 8px rounded corners
- **Icons**: Outline style (Lucide React), consistent 2px stroke width
- **Memorial Icons**: Heart, candle, flower, dove - peaceful symbols

## 🎨 Special Considerations

✅ **Implemented**:
- Print styles for printable memorial pages
- Loading states with gentle animations
- Error messages with compassionate tone
- Success confirmations with warm, grateful messaging
- Dark mode support with peaceful navy theme
- Smooth scroll behavior
- Progressive image loading

❌ **Avoid**:
- Dark, heavy blacks (use charcoal instead)
- Bright, saturated colors
- Busy patterns or backgrounds
- Auto-playing media
- Pop-ups or interruptive elements
- Countdown timers
- Animated GIFs or distracting motion

## 🚀 Getting Started

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

## 📦 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS with custom memorial theme
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Database**: Supabase
- **Fonts**: Google Fonts (Playfair Display, Inter)

## 🗄️ Database Schema

### memorials table
```sql
- id (uuid, primary key)
- name (text)
- date_of_birth (date)
- date_of_passing (date)
- main_photo_url (text)
- quote (text)
- biography (text)
- milestones (jsonb)
- photos (jsonb)
- created_at (timestamp)
```

### guestbook_messages table
```sql
- id (uuid, primary key)
- memorial_id (uuid, foreign key)
- name (text)
- email (text, nullable)
- message (text)
- profile_picture (text, nullable)
- created_at (timestamp)
```

## 🎯 Success Metrics

- Users spend meaningful time (3+ minutes average)
- High completion rate on guestbook entries
- Low bounce rate on memorial pages
- Positive feedback on emotional appropriateness
- Easy navigation (< 3 clicks to any content)

## 📝 Component Usage Examples

### Memorial Profile Page
```jsx
import MemorialHero from '@/components/memorial/MemorialHero';
import PhotoGallery from '@/components/memorial/PhotoGallery';
import Guestbook from '@/components/memorial/Guestbook';
import Timeline from '@/components/memorial/Timeline';

// Use in your memorial page
<MemorialHero memorial={memorialData} />
<Timeline milestones={milestones} />
<PhotoGallery photos={photos} />
<Guestbook messages={messages} onSubmit={handleSubmit} />
```

## 🌟 Design Vision

This design creates a **digital space that feels like a peaceful memorial garden** - a place where people can pause, remember, and honor their loved ones with dignity.

---

**Created with love by HereAfter, Pal** 💙
*Celebrating life. Honoring memory.*
