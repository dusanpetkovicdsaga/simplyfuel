# SimplyFuel Product Roadmap

## Current Status: MVP (Minimum Viable Product)

The application has core meal tracking functionality with a mock AI system. Ready for user testing and feedback collection.

---

## ✅ Phase 1: MVP - COMPLETED

### Core Features
- [x] Natural language meal input
- [x] Mock AI meal analysis
- [x] Calorie tracking
- [x] Macro tracking (protein, carbs, fat)
- [x] Daily goal setting
- [x] Meal type categorization (Breakfast, Lunch, Dinner, Snacks)
- [x] Persistent storage (localStorage)
- [x] Mobile-responsive UI
- [x] Bottom navigation
- [x] Toast notifications

### Pages
- [x] Home dashboard with daily overview
- [x] History page (basic structure)
- [x] Progress page (placeholder)
- [x] Profile page (placeholder)

### Technical
- [x] TanStack Start framework setup
- [x] Zustand state management
- [x] File-based routing
- [x] Tailwind CSS styling
- [x] Radix UI components
- [x] TypeScript configuration
- [x] ESLint + Prettier setup

---

## 🚧 Phase 2: Real AI Integration - IN PLANNING

**Goal**: Replace mock AI with actual meal analysis capability

### Backend
- [ ] Set up API endpoint for meal analysis
- [ ] Integrate OpenAI/Claude/Gemini for NLP
- [ ] Build food database or integrate nutrition API
- [ ] Implement portion size detection
- [ ] Add confidence scores for analysis

### Frontend
- [ ] Update `analyzeMeal()` to call real API
- [ ] Add error handling for API failures
- [ ] Show AI confidence indicators
- [ ] Allow manual corrections to AI results
- [ ] Add "Did we get this right?" feedback

### Testing
- [ ] Test with diverse meal descriptions
- [ ] Validate accuracy of nutrition data
- [ ] Performance testing (response times)

**Target**: Complete by Q3 2026

---

## 📊 Phase 3: Enhanced Tracking - PLANNED

**Goal**: Improve data visualization and tracking capabilities

### History Page
- [ ] Calendar view of meals
- [ ] Filter by date range
- [ ] Filter by meal type
- [ ] Search functionality
- [ ] Export data (CSV/PDF)
- [ ] Meal statistics overview

### Progress Page
- [ ] Weekly calorie chart (line graph)
- [ ] Macro distribution pie chart
- [ ] Weight tracking graph
- [ ] Streak counter (consecutive days)
- [ ] Personal records/achievements
- [ ] Goal completion percentage

### Dashboard Enhancements
- [ ] Weekly summary card
- [ ] Quick stats (avg calories, best day)
- [ ] Recent meals quick view
- [ ] Favorite meals shortcut

**Target**: Complete by Q4 2026

---

## 🎯 Phase 4: Advanced Features - FUTURE

### Photo-Based Logging
- [ ] Camera integration
- [ ] Photo upload
- [ ] Image-to-meal analysis
- [ ] Visual meal history
- [ ] Portion size estimation from photos

### Smart Recommendations
- [ ] Suggest meals to hit goals
- [ ] Warn when approaching limits
- [ ] Recommend macro adjustments
- [ ] Meal timing suggestions
- [ ] Recipe recommendations

### Social Features
- [ ] Share meals with friends
- [ ] Community recipes
- [ ] Challenge other users
- [ ] Leaderboards
- [ ] Meal inspiration feed

### Integrations
- [ ] Apple Health sync
- [ ] Google Fit integration
- [ ] Fitness tracker sync (Fitbit, Garmin)
- [ ] Recipe import from websites
- [ ] Restaurant menu integration

**Target**: Q1-Q2 2027

---

## 🔐 Phase 5: User Accounts - ESSENTIAL FOR LAUNCH

**Goal**: Enable multi-device sync and personalization

### Authentication
- [ ] Email/password signup
- [ ] OAuth (Google, Apple)
- [ ] Password recovery
- [ ] Email verification
- [ ] Two-factor authentication

### Backend Infrastructure
- [ ] User database setup
- [ ] API authentication
- [ ] Data encryption
- [ ] GDPR compliance
- [ ] Privacy policy
- [ ] Terms of service

### Profile Management
- [ ] Edit personal info
- [ ] Update goals
- [ ] Preferences/settings
- [ ] Notification settings
- [ ] Data export/deletion
- [ ] Account deletion

### Multi-Device Sync
- [ ] Cloud storage for meals
- [ ] Real-time sync across devices
- [ ] Offline mode with sync
- [ ] Conflict resolution

**Target**: Before public launch

---

## 💎 Phase 6: Premium Features - MONETIZATION

**Goal**: Introduce paid tier with advanced features

