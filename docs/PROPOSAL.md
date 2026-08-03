# HomeServe project proposal

## Problem

Home-service customers often face fragmented discovery, uncertain pricing and poor appointment visibility. Providers lose time to unstructured requests and manual scheduling. Administrators need a single operational picture of quality, fulfillment and marketplace growth.

## Product response

HomeServe combines a customer marketplace with dedicated provider and admin workspaces. It makes the service lifecycle explicit: discovery, request, confirmation, in-progress work, completion and follow-up.

## Primary users

- **Customer:** Finds a trusted service, books a slot and tracks the visit.
- **Provider:** Receives qualified requests, manages availability and progresses work.
- **Administrator:** Oversees growth, quality, supply and operational exceptions.

## Product principles

1. Make the next action obvious.
2. Show service trust before asking for commitment.
3. Keep pricing and status visible.
4. Separate public API concerns from persistence concerns.
5. Prefer deterministic business rules over UI-only restrictions.

## Delivery scope

The repository includes a polished responsive UI, public gateway, private ORM service, PostgreSQL schema, seeded demonstration data, tests, Docker and deployment guidance. Payments, mapping, background jobs and production email providers are designed as extension points rather than simulated integrations.
