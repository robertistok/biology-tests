const fs = require("fs");

const pgp = require("./pgp");

const testFileLocation = "../data/questions.txt";

const insertQuestion = ({ content }) =>
  pgp.one(
    `
      INSERT INTO "Question" (content)
      VALUES ($/content/)
      RETURNING *;
    `,
    { content }
  );

const insertAnswer = ({ content, questionId, correct }) =>
  pgp.none(
    `
      INSERT INTO "Answer" (content, "questionId", correct)
      VALUES ($/content/, $/questionId/, $/correct/);
    `,
    { content, questionId, correct }
  );

const runTest = async () => {
  fs.readFile(
    `${__dirname}/../data/questions.txt`,
    "utf8",
    async (err, data) => {
      const rawProblems = data.split("====");
      console.log(rawProblems);
      const parsedProblmes = rawProblems.map(parseProblem).filter(Boolean);

      try {
        await Promise.all(
          parsedProblmes.map(async (problem) => {
            const { question, answers } = problem;

            insertedQuestion = await insertQuestion({ content: question });

            await Promise.all(
              answers.map(({ content, correct }) =>
                insertAnswer({
                  content,
                  questionId: insertedQuestion.id,
                  correct,
                })
              )
            );
          })
        );
      } catch (err) {
        console.log(err);
      }
    }
  );
};

const parseProblem = (p) => {
  const problemSplitted = p.split("\n").filter(Boolean);
  const [question, ...rest] = problemSplitted;
  const correctAnswers = rest.slice(-1)[0].split(",");
  const answers = rest.slice(0, rest.length - 1).map((rawAnswer) => {
    const [rawId, content] = rawAnswer
      .split(/(A. |B. |C. |D. |E. )/)
      .filter(Boolean);

    const id = rawId.replace(". ", "");

    return { id, content, correct: correctAnswers.includes(id) };
  });

  return { question, answers };
};

runTest();
