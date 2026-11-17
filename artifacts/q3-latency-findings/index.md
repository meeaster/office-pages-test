# Q3 latency findings

Where the p99 went in September: two slow queries, one cold cache and a retry storm that hid behind a healthy average.

## Summary

| Path | p50 | p99 |
|---|---|---|
| search | 40 ms | 910 ms |
| checkout | 85 ms | 300 ms |

> The average was fine. The tail was not.

```sql
select * from spans where duration_ms > 500;
```

