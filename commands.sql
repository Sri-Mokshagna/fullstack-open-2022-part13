CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    author STRING,
    url STRING NOT NULL,
    title STRING NOT NULL,
    likes INT DEFAULT NULL
);
INSERT INTO blogs (author, url, title) values(
  'HJGYTRD',
  'http://www.www.log',
  'jhdsdjkllkjnhgfgh!'
);
INSERT INTO blogs (author, url, title) values(
  'kjhugyyuhyug',
  'http://assam.stakka.us',
  'grtesdfgh ?'
);
