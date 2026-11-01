# Check-in backend cleanup follow-up

The frontend check-in feature has been retired. This repository contains no SST, Lambda, API
Gateway, or DynamoDB definitions, so no backend resources or stored records were changed.

The former frontend client called `GET /check-ins`, `POST /check-ins`, and
`DELETE /check-ins/{id}`. In a separate backend review, verify whether those routes and their
handlers are used by any other clients before considering retirement. Inspect their authorization,
tests, deployment configuration, and data access dependencies first.

Historical check-in records and DynamoDB tables must remain untouched unless a separate,
explicitly approved data-retention and migration plan is created.
