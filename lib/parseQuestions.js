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

const insertAnswer = ({ content, questionId, valid }) =>
  pgp.none(
    `
      INSERT INTO "Answer" (content, "questionId", valid)
      VALUES ($/content/, $/questionId/, $/valid/);
    `,
    { content, questionId, valid }
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
              answers.map(({ content, valid }) =>
                insertAnswer({
                  content,
                  questionId: insertedQuestion.id,
                  valid,
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
  const validAnswers = rest.slice(-1)[0].split(",");
  const answers = rest.slice(0, rest.length - 1).map((rawAnswer) => {
    const [rawId, content] = rawAnswer
      .split(/(A. |B. |C. |D. |E. )/)
      .filter(Boolean);

    const id = rawId.replace(". ", "");

    return { id, content, valid: validAnswers.includes(id) };
  });

  return { question, answers };
};

runTest();
