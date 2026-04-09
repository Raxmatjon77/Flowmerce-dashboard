# Flowmerce Dashboard

A modern e-commerce admin dashboard built with React, Tailwind CSS, and shadcn/ui components.

## Tech Stack

- **React 18** with React Router 7
- **Vite** — build tool and dev server
- **Tailwind CSS** — utility-first styling
- **shadcn/ui** — component library built on Radix UI primitives
- **Recharts** — data visualization
- **MUI (Material UI)** — additional UI components
- **Framer Motion** — animations
- **React Hook Form** — form management
- **Sonner** — toast notifications

## Pages

| Page | Description |
|------|-------------|
| Overview | Dashboard summary with key metrics |
| Orders | Order management and tracking |
| Inventory | Product inventory management |
| Shipments | Shipment tracking and logistics |
| Payments | Payment history and processing |
| Users | User management |
| Notifications | System notifications |
| Health | System health monitoring |

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Project Structure

```
src/
├── app/
│   ├── components/       # Shared components (UI, layout)
│   │   └── ui/           # shadcn/ui components
│   ├── data/             # Mock data
│   ├── pages/            # Page components
│   └── routes.tsx        # Route definitions
├── styles/               # Global styles and Tailwind config
└── main.tsx              # App entry point
```
