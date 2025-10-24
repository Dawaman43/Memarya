-- Flashcards
CREATE TABLE IF NOT EXISTS flashcards (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_id integer NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  front varchar(1024) NOT NULL,
  back varchar(2048) NOT NULL,
  created_at timestamp DEFAULT now()
);

-- Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_id integer NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title varchar(256),
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  quiz_id integer NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question varchar(1024) NOT NULL,
  options_json text NOT NULL,
  answer_index integer NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_results (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  course_id integer NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  quiz_id integer NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score integer NOT NULL,
  passed boolean NOT NULL DEFAULT false,
  submitted_at timestamp DEFAULT now()
);
