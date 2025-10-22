FROM debian:bookworm-slim AS builder

ARG MYSQLDEF_VERSION=0.17.19

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates tar && \
    curl -sSL https://github.com/sqldef/sqldef/releases/download/v${MYSQLDEF_VERSION}/mysqldef_linux_amd64.tar.gz \
    | tar -xz

FROM alpine:3.20
WORKDIR /migration
COPY --from=builder /mysqldef /usr/local/bin/
COPY . .
RUN chmod +x entrypoint.sh
CMD ["./entrypoint.sh", "/migration/schema.sql"]
