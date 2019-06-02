CREATE TABLE categories (
	category_id smallint NOT NULL,
	"name" varchar(10) NOT NULL,
	CONSTRAINT categories_pk PRIMARY KEY (category_id),
	CONSTRAINT categories_unique_name UNIQUE ("name")
);
