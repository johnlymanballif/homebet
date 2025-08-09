# HomeBet MVP 🏠🎮

A fun, social real estate price guessing game that transforms property browsing into an engaging multiplayer experience.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3100](http://localhost:3100)

## Features

- 🎮 Session-based multiplayer (no login required)
- 🏡 Real Utah County property listings
- 💯 Advanced scoring system
- 📱 Mobile-first responsive design
- ✨ Beautiful, modern UI with smooth animations
- 🔗 Shareable game sessions

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

## API Integration

The app is ready to integrate with real estate APIs from RapidAPI:
- US Real Estate Listings API
- Realtor Search API
- Zillow.com API

Currently using mock data for development. Update `src/lib/mockData.ts` with real API calls.

## Game Rules

1. Two players compete to guess property prices
2. Best of 5 properties per game
3. Points awarded based on accuracy (closer = more points)
4. Bonus points for guesses within 5%
5. Perfect guesses earn maximum points (120)

## Deployment

Build for production:
```bash
npm run build
npm start
```

Deploy to Vercel:
```bash
vercel
```

## License

MIT
