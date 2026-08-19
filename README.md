# CarAdvise Flutter navigation prototype

Interactive working prototype for the proposed three-area CarAdvise navigation:

- **Service** owns planning and current activity.
- **Vehicles** owns maintenance and service history.
- **Account** owns membership, partner benefits, and settings.

The prototype includes repeat, first-time, cross-vehicle approval, same-day service, Canada, Uber Canada, Instacart Canada, and eBay tire-installation cases.

## Product rules represented

- Current activity is account-wide; planning is scoped to one selected vehicle.
- An active appointment, approval, or service-in-progress state disables new booking for that vehicle.
- Other eligible vehicles can still plan service.
- eBay users begin with a preformed installation cart and book an appointment without seeing general service chips.
- Canadian users follow the same structure without unavailable pricing or appointment capabilities.
- Completed service and receipts live with the vehicle record.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Public GitHub Pages deployment is intentionally not enabled because this repository contains internal product concepts. Add a restricted access layer before publishing a hosted copy.
