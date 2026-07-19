-- Slice 3: business-write ownership, optimistic locking and immutable audit.

ALTER TABLE nhiem_vu ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE ho_so ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

ALTER TABLE ho_so_tai_lieu
    ADD COLUMN id BIGINT GENERATED ALWAYS AS IDENTITY;
ALTER TABLE ho_so_tai_lieu
    ADD CONSTRAINT pk_ho_so_tai_lieu PRIMARY KEY (id);
ALTER TABLE ho_so_tai_lieu
    ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

CREATE SEQUENCE nhiem_vu_business_seq;
SELECT setval(
    'nhiem_vu_business_seq',
    GREATEST(COALESCE(MAX(NULLIF(regexp_replace(ma, '^.*\.', ''), ma)::INTEGER), 0), 1),
    COUNT(*) > 0
)
FROM nhiem_vu
WHERE ma ~ '^RD\.[0-9]{4}\.[0-9]+$';

CREATE SEQUENCE ho_so_business_seq;
SELECT setval(
    'ho_so_business_seq',
    GREATEST(COALESCE(MAX(NULLIF(regexp_replace(id, '^.*-', ''), id)::INTEGER), 0), 1),
    COUNT(*) > 0
)
FROM ho_so
WHERE id ~ '^HS-[0-9]{4}-[0-9]+$';

CREATE TABLE domain_mutation_audit (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    aggregate_type      VARCHAR(32) NOT NULL,
    aggregate_id        VARCHAR(64) NOT NULL,
    aggregate_version   BIGINT NOT NULL,
    action              VARCHAR(32) NOT NULL,
    actor               VARCHAR(128) NOT NULL,
    occurred_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    detail              VARCHAR(512)
);

CREATE INDEX idx_domain_mutation_audit_aggregate
    ON domain_mutation_audit (aggregate_type, aggregate_id, occurred_at DESC);
