CREATE FUNCTION pseudo_encrypt(VALUE bigint) returns bigint AS $$
DECLARE
l1 bigint;
l2 bigint;
r1 bigint;
r2 bigint;
i int:=0;
BEGIN
    l1:= (VALUE >> 32) & 4294967295::bigint;
    r1:= VALUE & 4294967295;
    WHILE i < 3 LOOP
        l2 := r1;
        r2 := l1 # ((((1366.0 * r1 + 150889) % 714025) / 714025.0) * 32767*32767)::int;
        l1 := l2;
        r1 := r2;
        i := i + 1;
    END LOOP;
RETURN ((l1::bigint << 32) + r1);
END;
$$ LANGUAGE plpgsql strict immutable;

CREATE SEQUENCE streams_stream_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 4294967294
	CACHE 1
	NO CYCLE;

CREATE TABLE streams (
	stream_id bigint NOT NULL DEFAULT pseudo_encrypt(nextval('streams_stream_id_seq')),
	public_key varchar(300) NOT NULL,
	category_id smallint NULL,
	title varchar(255) NOT NULL,
	poster_path varchar(255) NULL,
	CONSTRAINT streams_pk PRIMARY KEY (stream_id),
	CONSTRAINT streams_unique_swarm_id UNIQUE (public_key),
	CONSTRAINT streams_fk FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL ON UPDATE CASCADE
);