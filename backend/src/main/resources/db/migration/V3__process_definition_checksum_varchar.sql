-- Hibernate/PostgreSQL schema validation maps Java String to varchar, not bpchar.
ALTER TABLE process_definition_version
    ALTER COLUMN checksum_sha256 TYPE VARCHAR(64);
