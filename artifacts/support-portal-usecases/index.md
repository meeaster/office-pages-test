# How the customer support portal works

This page explains who uses the customer support portal and what each of them can do: customers who raise and follow requests, support agents who resolve them, and an admin who runs the portal.

## Use cases

```mermaid
usecase-beta
direction LR
actor Customer
actor Agent("Support agent")
actor Admin
systemBoundary "Support portal"
  SignIn("Sign in")
  Search("Search help articles")
  Open("Open a ticket")
  Track("Track ticket status")
  Reply("Reply to a ticket")
  Rate("Rate the support")
  Queue("Work the ticket queue")
  Assign("Assign a ticket")
  Resolve("Resolve a ticket")
  Write("Write help articles")
  Users("Manage users and roles")
  Rules("Configure routing and SLAs")
  Reports("View reports")
end
Customer --> SignIn
Customer --> Search
Customer --> Open
Customer --> Track
Customer --> Reply
Customer --> Rate
Agent --> SignIn
Agent --> Queue
Agent --> Reply
Agent --> Assign
Agent --> Resolve
Agent --> Write
Admin --> SignIn
Admin --> Users
Admin --> Rules
Admin --> Reports
Admin --> Assign
Open ..> : include SignIn
Resolve ..> : include Reply
```

## Customers

Customers come to the portal for help with a product or an order.

- **Search help articles** before asking, to find an answer straight away.
- **Open a ticket** describing the problem; opening one requires signing in, so the ticket is tied to their account.
- **Track ticket status** to see whether it is new, in progress, waiting on them, or resolved.
- **Reply to a ticket** when an agent asks for more detail.
- **Rate the support** once the ticket is resolved.

## Support agents

Agents handle the tickets customers open.

- **Work the ticket queue**, picking up new and reassigned tickets in priority order.
- **Assign a ticket** to themselves or hand it to a colleague with the right expertise.
- **Reply to a ticket** to ask questions or give an answer.
- **Resolve a ticket** with a final reply that explains the fix.
- **Write help articles** for questions that keep coming up, so customers can solve them on their own.

## Admin

The admin runs the portal rather than individual tickets.

- **Manage users and roles**, adding agents and deciding who can do what.
- **Configure routing and SLAs**: which queue a ticket lands in and how quickly it must be answered.
- **View reports** on ticket volume, response times and customer ratings.
- **Assign a ticket** when one needs escalating or rebalancing between agents.

## A ticket's life

1. A customer searches the help articles and, finding no answer, opens a ticket.
2. Routing rules put it in a queue; an agent picks it up or is assigned it.
3. The agent and customer exchange replies until the problem is fixed.
4. The agent resolves the ticket and the customer rates the support.
5. The admin sees the ticket in reports and adjusts routing or staffing if needed.