### Premium Tier ($4.99/month)
- [ ] Unlimited meal history
- [ ] Advanced analytics
- [ ] Custom macro goals
- [ ] Meal planning
- [ ] Recipe library
- [ ] Ad-free experience
- [ ] Priority AI processing
- [ ] Export all data formats

### Free Tier Limits
- [ ] 30 days history
- [ ] Basic analytics
- [ ] Standard macros
- [ ] Occasional ads

### Payment Integration
- [ ] Stripe setup
- [ ] Subscription management
- [ ] Billing portal
- [ ] Refund handling
- [ ] Free trial (7 days)

**Target**: Q3 2027

---

## 🌍 Phase 7: Internationalization - GLOBAL EXPANSION

### Localization
- [ ] Spanish translation
- [ ] French translation
- [ ] German translation
- [ ] Portuguese translation
- [ ] Multi-language support system

### Regional Features
- [ ] Metric/Imperial units toggle
- [ ] Regional food databases
- [ ] Currency localization
- [ ] Time zone handling
- [ ] Regional nutrition guidelines

**Target**: Q4 2027

---

## 🐛 Known Issues & Technical Debt

### High Priority
- [ ] Error boundary for entire app
- [ ] Loading states for all async operations
- [ ] Optimize bundle size
- [ ] Add service worker for offline support
- [ ] Improve form validation feedback

### Medium Priority
- [ ] Add unit tests for store
- [ ] Add integration tests for flows
- [ ] Improve TypeScript strict mode compliance
- [ ] Add E2E tests with Playwright
- [ ] Performance audit with Lighthouse

### Low Priority
- [ ] Add Storybook for component docs
- [ ] Improve code documentation
- [ ] Add commit hooks (husky)
- [ ] Set up CI/CD pipeline
- [ ] Add visual regression tests

---

## 📈 Success Metrics

### MVP Phase
- [ ] 100 beta users
- [ ] 90%+ accuracy on common meals
- [ ] <3s average meal logging time
- [ ] 70%+ user retention (7 days)

### Growth Phase
- [ ] 10,000 active users
- [ ] 50%+ user retention (30 days)
- [ ] 4.5+ app store rating
- [ ] <100ms API response time
- [ ] 99.9% uptime

### Long Term
- [ ] 100,000+ active users
- [ ] 10%+ conversion to premium
- [ ] Profitable operation
- [ ] Featured in app stores
- [ ] Community-driven growth

---

## 🎨 Design Improvements (Ongoing)

- [ ] Dark mode refinement
- [ ] Animation polish
- [ ] Micro-interactions
- [ ] Accessibility audit (WCAG AA)
- [ ] Color contrast improvements
- [ ] Touch target sizes (44x44px minimum)
- [ ] Keyboard navigation
- [ ] Screen reader optimization

---

## 🔧 Technical Improvements (Ongoing)

- [ ] Migrate to React Server Components
- [ ] Implement code splitting
- [ ] Add CDN for static assets
- [ ] Set up monitoring (Sentry)
- [ ] Add analytics (privacy-friendly)
- [ ] Optimize images (WebP, lazy loading)
- [ ] Add PWA manifest
- [ ] Implement caching strategies

---

## 📝 Documentation (Ongoing)

- [x] Project README
- [x] Contributing guidelines
- [x] Coding standards
- [x] Quick reference guide
- [x] Architecture overview
- [ ] API documentation
- [ ] User guide
- [ ] Video tutorials
- [ ] FAQ
- [ ] Troubleshooting guide

---

## Decision Log

### Why TanStack Start?
- Modern React framework with SSR
- File-based routing
- Excellent TypeScript support
- Active development
- Smaller learning curve than Next.js

### Why Zustand over Redux?
- Simpler API
- Less boilerplate
- Built-in persistence
- Better TypeScript inference
- Sufficient for app complexity

### Why Mock AI First?
- Faster MVP iteration
- No API costs during development
- Easy to swap later
- Allows UI/UX testing
- Defines expected data structure

### Why Tailwind CSS?
- Rapid development
- Consistent design system
- Great mobile support
- Small bundle size with purge
- Active community

---

## Questions & Considerations

### Open Questions
- [ ] Which AI provider for meal analysis?
- [ ] Self-host vs. cloud backend?
- [ ] Native mobile apps or PWA?
- [ ] Pricing model for premium?
- [ ] Partnership with fitness apps?

### Risks
- AI accuracy may vary
- Nutrition data licensing costs
- Competition from established apps
- User privacy concerns
- Scaling costs

### Opportunities
- Photo recognition niche
- Integration with meal kits
- B2B nutrition coaching tools
- Health insurance partnerships
- Corporate wellness programs

---

*This roadmap is a living document. Update as priorities shift.*

Last updated: July 6, 2026
