create table users
(
    id serial not null constraint user_pkey primary key,
    username text,
    password text,
    email text,
    image text
);
