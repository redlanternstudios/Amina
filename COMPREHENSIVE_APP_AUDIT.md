# AMINA - COMPREHENSIVE APPLICATION AUDIT

**Date:** June 28, 2025  
**Project:** Amina v0/redlanternstudios-079e70d1  
**Framework:** Next.js 16 + React 19  
**UI Framework:** Custom Tailwind CSS (Lucide React icons)  
**Database:** Supabase PostgreSQL  
**Authentication:** Email + Password with JWT  

---

## PROJECT STRUCTURE OVERVIEW

```
amina/
├── app/
│   ├── (app)/              # Protected routes (authenticated users)
│   ├── (auth)/             # Auth routes (onboarding, login)
│   ├── (marketing)/        # Public routes
│   └── api/                # Backend API endpoints
├── components/             # Reusable UI components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and helpers
├── public/                 # Static assets
├── types/                  # TypeScript type definitions
└── supabase/               # Database migrations
```

---

## UI FRAMEWORK & STYLING

**Primary:** Tailwind CSS v4 (Custom Design Tokens)  
**Icons:** Lucide React v0.344.0  
**Components:** Custom built (not shadcn/ui despite common pattern)  
**Theme System:** CSS custom properties in globals.css  
**Colors Used:** Custom Amina brand palette (muted earth tones)

---

